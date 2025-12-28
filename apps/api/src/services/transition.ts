import { prisma } from "../lib/prisma/client";

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
  events: EventSequence[]
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
  collapsedEvents: EventSequence[]
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
  pairs: TransitionPair[]
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
  projectId: string
): Promise<void> {
  // Get all transitions for the project
  const transitions = await prisma.transition.findMany({
    where: { projectId },
    select: {
      id: true,
      fromEventIdentityId: true,
      count: true,
    },
  });

  // Group by source event and calculate totals
  const sourceEventTotals = new Map<string, number>();
  for (const transition of transitions) {
    const currentTotal =
      sourceEventTotals.get(transition.fromEventIdentityId) || 0;
    sourceEventTotals.set(
      transition.fromEventIdentityId,
      currentTotal + transition.count
    );
  }

  // Update percentages
  const updates = transitions.map((transition) => {
    const total = sourceEventTotals.get(transition.fromEventIdentityId) || 1;
    const percentage = (transition.count / total) * 100;

    return prisma.transition.update({
      where: { id: transition.id },
      data: { percentage },
    });
  });

  await prisma.$transaction(updates);
}

/**
 * Processes all sessions for a project and computes transitions
 * This is the main entry point for the transition computation
 */
export async function computeTransitionsForProject(
  projectId: string
): Promise<void> {
  // Fetch all sessions with their events, ordered by timestamp
  const sessions = await prisma.session.findMany({
    where: { projectId },
    include: {
      events: {
        select: {
          eventIdentityId: true,
          createdAt: true,
          eventIdentity: {
            select: {
              key: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  // Process each session to extract transition pairs
  const allTransitionPairs: TransitionPair[] = [];

  for (const session of sessions) {
    if (session.events.length < 2) continue; // Need at least 2 events for a transition

    const eventSequence: EventSequence[] = session.events.map((event) => ({
      eventIdentityId: event.eventIdentityId,
      eventIdentityKey: event.eventIdentity.key,
      createdAt: event.createdAt,
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
  const upsertPromises = Array.from(aggregated.values()).map((agg) => {
    const avgDurationMs = Math.round(agg.totalDurationMs / agg.count);

    return prisma.transition.upsert({
      where: {
        fromEventIdentityId_toEventIdentityId_projectId: {
          fromEventIdentityId: agg.fromId,
          toEventIdentityId: agg.toId,
          projectId,
        },
      },
      create: {
        fromEventIdentityId: agg.fromId,
        toEventIdentityId: agg.toId,
        projectId,
        count: agg.count,
        avgDurationMs,
      },
      update: {
        count: agg.count,
        avgDurationMs,
        updatedAt: new Date(),
      },
    });
  });

  await prisma.$transaction(upsertPromises);

  // Step 5: Calculate percentages
  await calculateTransitionPercentages(projectId);
}

/**
 * Incrementally updates transitions for a specific session
 * Used when new events arrive in real-time
 */
export async function updateTransitionsForSession(
  sessionId: string
): Promise<void> {
  // Fetch the session with its events
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      events: {
        select: {
          eventIdentityId: true,
          createdAt: true,
          eventIdentity: {
            select: {
              key: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!session || session.events.length < 2) return;

  const eventSequence: EventSequence[] = session.events.map((event) => ({
    eventIdentityId: event.eventIdentityId,
    eventIdentityKey: event.eventIdentity.key,
    createdAt: event.createdAt,
  }));

  // Collapse and extract pairs
  const collapsedSequence = collapseConsecutiveDuplicates(eventSequence);
  const pairs = extractTransitionPairs(collapsedSequence);

  // Aggregate
  const aggregated = aggregateTransitions(pairs);

  // Upsert transitions
  const upsertPromises = Array.from(aggregated.values()).map((agg) => {
    const avgDurationMs = Math.round(agg.totalDurationMs / agg.count);

    return prisma.transition.upsert({
      where: {
        fromEventIdentityId_toEventIdentityId_projectId: {
          fromEventIdentityId: agg.fromId,
          toEventIdentityId: agg.toId,
          projectId: session.projectId,
        },
      },
      create: {
        fromEventIdentityId: agg.fromId,
        toEventIdentityId: agg.toId,
        projectId: session.projectId,
        count: agg.count,
        avgDurationMs,
      },
      update: {
        count: { increment: agg.count },
        avgDurationMs, // This could be improved with a running average
        updatedAt: new Date(),
      },
    });
  });

  await prisma.$transaction(upsertPromises);

  // Recalculate percentages for affected events
  await calculateTransitionPercentages(session.projectId);
}

/**
 * Gets the top N transitions from a specific anchor event
 */
export async function getTopTransitionsFromEvent(
  projectId: string,
  anchorEventIdentityId: string,
  topN: number = 5
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
  const transitions = await prisma.transition.findMany({
    where: {
      projectId,
      fromEventIdentityId: anchorEventIdentityId,
    },
    include: {
      toEventIdentity: {
        select: {
          id: true,
          key: true,
        },
      },
    },
    orderBy: {
      count: "desc",
    },
    take: topN,
  });

  return transitions.map((t) => ({
    toEvent: {
      id: t.toEventIdentity.id,
      key: t.toEventIdentity.key,
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
  topN: number = 5
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
  const transitions = await prisma.transition.findMany({
    where: {
      projectId,
      toEventIdentityId: anchorEventIdentityId,
    },
    include: {
      fromEventIdentity: {
        select: {
          id: true,
          key: true,
        },
      },
    },
    orderBy: {
      count: "desc",
    },
    take: topN,
  });

  return transitions.map((t) => ({
    fromEvent: {
      id: t.fromEventIdentity.id,
      key: t.fromEventIdentity.key,
    },
    count: t.count,
    percentage: t.percentage,
    avgDurationMs: t.avgDurationMs,
  }));
}
