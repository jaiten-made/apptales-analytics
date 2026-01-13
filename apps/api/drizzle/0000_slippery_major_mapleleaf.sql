-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."CustomerStatus" AS ENUM('ACTIVE', 'PROVISIONED');--> statement-breakpoint
CREATE TYPE "public"."EventCategory" AS ENUM('PAGE_VIEW', 'CLICK');--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Customer" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"status" "CustomerStatus" DEFAULT 'ACTIVE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"customerId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"properties" jsonb NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"eventIdentityId" text NOT NULL,
	"sessionId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"projectId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Transition" (
	"id" text PRIMARY KEY NOT NULL,
	"fromEventIdentityId" text NOT NULL,
	"toEventIdentityId" text NOT NULL,
	"projectId" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"percentage" double precision DEFAULT 0 NOT NULL,
	"avgDurationMs" integer,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EventIdentity" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"category" "EventCategory" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventIdentityId_fkey" FOREIGN KEY ("eventIdentityId") REFERENCES "public"."EventIdentity"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_fromEventIdentityId_fkey" FOREIGN KEY ("fromEventIdentityId") REFERENCES "public"."EventIdentity"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_toEventIdentityId_fkey" FOREIGN KEY ("toEventIdentityId") REFERENCES "public"."EventIdentity"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "Event_createdAt_idx" ON "Event" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Event_eventIdentityId_idx" ON "Event" USING btree ("eventIdentityId" text_ops);--> statement-breakpoint
CREATE INDEX "Event_sessionId_createdAt_idx" ON "Event" USING btree ("sessionId" timestamp_ops,"createdAt" text_ops);--> statement-breakpoint
CREATE INDEX "Session_projectId_idx" ON "Session" USING btree ("projectId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Transition_fromEventIdentityId_toEventIdentityId_projectId_key" ON "Transition" USING btree ("fromEventIdentityId" text_ops,"toEventIdentityId" text_ops,"projectId" text_ops);--> statement-breakpoint
CREATE INDEX "Transition_projectId_fromEventIdentityId_idx" ON "Transition" USING btree ("projectId" text_ops,"fromEventIdentityId" text_ops);--> statement-breakpoint
CREATE INDEX "Transition_projectId_toEventIdentityId_idx" ON "Transition" USING btree ("projectId" text_ops,"toEventIdentityId" text_ops);--> statement-breakpoint
CREATE INDEX "EventIdentity_category_idx" ON "EventIdentity" USING btree ("category" enum_ops);--> statement-breakpoint
CREATE INDEX "EventIdentity_key_idx" ON "EventIdentity" USING btree ("key" text_ops);
*/