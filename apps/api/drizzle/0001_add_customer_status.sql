DO $$ BEGIN
 CREATE TYPE "public"."CustomerStatus" AS ENUM('ACTIVE', 'PROVISIONED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Customer" ADD COLUMN "status" "CustomerStatus" DEFAULT 'ACTIVE' NOT NULL;
--> statement-breakpoint
UPDATE "Customer" SET "status" = 'ACTIVE';