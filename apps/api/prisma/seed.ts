import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create sessions with events
  const session1 = await prisma.session.create({
    data: {
      events: {
        create: [
          {
            type: "page_view",
            properties: {
              page: "/home",
              url: "https://example.com/home",
              referrer: "https://google.com",
            },
          },
          {
            type: "click",
            properties: {
              element: "button",
              text: "Get Started",
              position: { x: 100, y: 200 },
            },
          },
          {
            type: "page_view",
            properties: {
              page: "/pricing",
              url: "https://example.com/pricing",
            },
          },
        ],
      },
    },
    include: {
      events: true,
    },
  });

  const session2 = await prisma.session.create({
    data: {
      events: {
        create: [
          {
            type: "page_view",
            properties: {
              page: "/features",
              url: "https://example.com/features",
            },
          },
          {
            type: "click",
            properties: {
              element: "link",
              text: "Learn More",
              position: { x: 150, y: 250 },
            },
          },
        ],
      },
    },
    include: {
      events: true,
    },
  });

  // Create some events and attach them to an existing session
  await prisma.event.createMany({
    data: [
      {
        type: "page_view",
        properties: {
          page: "/about",
          url: "https://example.com/about",
        },
        sessionId: session2.id,
      },
      {
        type: "click",
        properties: {
          element: "button",
          text: "Sign Up",
          position: { x: 200, y: 300 },
        },
        sessionId: session2.id,
      },
    ],
  });

  console.log("✅ Seed completed!");
  console.log(
    `Created ${session1.events.length} events in session ${session1.id}`
  );
  console.log(
    `Created ${session2.events.length} events in session ${session2.id}`
  );
  console.log(`Added 2 more events to session ${session2.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
