ALTER TABLE "Customer" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "Event" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "EventIdentity" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "Project" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "Transition" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "EventIdentity" ADD CONSTRAINT "EventIdentity_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_id_unique" UNIQUE("id");