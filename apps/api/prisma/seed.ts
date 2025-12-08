import { generateCuid } from "@apptales/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Seed customers (3 sample customers) — provide explicit emails and make reseeding safe
  const customersData = [
    { email: "primary@example.com" },
    { email: "user2@example.com" },
    { email: "user3@example.com" },
  ];
  await prisma.customer.createMany({
    data: customersData,
    skipDuplicates: true,
  });
  const primaryCustomer = await prisma.customer.findUnique({
    where: { email: "primary@example.com" },
  });
  if (!primaryCustomer)
    throw new Error("Failed to create/find primary customer");
  console.log("✅ Customers seeded");

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
    data: { name: "Sample Project", customerId: primaryCustomer.id },
  });

  // EventIdentity now has no projectId relation
  const pageViewHome = await prisma.eventIdentity.create({
    data: { key: "page_view:/home" },
  });
  const pageViewAbout = await prisma.eventIdentity.create({
    data: { key: "page_view:/about" },
  });
  const pageViewContact = await prisma.eventIdentity.create({
    data: { key: "page_view:/contact" },
  });
  const pageViewServices = await prisma.eventIdentity.create({
    data: { key: "page_view:/services" },
  });
  const pageViewProducts = await prisma.eventIdentity.create({
    data: { key: "page_view:/products" },
  });
  const pageViewBlog = await prisma.eventIdentity.create({
    data: { key: "page_view:/blog" },
  });
  const pageViewPricing = await prisma.eventIdentity.create({
    data: { key: "page_view:/pricing" },
  });
  const pageViewCheckout = await prisma.eventIdentity.create({
    data: { key: "page_view:/checkout" },
  });
  const pageViewThankYou = await prisma.eventIdentity.create({
    data: { key: "page_view:/thank-you" },
  });
  const clickSubmitButton = await prisma.eventIdentity.create({
    data: { key: "click:submit_button" },
  });
  const clickLearnMoreButton = await prisma.eventIdentity.create({
    data: { key: "click:learn_more_button" },
  });
  const clickViewProductButton = await prisma.eventIdentity.create({
    data: { key: "click:view_product_button" },
  });
  const clickReadMoreButton = await prisma.eventIdentity.create({
    data: { key: "click:read_more_button" },
  });
  const clickSignupButton = await prisma.eventIdentity.create({
    data: { key: "click:signup_button" },
  });
  const clickBuyNowButton = await prisma.eventIdentity.create({
    data: { key: "click:buy_now_button" },
  });
  const clickGeneric = await prisma.eventIdentity.create({
    data: { key: "click:generic" },
  });

  // Create Session records (Events now reference Session.id)
  const s1 = await prisma.session.create({
    data: { id: session1Id, projectId: project.id },
  });
  const s2 = await prisma.session.create({
    data: { id: session2Id, projectId: project.id },
  });
  const s3 = await prisma.session.create({
    data: { id: session3Id, projectId: project.id },
  });
  const s4 = await prisma.session.create({
    data: { id: session4Id, projectId: project.id },
  });
  const s5 = await prisma.session.create({
    data: { id: session5Id, projectId: project.id },
  });

  // Create events across multiple sessions with realistic user journeys (removed projectId, sessionId now Session.id)
  await prisma.event.createMany({
    data: [
      // Session 1: Home -> Products -> Pricing -> Checkout -> Thank You (conversion)
      {
        sessionId: s1.id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: s1.id,
        type: "click",
        properties: { elementId: "view_product_button" },
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: s1.id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: s1.id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: s1.id,
        type: "page_view",
        properties: { location: { pathname: "/pricing" } },
        eventIdentityId: pageViewPricing.id,
      },
      {
        sessionId: s1.id,
        type: "click",
        properties: { elementId: "signup_button" },
        eventIdentityId: clickSignupButton.id,
      },
      {
        sessionId: s1.id,
        type: "page_view",
        properties: { location: { pathname: "/checkout" } },
        eventIdentityId: pageViewCheckout.id,
      },
      {
        sessionId: s1.id,
        type: "click",
        properties: { elementId: "submit_button" },
        eventIdentityId: clickSubmitButton.id,
      },
      {
        sessionId: s1.id,
        type: "page_view",
        properties: { location: { pathname: "/thank-you" } },
        eventIdentityId: pageViewThankYou.id,
      },

      // Session 2: Home -> About -> Services -> Contact (drop-off)
      {
        sessionId: s2.id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: s2.id,
        type: "click",
        properties: { elementId: "learn_more_button" },
        eventIdentityId: clickLearnMoreButton.id,
      },
      {
        sessionId: s2.id,
        type: "page_view",
        properties: { location: { pathname: "/about" } },
        eventIdentityId: pageViewAbout.id,
      },
      {
        sessionId: s2.id,
        type: "click",
        properties: {},
        eventIdentityId: clickGeneric.id,
      },
      {
        sessionId: s2.id,
        type: "page_view",
        properties: { location: { pathname: "/services" } },
        eventIdentityId: pageViewServices.id,
      },
      {
        sessionId: s2.id,
        type: "click",
        properties: { elementId: "submit_button" },
        eventIdentityId: clickSubmitButton.id,
      },
      {
        sessionId: s2.id,
        type: "page_view",
        properties: { location: { pathname: "/contact" } },
        eventIdentityId: pageViewContact.id,
      },

      // Session 3: Home -> Products -> Pricing (drop-off at pricing)
      {
        sessionId: s3.id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: s3.id,
        type: "click",
        properties: { elementId: "view_product_button" },
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: s3.id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: s3.id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: s3.id,
        type: "page_view",
        properties: { location: { pathname: "/pricing" } },
        eventIdentityId: pageViewPricing.id,
      },

      // Session 4: Home -> Blog -> Products -> Checkout -> Thank You (conversion via blog)
      {
        sessionId: s4.id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: s4.id,
        type: "click",
        properties: { elementId: "read_more_button" },
        eventIdentityId: clickReadMoreButton.id,
      },
      {
        sessionId: s4.id,
        type: "page_view",
        properties: { location: { pathname: "/blog" } },
        eventIdentityId: pageViewBlog.id,
      },
      {
        sessionId: s4.id,
        type: "click",
        properties: { elementId: "view_product_button" },
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: s4.id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: s4.id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: s4.id,
        type: "page_view",
        properties: { location: { pathname: "/checkout" } },
        eventIdentityId: pageViewCheckout.id,
      },
      {
        sessionId: s4.id,
        type: "click",
        properties: { elementId: "submit_button" },
        eventIdentityId: clickSubmitButton.id,
      },
      {
        sessionId: s4.id,
        type: "page_view",
        properties: { location: { pathname: "/thank-you" } },
        eventIdentityId: pageViewThankYou.id,
      },

      // Session 5: Home -> About -> Products -> Pricing -> Checkout (drop-off at checkout)
      {
        sessionId: s5.id,
        type: "page_view",
        properties: { location: { pathname: "/home" } },
        eventIdentityId: pageViewHome.id,
      },
      {
        sessionId: s5.id,
        type: "click",
        properties: { elementId: "learn_more_button" },
        eventIdentityId: clickLearnMoreButton.id,
      },
      {
        sessionId: s5.id,
        type: "page_view",
        properties: { location: { pathname: "/about" } },
        eventIdentityId: pageViewAbout.id,
      },
      {
        sessionId: s5.id,
        type: "click",
        properties: { elementId: "view_product_button" },
        eventIdentityId: clickViewProductButton.id,
      },
      {
        sessionId: s5.id,
        type: "page_view",
        properties: { location: { pathname: "/products" } },
        eventIdentityId: pageViewProducts.id,
      },
      {
        sessionId: s5.id,
        type: "click",
        properties: { elementId: "buy_now_button" },
        eventIdentityId: clickBuyNowButton.id,
      },
      {
        sessionId: s5.id,
        type: "page_view",
        properties: { location: { pathname: "/pricing" } },
        eventIdentityId: pageViewPricing.id,
      },
      {
        sessionId: s5.id,
        type: "click",
        properties: { elementId: "signup_button" },
        eventIdentityId: clickSignupButton.id,
      },
      {
        sessionId: s5.id,
        type: "page_view",
        properties: { location: { pathname: "/checkout" } },
        eventIdentityId: pageViewCheckout.id,
      },
    ].map((e, i) => ({
      ...e,
      createdAt: new Date(startTime.getTime() + i * 15_000),
    })),
  });

  console.log("✅ Seed completed!");
  console.log(`Project ID: ${project.id}`);
  console.log(`Primary Customer ID: ${primaryCustomer.id}`);
  console.log(`Customers seeded: 3`);
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
