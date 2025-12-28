/*
  Warnings:

  - The values [CUSTOM,ERROR] on the enum `EventCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventCategory_new" AS ENUM ('PAGE_VIEW', 'CLICK');
ALTER TABLE "EventIdentity" ALTER COLUMN "category" TYPE "EventCategory_new" USING ("category"::text::"EventCategory_new");
ALTER TYPE "EventCategory" RENAME TO "EventCategory_old";
ALTER TYPE "EventCategory_new" RENAME TO "EventCategory";
DROP TYPE "public"."EventCategory_old";
COMMIT;
