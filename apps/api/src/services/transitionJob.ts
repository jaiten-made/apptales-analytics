import { db } from "../db/index";
import { project } from "../db/schema";
import { computeTransitionsForProject } from "./transition";

/**
 * Background job that computes transitions for all projects
 * This should be scheduled to run periodically (e.g., every hour)
 */
export async function computeAllProjectTransitions(): Promise<void> {
  console.log(
    "[TransitionJob] Starting transition computation for all projects"
  );

  try {
    // Get all projects
    const projects = await db
      .select({
        id: project.id,
        name: project.name,
      })
      .from(project);

    console.log(`[TransitionJob] Found ${projects.length} projects to process`);

    // Process each project
    for (const proj of projects) {
      try {
        console.log(
          `[TransitionJob] Computing transitions for project: ${proj.name} (${proj.id})`
        );
        await computeTransitionsForProject(proj.id);
        console.log(
          `[TransitionJob] Completed transitions for project: ${proj.name}`
        );
      } catch (error) {
        console.error(
          `[TransitionJob] Failed to compute transitions for project ${proj.id}:`,
          error
        );
        // Continue with next project even if one fails
      }
    }

    console.log(
      "[TransitionJob] Completed transition computation for all projects"
    );
  } catch (error) {
    console.error(
      "[TransitionJob] Fatal error during transition computation:",
      error
    );
    throw error;
  }
}

/**
 * Computes transitions for projects that have had recent activity
 * More efficient than processing all projects
 */
export async function computeRecentProjectTransitions(
  hoursThreshold: number = 24
): Promise<void> {
  console.log(
    `[TransitionJob] Computing transitions for projects active in last ${hoursThreshold} hours`
  );

  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold);

    // Find projects with recent events
    const projectsWithRecentActivity = await prisma.project.findMany({
      where: {
        sessions: {
          some: {
            events: {
              some: {
                createdAt: {
                  gte: cutoffDate,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(
      `[TransitionJob] Found ${projectsWithRecentActivity.length} active projects`
    );

    for (const project of projectsWithRecentActivity) {
      try {
        console.log(
          `[TransitionJob] Computing transitions for active project: ${project.name}`
        );
        await computeTransitionsForProject(project.id);
      } catch (error) {
        console.error(
          `[TransitionJob] Failed for project ${project.id}:`,
          error
        );
      }
    }

    console.log(
      "[TransitionJob] Completed transition computation for active projects"
    );
  } catch (error) {
    console.error("[TransitionJob] Fatal error:", error);
    throw error;
  }
}

/**
 * Example cron job setup (pseudo-code)
 *
 * Using node-cron:
 *
 * import cron from 'node-cron';
 *
 * // Run every hour
 * cron.schedule('0 * * * *', async () => {
 *   await computeRecentProjectTransitions(24);
 * });
 *
 * // Run full computation daily at 2 AM
 * cron.schedule('0 2 * * *', async () => {
 *   await computeAllProjectTransitions();
 * });
 *
 * Using BullMQ or similar queue:
 *
 * import { Queue, Worker } from 'bullmq';
 *
 * const transitionQueue = new Queue('transitions');
 *
 * // Schedule recurring job
 * await transitionQueue.add(
 *   'compute-transitions',
 *   {},
 *   { repeat: { pattern: '0 * * * *' } }
 * );
 *
 * // Worker to process jobs
 * const worker = new Worker('transitions', async (job) => {
 *   if (job.name === 'compute-transitions') {
 *     await computeRecentProjectTransitions(24);
 *   }
 * });
 */
