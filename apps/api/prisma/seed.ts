import { generateCuid } from "@apptales/utils";
import { CustomerStatus, EventCategory, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Seed demo customer
  await prisma.customer.createMany({
    data: [{ email: "john.doe@domain.com", status: CustomerStatus.ACTIVE }],
    skipDuplicates: true,
  });
  const demoCustomer = await prisma.customer.findUnique({
    where: { email: "john.doe@domain.com" },
  });
  if (!demoCustomer) throw new Error("Failed to create/find demo customer");
  console.log("✅ Demo customer seeded");

  // Create demo project
  const project = await prisma.project.create({
    data: {
      id: "cmjpghj9v0004t1h6ch0hwqzs", // fixed to match aps/tracker/test
      name: "Demo SaaS App",
      customerId: demoCustomer.id,
    },
  });

  // Generate session IDs for realistic user journey over 2 weeks
  // Week 1: Initial discovery and exploration (3 sessions)
  // Week 2: Return visits and conversion (4 sessions)
  const sessionIds = Array.from({ length: 7 }, () => generateCuid());

  // Base time: 14 days ago for first session
  const baseTime = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Create event identities for a realistic SaaS product journey
  const landingPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/", category: EventCategory.PAGE_VIEW },
  });
  const featuresPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/features", category: EventCategory.PAGE_VIEW },
  });
  const pricingPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/pricing", category: EventCategory.PAGE_VIEW },
  });
  const documentationPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/docs", category: EventCategory.PAGE_VIEW },
  });
  const aboutPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/about", category: EventCategory.PAGE_VIEW },
  });
  const signupPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/signup", category: EventCategory.PAGE_VIEW },
  });
  const loginPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/login", category: EventCategory.PAGE_VIEW },
  });
  const dashboardPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/dashboard", category: EventCategory.PAGE_VIEW },
  });
  const onboardingPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/onboarding", category: EventCategory.PAGE_VIEW },
  });
  const settingsPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/settings", category: EventCategory.PAGE_VIEW },
  });
  const integrationsPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/integrations", category: EventCategory.PAGE_VIEW },
  });
  const analyticsPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/analytics", category: EventCategory.PAGE_VIEW },
  });
  const billingPage = await prisma.eventIdentity.create({
    data: { key: "page_view:/billing", category: EventCategory.PAGE_VIEW },
  });

  // Click events
  const clickGetStarted = await prisma.eventIdentity.create({
    data: { key: "click:get_started", category: EventCategory.CLICK },
  });
  const clickViewPricing = await prisma.eventIdentity.create({
    data: { key: "click:view_pricing", category: EventCategory.CLICK },
  });
  const clickSeePlans = await prisma.eventIdentity.create({
    data: { key: "click:see_plans", category: EventCategory.CLICK },
  });
  const clickSignup = await prisma.eventIdentity.create({
    data: { key: "click:signup_button", category: EventCategory.CLICK },
  });
  const clickLogin = await prisma.eventIdentity.create({
    data: { key: "click:login_button", category: EventCategory.CLICK },
  });
  const clickTryFreeTrial = await prisma.eventIdentity.create({
    data: { key: "click:try_free_trial", category: EventCategory.CLICK },
  });
  const clickReadDocs = await prisma.eventIdentity.create({
    data: { key: "click:read_docs", category: EventCategory.CLICK },
  });
  const clickStartOnboarding = await prisma.eventIdentity.create({
    data: { key: "click:start_onboarding", category: EventCategory.CLICK },
  });
  const clickCompleteOnboarding = await prisma.eventIdentity.create({
    data: { key: "click:complete_onboarding", category: EventCategory.CLICK },
  });
  const clickConnectIntegration = await prisma.eventIdentity.create({
    data: { key: "click:connect_integration", category: EventCategory.CLICK },
  });
  const clickUpgradePlan = await prisma.eventIdentity.create({
    data: { key: "click:upgrade_plan", category: EventCategory.CLICK },
  });
  const clickViewAnalytics = await prisma.eventIdentity.create({
    data: { key: "click:view_analytics", category: EventCategory.CLICK },
  });
  const clickSaveSettings = await prisma.eventIdentity.create({
    data: { key: "click:save_settings", category: EventCategory.CLICK },
  });

  // Create sessions
  const sessions = await Promise.all(
    sessionIds.map((id) =>
      prisma.session.create({ data: { id, projectId: project.id } })
    )
  );

  // Helper to add time offset
  const addTime = (
    base: Date,
    days: number,
    hours: number = 0,
    minutes: number = 0
  ) =>
    new Date(
      base.getTime() +
        (days * 24 + hours) * 60 * 60 * 1000 +
        minutes * 60 * 1000
    );

  // Create realistic event journey for john.doe@domain.com
  const events = [];
  let eventIndex = 0;

  // SESSION 1: Day 1 (14 days ago) - Initial Discovery (2:30 PM)
  // User discovers product via search, explores landing and features, leaves without signup
  const session1Start = addTime(baseTime, 0, 14, 30);
  events.push(
    // Lands on homepage
    {
      sessionId: sessions[0].id,
      type: "page_view",
      properties: {
        location: { pathname: "/" },
        referrer: "https://google.com/search",
      },
      eventIdentityId: landingPage.id,
      createdAt: addTime(session1Start, 0, 0, 0),
    },
    // Reads about features
    {
      sessionId: sessions[0].id,
      type: "click",
      properties: { elementId: "get_started", text: "Get Started" },
      eventIdentityId: clickGetStarted.id,
      createdAt: addTime(session1Start, 0, 0, 1.5),
    },
    {
      sessionId: sessions[0].id,
      type: "page_view",
      properties: { location: { pathname: "/features" } },
      eventIdentityId: featuresPage.id,
      createdAt: addTime(session1Start, 0, 0, 2),
    },
    // Checks pricing
    {
      sessionId: sessions[0].id,
      type: "click",
      properties: { elementId: "view_pricing" },
      eventIdentityId: clickViewPricing.id,
      createdAt: addTime(session1Start, 0, 0, 5),
    },
    {
      sessionId: sessions[0].id,
      type: "page_view",
      properties: { location: { pathname: "/pricing" } },
      eventIdentityId: pricingPage.id,
      createdAt: addTime(session1Start, 0, 0, 5.5),
    },
    // Browses docs briefly
    {
      sessionId: sessions[0].id,
      type: "click",
      properties: { elementId: "read_docs" },
      eventIdentityId: clickReadDocs.id,
      createdAt: addTime(session1Start, 0, 0, 8),
    },
    {
      sessionId: sessions[0].id,
      type: "page_view",
      properties: { location: { pathname: "/docs" } },
      eventIdentityId: documentationPage.id,
      createdAt: addTime(session1Start, 0, 0, 8.5),
    }
    // Leaves without converting
  );

  // SESSION 2: Day 3 (12 days ago) - Return Visit (10:15 AM)
  // User returns, checks pricing again, explores about page
  const session2Start = addTime(baseTime, 2, 10, 15);
  events.push(
    {
      sessionId: sessions[1].id,
      type: "page_view",
      properties: {
        location: { pathname: "/" },
        referrer: "https://google.com/search",
      },
      eventIdentityId: landingPage.id,
      createdAt: addTime(session2Start, 0, 0, 0),
    },
    {
      sessionId: sessions[1].id,
      type: "click",
      properties: { elementId: "see_plans" },
      eventIdentityId: clickSeePlans.id,
      createdAt: addTime(session2Start, 0, 0, 0.5),
    },
    {
      sessionId: sessions[1].id,
      type: "page_view",
      properties: { location: { pathname: "/pricing" } },
      eventIdentityId: pricingPage.id,
      createdAt: addTime(session2Start, 0, 0, 1),
    },
    {
      sessionId: sessions[1].id,
      type: "page_view",
      properties: { location: { pathname: "/about" } },
      eventIdentityId: aboutPage.id,
      createdAt: addTime(session2Start, 0, 0, 3),
    },
    {
      sessionId: sessions[1].id,
      type: "page_view",
      properties: { location: { pathname: "/features" } },
      eventIdentityId: featuresPage.id,
      createdAt: addTime(session2Start, 0, 0, 5),
    }
  );

  // SESSION 3: Day 5 (9 days ago) - Conversion (4:45 PM)
  // User decides to sign up for free trial
  const session3Start = addTime(baseTime, 4, 16, 45);
  events.push(
    {
      sessionId: sessions[2].id,
      type: "page_view",
      properties: { location: { pathname: "/" }, referrer: "direct" },
      eventIdentityId: landingPage.id,
      createdAt: addTime(session3Start, 0, 0, 0),
    },
    {
      sessionId: sessions[2].id,
      type: "click",
      properties: { elementId: "try_free_trial" },
      eventIdentityId: clickTryFreeTrial.id,
      createdAt: addTime(session3Start, 0, 0, 0.3),
    },
    {
      sessionId: sessions[2].id,
      type: "page_view",
      properties: { location: { pathname: "/signup" } },
      eventIdentityId: signupPage.id,
      createdAt: addTime(session3Start, 0, 0, 0.5),
    },
    {
      sessionId: sessions[2].id,
      type: "click",
      properties: { elementId: "signup_button" },
      eventIdentityId: clickSignup.id,
      createdAt: addTime(session3Start, 0, 0, 3),
    },
    {
      sessionId: sessions[2].id,
      type: "page_view",
      properties: { location: { pathname: "/onboarding" } },
      eventIdentityId: onboardingPage.id,
      createdAt: addTime(session3Start, 0, 0, 3.5),
    },
    {
      sessionId: sessions[2].id,
      type: "click",
      properties: { elementId: "start_onboarding" },
      eventIdentityId: clickStartOnboarding.id,
      createdAt: addTime(session3Start, 0, 0, 4),
    },
    {
      sessionId: sessions[2].id,
      type: "click",
      properties: { elementId: "complete_onboarding" },
      eventIdentityId: clickCompleteOnboarding.id,
      createdAt: addTime(session3Start, 0, 0, 8),
    },
    {
      sessionId: sessions[2].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session3Start, 0, 0, 8.5),
    }
  );

  // SESSION 4: Day 6 (8 days ago) - Active Usage (9:20 AM)
  // User logs back in, explores dashboard and settings
  const session4Start = addTime(baseTime, 5, 9, 20);
  events.push(
    {
      sessionId: sessions[3].id,
      type: "page_view",
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session4Start, 0, 0, 0),
    },
    {
      sessionId: sessions[3].id,
      type: "click",
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session4Start, 0, 0, 0.5),
    },
    {
      sessionId: sessions[3].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session4Start, 0, 0, 1),
    },
    {
      sessionId: sessions[3].id,
      type: "page_view",
      properties: { location: { pathname: "/settings" } },
      eventIdentityId: settingsPage.id,
      createdAt: addTime(session4Start, 0, 0, 3),
    },
    {
      sessionId: sessions[3].id,
      type: "click",
      properties: { elementId: "save_settings" },
      eventIdentityId: clickSaveSettings.id,
      createdAt: addTime(session4Start, 0, 0, 5),
    },
    {
      sessionId: sessions[3].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session4Start, 0, 0, 5.5),
    }
  );

  // SESSION 5: Day 8 (6 days ago) - Integration Setup (3:00 PM)
  // User connects integrations
  const session5Start = addTime(baseTime, 7, 15, 0);
  events.push(
    {
      sessionId: sessions[4].id,
      type: "page_view",
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session5Start, 0, 0, 0),
    },
    {
      sessionId: sessions[4].id,
      type: "click",
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session5Start, 0, 0, 0.3),
    },
    {
      sessionId: sessions[4].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session5Start, 0, 0, 0.5),
    },
    {
      sessionId: sessions[4].id,
      type: "page_view",
      properties: { location: { pathname: "/integrations" } },
      eventIdentityId: integrationsPage.id,
      createdAt: addTime(session5Start, 0, 0, 2),
    },
    {
      sessionId: sessions[4].id,
      type: "click",
      properties: { elementId: "connect_integration", integration: "slack" },
      eventIdentityId: clickConnectIntegration.id,
      createdAt: addTime(session5Start, 0, 0, 4),
    },
    {
      sessionId: sessions[4].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session5Start, 0, 0, 6),
    }
  );

  // SESSION 6: Day 11 (3 days ago) - Analytics Check (11:30 AM)
  // User reviews analytics
  const session6Start = addTime(baseTime, 10, 11, 30);
  events.push(
    {
      sessionId: sessions[5].id,
      type: "page_view",
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session6Start, 0, 0, 0),
    },
    {
      sessionId: sessions[5].id,
      type: "click",
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session6Start, 0, 0, 0.3),
    },
    {
      sessionId: sessions[5].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session6Start, 0, 0, 0.5),
    },
    {
      sessionId: sessions[5].id,
      type: "click",
      properties: { elementId: "view_analytics" },
      eventIdentityId: clickViewAnalytics.id,
      createdAt: addTime(session6Start, 0, 0, 1),
    },
    {
      sessionId: sessions[5].id,
      type: "page_view",
      properties: { location: { pathname: "/analytics" } },
      eventIdentityId: analyticsPage.id,
      createdAt: addTime(session6Start, 0, 0, 1.5),
    }
  );

  // SESSION 7: Day 13 (1 day ago) - Upgrade Consideration (2:15 PM)
  // User considers upgrading, checks billing
  const session7Start = addTime(baseTime, 12, 14, 15);
  events.push(
    {
      sessionId: sessions[6].id,
      type: "page_view",
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session7Start, 0, 0, 0),
    },
    {
      sessionId: sessions[6].id,
      type: "click",
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session7Start, 0, 0, 0.3),
    },
    {
      sessionId: sessions[6].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session7Start, 0, 0, 0.5),
    },
    {
      sessionId: sessions[6].id,
      type: "page_view",
      properties: { location: { pathname: "/pricing" } },
      eventIdentityId: pricingPage.id,
      createdAt: addTime(session7Start, 0, 0, 2),
    },
    {
      sessionId: sessions[6].id,
      type: "click",
      properties: { elementId: "upgrade_plan", plan: "pro" },
      eventIdentityId: clickUpgradePlan.id,
      createdAt: addTime(session7Start, 0, 0, 4),
    },
    {
      sessionId: sessions[6].id,
      type: "page_view",
      properties: { location: { pathname: "/billing" } },
      eventIdentityId: billingPage.id,
      createdAt: addTime(session7Start, 0, 0, 4.5),
    },
    {
      sessionId: sessions[6].id,
      type: "page_view",
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session7Start, 0, 0, 7),
    }
  );

  // Insert all events
  await prisma.event.createMany({ data: events });

  // Insert all events
  await prisma.event.createMany({ data: events });

  console.log("✅ Seed completed!");
  console.log(`Project: Demo SaaS App (ID: ${project.id})`);
  console.log(`Customer: john.doe@domain.com (ID: ${demoCustomer.id})`);
  console.log(`Sessions: 7 sessions spanning 14 days`);
  console.log(`Events: ${events.length} total events`);
  console.log(`\nUser Journey:`);
  console.log(`- Day 1: Initial discovery (landing, features, pricing, docs)`);
  console.log(`- Day 3: Return visit (exploring pricing and about)`);
  console.log(`- Day 5: Conversion (signup + onboarding)`);
  console.log(
    `- Days 6-13: Active usage (dashboard, settings, integrations, analytics)`
  );
  console.log(`- Day 13: Considering upgrade (pricing, billing)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
