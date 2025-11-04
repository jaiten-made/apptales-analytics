import { generateCuid } from "@apptales/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create multiple session IDs to simulate different users
  const session1Id = generateCuid();
  const session2Id = generateCuid();
  const session3Id = generateCuid();
  const session4Id = generateCuid();
  const session5Id = generateCuid();

  // Start the simulated flow 10 minutes ago
  const startTime = new Date(Date.now() - 10 * 60 * 1000);

  // Create a project and use its id for events
  const project = await prisma.project.create({
    data: { name: "Sample Project" },
  });

  // Create event identities for unique events
  const pageViewHome = await prisma.eventIdentity.create({
    data: { key: "page_view:/home", projectId: project.id },
  });

  const pageViewAbout = await prisma.eventIdentity.create({
    data: { key: "page_view:/about", projectId: project.id },
  });

  const pageViewContact = await prisma.eventIdentity.create({
    data: { key: "page_view:/contact", projectId: project.id },
  });

  const pageViewServices = await prisma.eventIdentity.create({
    data: { key: "page_view:/services", projectId: project.id },
  });

  const pageViewProducts = await prisma.eventIdentity.create({
    data: { key: "page_view:/products", projectId: project.id },
  });

  const pageViewBlog = await prisma.eventIdentity.create({
    data: { key: "page_view:/blog", projectId: project.id },
  });

  const pageViewPricing = await prisma.eventIdentity.create({
    data: { key: "page_view:/pricing", projectId: project.id },
  });

  const pageViewCheckout = await prisma.eventIdentity.create({
    data: { key: "page_view:/checkout", projectId: project.id },
  });

  const pageViewThankYou = await prisma.eventIdentity.create({
    data: { key: "page_view:/thank-you", projectId: project.id },
  });

  const clickSubmitButton = await prisma.eventIdentity.create({
    data: { key: "click:submit_button", projectId: project.id },
  });

  const clickLearnMoreButton = await prisma.eventIdentity.create({
    data: { key: "click:learn_more_button", projectId: project.id },
  });

  const clickViewProductButton = await prisma.eventIdentity.create({
    data: { key: "click:view_product_button", projectId: project.id },
  });

  const clickReadMoreButton = await prisma.eventIdentity.create({
    data: { key: "click:read_more_button", projectId: project.id },
  });

  const clickSignupButton = await prisma.eventIdentity.create({
    data: { key: "click:signup_button", projectId: project.id },
  });

  const clickBuyNowButton = await prisma.eventIdentity.create({
    data: { key: "click:buy_now_button", projectId: project.id },
  });

  const clickGeneric = await prisma.eventIdentity.create({
    data: { key: "click:generic", projectId: project.id },
  });

  // Create events across multiple sessions with realistic user journeys
  await prisma.event.createMany({
    data: [
      // Session 1: Home -> Products -> Pricing -> Checkout -> Thank You (conversion)
      {
        sessionId: session1Id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        projectId: project.id,
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: { elementId: "view_product_button" },
        projectId: project.id,
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: session1Id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        projectId: project.id,
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        projectId: project.id,
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: session1Id,
        type: "page_view",
        properties: { location: { pathname: "/pricing" } },
        projectId: project.id,
        eventIdentityId: pageViewPricing.id,
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: { elementId: "signup_button" },
        projectId: project.id,
        eventIdentityId: clickSignupButton.id,
      },
      {
        sessionId: session1Id,
        type: "page_view",
        properties: { location: { pathname: "/checkout" } },
        projectId: project.id,
        eventIdentityId: pageViewCheckout.id,
      },
      {
        sessionId: session1Id,
        type: "click",
        properties: { elementId: "submit_button" },
        projectId: project.id,
        eventIdentityId: clickSubmitButton.id,
      },
      {
        sessionId: session1Id,
        type: "page_view",
        properties: { location: { pathname: "/thank-you" } },
        projectId: project.id,
        eventIdentityId: pageViewThankYou.id,
      },

      // Session 2: Home -> About -> Services -> Contact (drop-off)
      {
        sessionId: session2Id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        projectId: project.id,
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: session2Id,
        type: "click",
        properties: { elementId: "learn_more_button" },
        projectId: project.id,
        eventIdentityId: clickLearnMoreButton.id,
      },
      {
        sessionId: session2Id,
        type: "page_view",
        properties: { location: { pathname: "/about" } },
        projectId: project.id,
        eventIdentityId: pageViewAbout.id,
      },
      {
        sessionId: session2Id,
        type: "click",
        properties: {},
        projectId: project.id,
        eventIdentityId: clickGeneric.id,
      },
      {
        sessionId: session2Id,
        type: "page_view",
        properties: { location: { pathname: "/services" } },
        projectId: project.id,
        eventIdentityId: pageViewServices.id,
      },
      {
        sessionId: session2Id,
        type: "click",
        properties: { elementId: "submit_button" },
        projectId: project.id,
        eventIdentityId: clickSubmitButton.id,
      },
      {
        sessionId: session2Id,
        type: "page_view",
        properties: { location: { pathname: "/contact" } },
        projectId: project.id,
        eventIdentityId: pageViewContact.id,
      },

      // Session 3: Home -> Products -> Pricing (drop-off at pricing)
      {
        sessionId: session3Id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        projectId: project.id,
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: session3Id,
        type: "click",
        properties: { elementId: "view_product_button" },
        projectId: project.id,
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: session3Id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        projectId: project.id,
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: session3Id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        projectId: project.id,
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: session3Id,
        type: "page_view",
        properties: { location: { pathname: "/pricing" } },
        projectId: project.id,
        eventIdentityId: pageViewPricing.id,
      },

      // Session 4: Home -> Blog -> Products -> Checkout -> Thank You (conversion via blog)
      {
        sessionId: session4Id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        projectId: project.id,
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: session4Id,
        type: "click",
        properties: { elementId: "read_more_button" },
        projectId: project.id,
        eventIdentityId: clickReadMoreButton.id,
      },
      {
        sessionId: session4Id,
        type: "page_view",
        properties: { location: { pathname: "/blog" } },
        projectId: project.id,
        eventIdentityId: pageViewBlog.id,
      },
      {
        sessionId: session4Id,
        type: "click",
        properties: { elementId: "view_product_button" },
        projectId: project.id,
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: session4Id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        projectId: project.id,
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: session4Id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        projectId: project.id,
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: session4Id,
        type: "page_view",
        properties: { location: { pathname: "/checkout" } },
        projectId: project.id,
        eventIdentityId: pageViewCheckout.id,
      },
      {
        sessionId: session4Id,
        type: "click",
        properties: { elementId: "submit_button" },
        projectId: project.id,
        eventIdentityId: clickSubmitButton.id,
      },
      {
        sessionId: session4Id,
        type: "page_view",
        properties: { location: { pathname: "/thank-you" } },
        projectId: project.id,
        eventIdentityId: pageViewThankYou.id,
      },

      // Session 5: Home -> About -> Products -> Pricing -> Checkout (drop-off at checkout)
      {
        sessionId: session5Id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        projectId: project.id,
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: session5Id,
        type: "click",
        properties: { elementId: "learn_more_button" },
        projectId: project.id,
        eventIdentityId: clickLearnMoreButton.id,
      },
      {
        sessionId: session5Id,
        type: "page_view",
        properties: { location: { pathname: "/about" } },
        projectId: project.id,
        eventIdentityId: pageViewAbout.id,
      },
      {
        sessionId: session5Id,
        type: "click",
        properties: { elementId: "view_product_button" },
        projectId: project.id,
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: session5Id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        projectId: project.id,
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: session5Id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        projectId: project.id,
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: session5Id,
        type: "page_view",
        properties: { location: { pathname: "/pricing" } },
        projectId: project.id,
        eventIdentityId: pageViewPricing.id,
      },
      {
        sessionId: session5Id,
        type: "click",
        properties: { elementId: "signup_button" },
        projectId: project.id,
        eventIdentityId: clickSignupButton.id,
      },
      {
        sessionId: session5Id,
        type: "page_view",
        properties: { location: { pathname: "/checkout" } },
        projectId: project.id,
        eventIdentityId: pageViewCheckout.id,
      },
    ].map((e, i) => ({
      ...e,
      // space events by 15 seconds to simulate real flow
      createdAt: new Date(startTime.getTime() + i * 15_000),
    })),
  });

  console.log("✅ Seed completed!");
  console.log(`Project ID: ${project.id}`);
  console.log(
    `Created 5 sessions with overlapping paths for path exploration testing`
  );
  console.log(`Event patterns:`);
  console.log(`- 2 conversions (sessions 1, 4)`);
  console.log(`- 3 drop-offs at different stages (sessions 2, 3, 5)`);
  console.log(`- Common paths: Home -> Products, Products -> Pricing`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
