import { generateCuid } from "@apptales/utils";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../db/index";
import { event, eventIdentity, session, transition } from "../db/schema";

/**
 * Represents a single event in a session sequence
 */
interface EventSequence {
  eventIdentityId: string;
  eventIdentityKey: string;
  createdAt: Date;
}

/**
 * Represents a transition pair between two events
 */
interface TransitionPair {
  fromEventIdentityId: string;
  toEventIdentityId: string;
  durationMs: number;
}

/**
 * Collapses consecutive duplicate events in a sequence
 * Example: [A, A, B, C, C, C, B] -> [A, B, C, B]
 */
function collapseConsecutiveDuplicates(
  events: EventSequence[],
): EventSequence[] {
  if (events.length === 0) return [];

  const collapsed: EventSequence[] = [events[0]];

  for (let i = 1; i < events.length; i++) {
    const currentEvent = events[i];
    const lastCollapsedEvent = collapsed[collapsed.length - 1];

    // Only add if different from previous event
    if (currentEvent.eventIdentityId !== lastCollapsedEvent.eventIdentityId) {
      collapsed.push(currentEvent);
    }
  }

  return collapsed;
}

/**
 * Extracts transition pairs from a collapsed event sequence
 */
function extractTransitionPairs(
  collapsedEvents: EventSequence[],
): TransitionPair[] {
  const pairs: TransitionPair[] = [];

  for (let i = 0; i < collapsedEvents.length - 1; i++) {
    const fromEvent = collapsedEvents[i];
    const toEvent = collapsedEvents[i + 1];

    const durationMs =
      toEvent.createdAt.getTime() - fromEvent.createdAt.getTime();

    pairs.push({
      fromEventIdentityId: fromEvent.eventIdentityId,
      toEventIdentityId: toEvent.eventIdentityId,
      durationMs,
    });
  }

  return pairs;
}

/**
 * Aggregates transition pairs into counts and average durations
 */
function aggregateTransitions(
  pairs: TransitionPair[],
): Map<
  string,
  { fromId: string; toId: string; count: number; totalDurationMs: number }
> {
  const aggregated = new Map<
    string,
    { fromId: string; toId: string; count: number; totalDurationMs: number }
  >();

  for (const pair of pairs) {
    const key = `${pair.fromEventIdentityId}->${pair.toEventIdentityId}`;

    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.count += 1;
      existing.totalDurationMs += pair.durationMs;
    } else {
      aggregated.set(key, {
        fromId: pair.fromEventIdentityId,
        toId: pair.toEventIdentityId,
        count: 1,
        totalDurationMs: pair.durationMs,
      });
    }
  }

  return aggregated;
}

/**
 * Calculates transition percentages for all outgoing transitions from each event
 */
async function calculateTransitionPercentages(
  projectId: string,
): Promise<void> {
  // Get all transitions for the project
  const transitions = await db
    .select({
      id: transition.id,
      fromEventIdentityId: transition.fromEventIdentityId,
      count: transition.count,
    })
    .from(transition)
    .where(eq(transition.projectId, projectId));

  // Group by source event and calculate totals
  const sourceEventTotals = new Map<string, number>();
  for (const trans of transitions) {
    const currentTotal = sourceEventTotals.get(trans.fromEventIdentityId) || 0;
    sourceEventTotals.set(
      trans.fromEventIdentityId,
      currentTotal + trans.count,
    );
  }

  // Update percentages
  const updates = transitions.map(async (trans) => {
    const total = sourceEventTotals.get(trans.fromEventIdentityId) || 1;
    const percentage = (trans.count / total) * 100;

    return db
      .update(transition)
      .set({ percentage })
      .where(eq(transition.id, trans.id));
  });

  await Promise.all(updates);
}

/**
 * Processes all sessions for a project and computes transitions
 * This is the main entry point for the transition computation
 */
