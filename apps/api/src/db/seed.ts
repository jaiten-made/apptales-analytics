import { EventType } from "@apptales/types";
import { generateCuid } from "@apptales/utils";
import { eq } from "drizzle-orm";
import { db, pgClient } from "./index";
import {
  customer,
  eventIdentity as eventIdentityTable,
  event as eventTable,
  project as projectTable,
  session as sessionTable,
} from "./schema";

async function main() {
  console.log("🌱 Starting Drizzle seed...");

  // Ensure demo customer
  const demoEmail = "john.doe@domain.com";
  const existing = await db
    .select()
    .from(customer)
    .where(eq(customer.email, demoEmail))
    .limit(1);
  let demoCustomer: { id: string } | undefined = existing[0];
  if (!demoCustomer) {
    const id = generateCuid();
    await db
      .insert(customer)
      .values({ id, email: demoEmail, status: "ACTIVE" })
      .execute();
    demoCustomer = { id };
  }
  console.log("✅ Demo customer ready", demoCustomer.id);

  // Create demo project (fixed id to match tests)
  const projectId = "cmjpghj9v0004t1h6ch0hwqzs";
  const existingProject = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, projectId))
    .limit(1);
  if (!existingProject[0]) {
    await db
      .insert(projectTable)
      .values({
        id: projectId,
        name: "Demo SaaS App",
        customerId: demoCustomer.id,
      })
      .execute();
  }

  // Sessions
  const sessionIds = Array.from({ length: 7 }, () => generateCuid());
  const sessions = [] as { id: string }[];
  for (const id of sessionIds) {
    const existingSession = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.id, id))
      .limit(1);
    if (!existingSession[0]) {
      await db.insert(sessionTable).values({ id, projectId }).execute();
    }
    sessions.push({ id });
  }

  // Helper to add time offsets
  const addTime = (base: Date, days: number, hours = 0, minutes = 0) =>
    new Date(
      base.getTime() +
        (days * 24 + hours) * 60 * 60 * 1000 +
        minutes * 60 * 1000,
    );

  const baseTime = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Create event identities (idempotent by key)
  async function ensureEventIdentity(
    key: string,
    category: "PAGE_VIEW" | "CLICK",
  ) {
    const found = await db
      .select()
      .from(eventIdentityTable)
      .where(eq(eventIdentityTable.key, key))
      .limit(1);
    if (found[0]) return found[0];
    const id = generateCuid();
    await db.insert(eventIdentityTable).values({ id, key, category }).execute();
    return { id, key, category };
  }

  const landingPage = await ensureEventIdentity("page_view:/", "PAGE_VIEW");
  const featuresPage = await ensureEventIdentity(
    "page_view:/features",
    "PAGE_VIEW",
  );
  const pricingPage = await ensureEventIdentity(
    "page_view:/pricing",
    "PAGE_VIEW",
  );
  const documentationPage = await ensureEventIdentity(
    "page_view:/docs",
    "PAGE_VIEW",
  );
  const aboutPage = await ensureEventIdentity("page_view:/about", "PAGE_VIEW");
  const signupPage = await ensureEventIdentity(
    "page_view:/signup",
    "PAGE_VIEW",
  );
  const loginPage = await ensureEventIdentity("page_view:/login", "PAGE_VIEW");
  const dashboardPage = await ensureEventIdentity(
    "page_view:/dashboard",
    "PAGE_VIEW",
  );
  const onboardingPage = await ensureEventIdentity(
    "page_view:/onboarding",
    "PAGE_VIEW",
  );
  const settingsPage = await ensureEventIdentity(
    "page_view:/settings",
    "PAGE_VIEW",
  );
  const integrationsPage = await ensureEventIdentity(
    "page_view:/integrations",
    "PAGE_VIEW",
  );
  const analyticsPage = await ensureEventIdentity(
    "page_view:/analytics",
    "PAGE_VIEW",
  );
  const billingPage = await ensureEventIdentity(
    "page_view:/billing",
    "PAGE_VIEW",
  );

  const clickGetStarted = await ensureEventIdentity(
    "click:get_started",
    "CLICK",
  );
  const clickViewPricing = await ensureEventIdentity(
    "click:view_pricing",
    "CLICK",
  );
  const clickSeePlans = await ensureEventIdentity("click:see_plans", "CLICK");
  const clickSignup = await ensureEventIdentity("click:signup_button", "CLICK");
  const clickLogin = await ensureEventIdentity("click:login_button", "CLICK");
  const clickTryFreeTrial = await ensureEventIdentity(
    "click:try_free_trial",
    "CLICK",
  );
  const clickReadDocs = await ensureEventIdentity("click:read_docs", "CLICK");
  const clickStartOnboarding = await ensureEventIdentity(
    "click:start_onboarding",
    "CLICK",
  );
  const clickCompleteOnboarding = await ensureEventIdentity(
    "click:complete_onboarding",
    "CLICK",
  );
  const clickConnectIntegration = await ensureEventIdentity(
    "click:connect_integration",
    "CLICK",
  );
  const clickUpgradePlan = await ensureEventIdentity(
    "click:upgrade_plan",
    "CLICK",
  );
  const clickViewAnalytics = await ensureEventIdentity(
    "click:view_analytics",
    "CLICK",
  );
  const clickSaveSettings = await ensureEventIdentity(
    "click:save_settings",
    "CLICK",
  );

  // Build events array following the original timeline
  const events: Array<Record<string, any>> = [];

  // SESSION 1
  const session1Start = addTime(baseTime, 0, 14, 30);
  events.push(
    {
      id: generateCuid(),
      sessionId: sessions[0].id,
      type: EventType.PAGE_VIEW,
      properties: {
        location: { pathname: "/" },
        referrer: "https://google.com/search",
      },
      eventIdentityId: landingPage.id,
      createdAt: addTime(session1Start, 0, 0, 0).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[0].id,
      type: EventType.CLICK,
      properties: { elementId: "get_started", text: "Get Started" },
      eventIdentityId: clickGetStarted.id,
      createdAt: addTime(session1Start, 0, 0, 1.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[0].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/features" } },
      eventIdentityId: featuresPage.id,
      createdAt: addTime(session1Start, 0, 0, 2).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[0].id,
      type: EventType.CLICK,
      properties: { elementId: "view_pricing" },
      eventIdentityId: clickViewPricing.id,
      createdAt: addTime(session1Start, 0, 0, 5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[0].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/pricing" } },
      eventIdentityId: pricingPage.id,
      createdAt: addTime(session1Start, 0, 0, 5.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[0].id,
      type: EventType.CLICK,
      properties: { elementId: "read_docs" },
      eventIdentityId: clickReadDocs.id,
      createdAt: addTime(session1Start, 0, 0, 8).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[0].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/docs" } },
      eventIdentityId: documentationPage.id,
      createdAt: addTime(session1Start, 0, 0, 8.5).toISOString(),
    },
  );

  // SESSION 2
  const session2Start = addTime(baseTime, 2, 10, 15);
  events.push(
    {
      id: generateCuid(),
      sessionId: sessions[1].id,
      type: EventType.PAGE_VIEW,
      properties: {
        location: { pathname: "/" },
        referrer: "https://google.com/search",
      },
      eventIdentityId: landingPage.id,
      createdAt: addTime(session2Start, 0, 0, 0).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[1].id,
      type: EventType.CLICK,
      properties: { elementId: "see_plans" },
      eventIdentityId: clickSeePlans.id,
      createdAt: addTime(session2Start, 0, 0, 0.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[1].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/pricing" } },
      eventIdentityId: pricingPage.id,
      createdAt: addTime(session2Start, 0, 0, 1).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[1].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/about" } },
      eventIdentityId: aboutPage.id,
      createdAt: addTime(session2Start, 0, 0, 3).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[1].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/features" } },
      eventIdentityId: featuresPage.id,
      createdAt: addTime(session2Start, 0, 0, 5).toISOString(),
    },
  );

  // SESSION 3 - Conversion
  const session3Start = addTime(baseTime, 4, 16, 45);
  events.push(
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/" }, referrer: "direct" },
      eventIdentityId: landingPage.id,
      createdAt: addTime(session3Start, 0, 0, 0).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.CLICK,
      properties: { elementId: "try_free_trial" },
      eventIdentityId: clickTryFreeTrial.id,
      createdAt: addTime(session3Start, 0, 0, 0.3).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/signup" } },
      eventIdentityId: signupPage.id,
      createdAt: addTime(session3Start, 0, 0, 0.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.CLICK,
      properties: { elementId: "signup_button" },
      eventIdentityId: clickSignup.id,
      createdAt: addTime(session3Start, 0, 0, 3).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/onboarding" } },
      eventIdentityId: onboardingPage.id,
      createdAt: addTime(session3Start, 0, 0, 3.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.CLICK,
      properties: { elementId: "start_onboarding" },
      eventIdentityId: clickStartOnboarding.id,
      createdAt: addTime(session3Start, 0, 0, 4).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.CLICK,
      properties: { elementId: "complete_onboarding" },
      eventIdentityId: clickCompleteOnboarding.id,
      createdAt: addTime(session3Start, 0, 0, 8).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[2].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session3Start, 0, 0, 8.5).toISOString(),
    },
  );

  // SESSION 4
  const session4Start = addTime(baseTime, 5, 9, 20);
  events.push(
    {
      id: generateCuid(),
      sessionId: sessions[3].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session4Start, 0, 0, 0).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[3].id,
      type: EventType.CLICK,
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session4Start, 0, 0, 0.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[3].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session4Start, 0, 0, 1).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[3].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/settings" } },
      eventIdentityId: settingsPage.id,
      createdAt: addTime(session4Start, 0, 0, 3).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[3].id,
      type: EventType.CLICK,
      properties: { elementId: "save_settings" },
      eventIdentityId: clickSaveSettings.id,
      createdAt: addTime(session4Start, 0, 0, 5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[3].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session4Start, 0, 0, 5.5).toISOString(),
    },
  );

  // SESSION 5
  const session5Start = addTime(baseTime, 7, 15, 0);
  events.push(
    {
      id: generateCuid(),
      sessionId: sessions[4].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session5Start, 0, 0, 0).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[4].id,
      type: EventType.CLICK,
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session5Start, 0, 0, 0.3).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[4].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session5Start, 0, 0, 0.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[4].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/integrations" } },
      eventIdentityId: integrationsPage.id,
      createdAt: addTime(session5Start, 0, 0, 2).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[4].id,
      type: EventType.CLICK,
      properties: { elementId: "connect_integration", integration: "slack" },
      eventIdentityId: clickConnectIntegration.id,
      createdAt: addTime(session5Start, 0, 0, 4).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[4].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session5Start, 0, 0, 6).toISOString(),
    },
  );

  // SESSION 6
  const session6Start = addTime(baseTime, 10, 11, 30);
  events.push(
    {
      id: generateCuid(),
      sessionId: sessions[5].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session6Start, 0, 0, 0).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[5].id,
      type: EventType.CLICK,
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session6Start, 0, 0, 0.3).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[5].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session6Start, 0, 0, 0.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[5].id,
      type: EventType.CLICK,
      properties: { elementId: "view_analytics" },
      eventIdentityId: clickViewAnalytics.id,
      createdAt: addTime(session6Start, 0, 0, 1).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[5].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/analytics" } },
      eventIdentityId: analyticsPage.id,
      createdAt: addTime(session6Start, 0, 0, 1.5).toISOString(),
    },
  );

  // SESSION 7
  const session7Start = addTime(baseTime, 12, 14, 15);
  events.push(
    {
      id: generateCuid(),
      sessionId: sessions[6].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/login" } },
      eventIdentityId: loginPage.id,
      createdAt: addTime(session7Start, 0, 0, 0).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[6].id,
      type: EventType.CLICK,
      properties: { elementId: "login_button" },
      eventIdentityId: clickLogin.id,
      createdAt: addTime(session7Start, 0, 0, 0.3).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[6].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session7Start, 0, 0, 0.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[6].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/pricing" } },
      eventIdentityId: pricingPage.id,
      createdAt: addTime(session7Start, 0, 0, 2).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[6].id,
      type: EventType.CLICK,
      properties: { elementId: "upgrade_plan", plan: "pro" },
      eventIdentityId: clickUpgradePlan.id,
      createdAt: addTime(session7Start, 0, 0, 4).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[6].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/billing" } },
      eventIdentityId: billingPage.id,
      createdAt: addTime(session7Start, 0, 0, 4.5).toISOString(),
    },
    {
      id: generateCuid(),
      sessionId: sessions[6].id,
      type: EventType.PAGE_VIEW,
      properties: { location: { pathname: "/dashboard" } },
      eventIdentityId: dashboardPage.id,
      createdAt: addTime(session7Start, 0, 0, 7).toISOString(),
    },
  );

  // Insert events (idempotency naive - skip if event with same id exists)
  for (const e of events) {
    const found = await db
      .select()
      .from(eventTable)
      .where(eq(eventTable.id, e.id))
      .limit(1);
    if (!found[0]) {
      await db.insert(eventTable).values(e).execute();
    }
  }

  console.log("✅ Seed completed!");
  console.log(`Project: Demo SaaS App (ID: ${projectId})`);
  console.log(`Customer: ${demoEmail} (ID: ${demoCustomer.id})`);
  console.log(`Sessions: ${sessions.length} sessions spanning 14 days`);
  console.log(`Events: ${events.length} total events`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pgClient.end();
    } catch (err) {
      // best-effort close; log but don't rethrow
      console.warn("⚠️ Failed to close Postgres client:", err);
    }
  });
