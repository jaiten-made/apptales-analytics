#!/usr/bin/env node

/**
 * Script to compute transitions for all projects
 * Run this after deploying the transition feature to populate initial data
 *
 * Usage:
 *   node scripts/compute-transitions.js
 *   node scripts/compute-transitions.js --project-id=abc123
 */

import { prisma } from "../src/lib/prisma/client.js";
import {
  computeAllProjectTransitions,
  computeTransitionsForProject,
} from "../src/services/transitionJob.js";

async function main() {
  const args = process.argv.slice(2);
  const projectIdArg = args.find((arg) => arg.startsWith("--project-id="));

  if (projectIdArg) {
    // Compute for specific project
    const projectId = projectIdArg.split("=")[1];
    console.log(`Computing transitions for project: ${projectId}`);

    try {
      await computeTransitionsForProject(projectId);
      console.log("✓ Transitions computed successfully");
    } catch (error) {
      console.error("✗ Failed to compute transitions:", error);
      process.exit(1);
    }
  } else {
    // Compute for all projects
    console.log("Computing transitions for all projects...");

    try {
      await computeAllProjectTransitions();
      console.log("✓ All transitions computed successfully");
    } catch (error) {
      console.error("✗ Failed to compute transitions:", error);
      process.exit(1);
    }
  }

  await prisma.$disconnect();
}

main();
