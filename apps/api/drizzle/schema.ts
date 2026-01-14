import { sql } from "drizzle-orm";
import {
  doublePrecision,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const customerStatus = pgEnum("CustomerStatus", [
  "ACTIVE",
  "PROVISIONED",
]);
export const eventCategory = pgEnum("EventCategory", ["PAGE_VIEW", "CLICK"]);

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar({ length: 36 }).primaryKey().notNull(),
  checksum: varchar({ length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text(),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const customer = pgTable("Customer", {
  id: text().primaryKey().notNull(),
  email: text().notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  status: customerStatus().default("ACTIVE").notNull(),
});

export const project = pgTable(
  "Project",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    customerId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customer.id],
      name: "Project_customerId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const event = pgTable(
  "Event",
  {
    id: text().primaryKey().notNull(),
    type: text().notNull(),
    properties: jsonb().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    eventIdentityId: text().notNull(),
    sessionId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.eventIdentityId],
      foreignColumns: [eventIdentity.id],
      name: "Event_eventIdentityId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [session.id],
      name: "Event_sessionId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const session = pgTable(
  "Session",
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    projectId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "Session_projectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const transition = pgTable(
  "Transition",
  {
    id: text().primaryKey().notNull(),
    fromEventIdentityId: text().notNull(),
    toEventIdentityId: text().notNull(),
    projectId: text().notNull(),
    count: integer().default(1).notNull(),
    percentage: doublePrecision().default(0).notNull(),
    avgDurationMs: integer(),
    updatedAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.fromEventIdentityId],
      foreignColumns: [eventIdentity.id],
      name: "Transition_fromEventIdentityId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.toEventIdentityId],
      foreignColumns: [eventIdentity.id],
      name: "Transition_toEventIdentityId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "Transition_projectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const eventIdentity = pgTable("EventIdentity", {
  id: text().primaryKey().notNull(),
  key: text().notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  category: eventCategory().notNull(),
});
