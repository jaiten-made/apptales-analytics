import { SendEventPayload } from "@apptales/types";
import { generateCuid } from "@apptales/utils";
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
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const customerStatus = pgEnum("CustomerStatus", [
  "ACTIVE",
  "PROVISIONED",
]);
export const eventCategory = pgEnum("EventCategory", ["PAGE_VIEW", "CLICK"]);

const generatedId = () =>
  varchar({ length: 128 })
    .primaryKey()
    .unique()
    .$defaultFn(() => generateCuid());

export const customer = pgTable(
  "Customer",
  {
    id: generatedId(),
    email: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    status: customerStatus().default("ACTIVE").notNull(),
  },
  (table) => [uniqueIndex("Customer_email_unique").on(table.email)]
);

export const project = pgTable(
  "Project",
  {
    id: generatedId(),
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

export const eventIdentity = pgTable("EventIdentity", {
  id: generatedId(),
  key: text().notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  category: eventCategory().notNull(),
});

export const session = pgTable(
  "Session",
  {
    id: generatedId(),
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

export const event = pgTable(
  "Event",
  {
    id: generatedId(),
    type: text().notNull(),
    properties: jsonb("properties").notNull().$type<SendEventPayload>(),
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

export const transition = pgTable(
  "Transition",
  {
    id: generatedId(),
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
