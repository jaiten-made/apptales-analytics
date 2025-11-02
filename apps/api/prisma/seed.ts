import { generateCuid } from "@apptales/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const session1Id = generateCuid();
  const session2Id = generateCuid();

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
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: {},
      },
      {
        sessionId: session2Id,
        type: "page_view",
        properties: {
          location: {
            pathname: "https://example.com/about",
          },
        },
      },
      {
        sessionId: session2Id,
        type: "click",
        properties: {},
      },
    ],
  });

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
