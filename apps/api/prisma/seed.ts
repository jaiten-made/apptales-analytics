import { generateCuid } from "@apptales/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const session1Id = generateCuid();
  const session2Id = generateCuid();
  // Start the simulated flow 10 minutes ago
  const startTime = new Date(Date.now() - 10 * 60 * 1000);

  // Create a project and use its id for events
  const project = await prisma.project.create({
    data: { name: "Sample Project" },
  });

  // Create some events and attach them to an existing session
  await prisma.event.createMany({
    data: [
      {
        sessionId: session1Id,
        type: "page_view",
        properties: {
          location: {
            pathname: "https://example.com/home",
          },
        },
        projectId: project.id,
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: {},
        projectId: project.id,
      },
      {
        sessionId: session2Id,
        type: "page_view",
        properties: {
          location: {
            pathname: "https://example.com/about",
          },
        },
        projectId: project.id,
      },
      {
        sessionId: session2Id,
        type: "click",
        properties: {},
        projectId: project.id,
      },
      {
        sessionId: session1Id,
        type: "page_view",
        properties: {
          location: {
            pathname: "https://example.com/contact",
          },
        },
        projectId: project.id,
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: {
          elementId: "submit_button",
        },
        projectId: project.id,
      },
      {
        sessionId: session2Id,
        type: "page_view",
        properties: {
          location: {
            pathname: "https://example.com/services",
          },
        },
        projectId: project.id,
      },
      {
        sessionId: session2Id,
        type: "click",
        properties: {
          elementId: "learn_more_button",
        },
        projectId: project.id,
      },
      {
        sessionId: session1Id,
        type: "page_view",
        properties: {
          location: {
            pathname: "https://example.com/products",
          },
        },
        projectId: project.id,
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: {
          elementId: "view_product_button",
        },
        projectId: project.id,
      },
      {
        sessionId: session2Id,
        type: "page_view",
        properties: {
          location: {
            pathname: "https://example.com/blog",
          },
        },
        projectId: project.id,
      },
      {
        sessionId: session2Id,
        type: "click",
        properties: {
          elementId: "read_more_button",
        },
        projectId: project.id,
      },
    ].map((e, i) => ({
      ...e,
      // space events by 30 seconds to simulate real flow
      createdAt: new Date(startTime.getTime() + i * 30_000),
    })),
  });

  console.log("✅ Seed completed! Project ID:", project.id);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
