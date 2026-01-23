CREATE TYPE "public"."CustomerStatus" AS ENUM('ACTIVE', 'PROVISIONED');--> statement-breakpoint
CREATE TYPE "public"."EventCategory" AS ENUM('PAGE_VIEW', 'CLICK');--> statement-breakpoint
CREATE TABLE "Customer" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"status" "CustomerStatus" DEFAULT 'ACTIVE' NOT NULL,
	CONSTRAINT "Customer_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"properties" jsonb NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"eventIdentityId" text NOT NULL,
	"sessionId" text NOT NULL,
	CONSTRAINT "Event_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "EventIdentity" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"category" "EventCategory" NOT NULL,
	CONSTRAINT "EventIdentity_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"customerId" text NOT NULL,
	CONSTRAINT "Project_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"projectId" text NOT NULL,
	CONSTRAINT "Session_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Transition" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"fromEventIdentityId" text NOT NULL,
	"toEventIdentityId" text NOT NULL,
	"projectId" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"percentage" double precision DEFAULT 0 NOT NULL,
	"avgDurationMs" integer,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "Transition_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventIdentityId_fkey" FOREIGN KEY ("eventIdentityId") REFERENCES "public"."EventIdentity"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_fromEventIdentityId_fkey" FOREIGN KEY ("fromEventIdentityId") REFERENCES "public"."EventIdentity"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_toEventIdentityId_fkey" FOREIGN KEY ("toEventIdentityId") REFERENCES "public"."EventIdentity"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Customer_email_unique" ON "Customer" USING btree ("email");