export async function computeTransitionsForProject(
  projectId: string,
): Promise<void> {
  // Fetch all sessions with their events, ordered by timestamp
  const sessions = await db.query.session.findMany({
    where: eq(session.projectId, projectId),
    with: {
      events: {
        columns: {
          eventIdentityId: true,
          createdAt: true,
        },
        with: {
          eventIdentity: {
            columns: {
              key: true,
            },
          },
        },
        orderBy: [asc(event.createdAt)],
      },
    },
  });

  // Process each session to extract transition pairs
  const allTransitionPairs: TransitionPair[] = [];

  for (const sess of sessions) {
    if (sess.events.length < 2) continue; // Need at least 2 events for a transition

    const eventSequence: EventSequence[] = sess.events.map((ev) => ({
      eventIdentityId: ev.eventIdentityId,
      eventIdentityKey: ev.eventIdentity.key,
      createdAt: new Date(ev.createdAt),
    }));

    // Step 1: Collapse consecutive duplicates
    const collapsedSequence = collapseConsecutiveDuplicates(eventSequence);

    // Step 2: Extract transition pairs
    const sessionPairs = extractTransitionPairs(collapsedSequence);
    allTransitionPairs.push(...sessionPairs);
  }

  // Step 3: Aggregate all transition pairs
  const aggregated = aggregateTransitions(allTransitionPairs);

  // Step 4: Upsert transitions to database
  const upsertPromises = Array.from(aggregated.values()).map(async (agg) => {
    const avgDurationMs = Math.round(agg.totalDurationMs / agg.count);

    // Check if transition exists
    const existing = await db
      .select()
      .from(transition)
      .where(
        and(
          eq(transition.fromEventIdentityId, agg.fromId),
          eq(transition.toEventIdentityId, agg.toId),
          eq(transition.projectId, projectId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(transition)
        .set({
          count: agg.count,
          avgDurationMs,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(transition.id, existing[0].id));
    } else {
      // Create new
      await db.insert(transition).values({
        id: generateCuid(),
        fromEventIdentityId: agg.fromId,
        toEventIdentityId: agg.toId,
        projectId,
        count: agg.count,
        avgDurationMs,
      });
    }
  });

  await Promise.all(upsertPromises);

  // Step 5: Calculate percentages
  await calculateTransitionPercentages(projectId);
}

/**
 * Incrementally updates transitions for a specific session
 * Used when new events arrive in real-time
 */
export async function updateTransitionsForSession(
  sessionId: string,
): Promise<void> {
  // Fetch the session with its events
  const sess = await db.query.session.findFirst({
    where: eq(session.id, sessionId),
    with: {
      events: {
        columns: {
          eventIdentityId: true,
          createdAt: true,
        },
        with: {
          eventIdentity: {
            columns: {
              key: true,
            },
          },
        },
        orderBy: [asc(event.createdAt)],
      },
    },
  });

  if (!sess || sess.events.length < 2) return;

  const eventSequence: EventSequence[] = sess.events.map((ev) => ({
    eventIdentityId: ev.eventIdentityId,
    eventIdentityKey: ev.eventIdentity.key,
    createdAt: new Date(ev.createdAt),
  }));

  // Collapse and extract pairs
  const collapsedSequence = collapseConsecutiveDuplicates(eventSequence);
  const pairs = extractTransitionPairs(collapsedSequence);

  // Aggregate
  const aggregated = aggregateTransitions(pairs);

  // Upsert transitions
  const upsertPromises = Array.from(aggregated.values()).map(async (agg) => {
    const avgDurationMs = Math.round(agg.totalDurationMs / agg.count);

    // Check if transition exists
    const existing = await db
      .select()
      .from(transition)
      .where(
        and(
          eq(transition.fromEventIdentityId, agg.fromId),
          eq(transition.toEventIdentityId, agg.toId),
          eq(transition.projectId, sess.projectId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing - increment count
      await db
        .update(transition)
        .set({
          count: existing[0].count + agg.count,
          avgDurationMs,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(transition.id, existing[0].id));
    } else {
      // Create new
      await db.insert(transition).values({
        id: generateCuid(),
        fromEventIdentityId: agg.fromId,
        toEventIdentityId: agg.toId,
        projectId: sess.projectId,
        count: agg.count,
        avgDurationMs,
      });
    }
  });

  await Promise.all(upsertPromises);

  // Recalculate percentages for affected events
  await calculateTransitionPercentages(sess.projectId);
}

/**
 * Gets the top N transitions from a specific anchor event
 */
export async function getTopTransitionsFromEvent(
  projectId: string,
  anchorEventIdentityId: string,
  topN: number = 5,
): Promise<
  Array<{
    toEvent: {
      id: string;
      key: string;
    };
    count: number;
    percentage: number;
    avgDurationMs: number | null;
  }>
> {
  const transitions = await db
    .select({
      id: transition.id,
      count: transition.count,
      percentage: transition.percentage,
      avgDurationMs: transition.avgDurationMs,
      toEventId: eventIdentity.id,
      toEventKey: eventIdentity.key,
    })
    .from(transition)
    .innerJoin(
      eventIdentity,
      eq(transition.toEventIdentityId, eventIdentity.id),
    )
    .where(
      and(
        eq(transition.projectId, projectId),
        eq(transition.fromEventIdentityId, anchorEventIdentityId),
      ),
    )
    .orderBy(desc(transition.count))
    .limit(topN);

  return transitions.map((t) => ({
    toEvent: {
      id: t.toEventId,
      key: t.toEventKey,
    },
    count: t.count,
    percentage: t.percentage,
    avgDurationMs: t.avgDurationMs,
  }));
}

/**
 * Gets the top N transitions leading to a specific anchor event (backward)
 */
export async function getTopTransitionsToEvent(
  projectId: string,
  anchorEventIdentityId: string,
  topN: number = 5,
): Promise<
  Array<{
    fromEvent: {
      id: string;
      key: string;
    };
    count: number;
    percentage: number;
    avgDurationMs: number | null;
  }>
> {
  const transitions = await db
    .select({
      id: transition.id,
      count: transition.count,
      percentage: transition.percentage,
      avgDurationMs: transition.avgDurationMs,
      fromEventId: eventIdentity.id,
      fromEventKey: eventIdentity.key,
    })
    .from(transition)
    .innerJoin(
      eventIdentity,
      eq(transition.fromEventIdentityId, eventIdentity.id),
    )
    .where(
      and(
        eq(transition.projectId, projectId),
        eq(transition.toEventIdentityId, anchorEventIdentityId),
      ),
    )
    .orderBy(desc(transition.count))
    .limit(topN);

  return transitions.map((t) => ({
    fromEvent: {
      id: t.fromEventId,
      key: t.fromEventKey,
    },
    count: t.count,
    percentage: t.percentage,
    avgDurationMs: t.avgDurationMs,
  }));
}
