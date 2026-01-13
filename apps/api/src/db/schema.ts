import { sql } from "drizzle-orm";
import {
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const customerStatus = pgEnum("CustomerStatus", [
  "ACTIVE",
  "PROVISIONED",
]);
export const eventCategory = pgEnum("EventCategory", ["PAGE_VIEW", "CLICK"]);

// Event payload type definition matching @apptales/types
export const EventPayloadSchema = z.union([
  z.object({
    type: z.literal("page_view"),
    properties: z.object({
      location: z.object({
        pathname: z.string(),
      }),
    }),
  }),
  z.object({
    type: z.string().superRefine((val, ctx) => {
      if (val === "page_view") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Use specific page_view schema for page_view events",
        });
      }
    }),
    properties: z.record(z.unknown()).optional(),
  }),
]);

export type EventPayload = z.infer<typeof EventPayloadSchema>;

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

export const customer = pgTable(
  "Customer",
  {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    status: customerStatus().default("ACTIVE").notNull(),
  },
  (table) => [
    uniqueIndex("Customer_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
  ]
);

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

export const eventIdentity = pgTable(
  "EventIdentity",
  {
    id: text().primaryKey().notNull(),
    key: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    category: eventCategory().notNull(),
  },
  (table) => [
    index("EventIdentity_category_idx").using(
      "btree",
      table.category.asc().nullsLast().op("enum_ops")
    ),
    index("EventIdentity_key_idx").using(
      "btree",
      table.key.asc().nullsLast().op("text_ops")
    ),
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
    index("Session_projectId_idx").using(
      "btree",
      table.projectId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "Session_projectId_fkey",
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
    properties: jsonb("properties")
      .notNull()
      .$type<z.infer<typeof EventPayloadSchema>>(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    eventIdentityId: text().notNull(),
    sessionId: text().notNull(),
  },
  (table) => [
    index("Event_createdAt_idx").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamp_ops")
    ),
    index("Event_eventIdentityId_idx").using(
      "btree",
      table.eventIdentityId.asc().nullsLast().op("text_ops")
    ),
    index("Event_sessionId_createdAt_idx").using(
      "btree",
      table.sessionId.asc().nullsLast().op("timestamp_ops"),
      table.createdAt.asc().nullsLast().op("text_ops")
    ),
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
    uniqueIndex(
      "Transition_fromEventIdentityId_toEventIdentityId_projectId_key"
    ).using(
      "btree",
      table.fromEventIdentityId.asc().nullsLast().op("text_ops"),
      table.toEventIdentityId.asc().nullsLast().op("text_ops"),
      table.projectId.asc().nullsLast().op("text_ops")
    ),
    index("Transition_projectId_fromEventIdentityId_idx").using(
      "btree",
      table.projectId.asc().nullsLast().op("text_ops"),
      table.fromEventIdentityId.asc().nullsLast().op("text_ops")
    ),
    index("Transition_projectId_toEventIdentityId_idx").using(
      "btree",
      table.projectId.asc().nullsLast().op("text_ops"),
      table.toEventIdentityId.asc().nullsLast().op("text_ops")
    ),
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
