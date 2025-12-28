/*
  Warnings:

  - Added the required column `category` to the `EventIdentity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('PAGE_VIEW', 'CLICK', 'CUSTOM', 'ERROR');

-- AlterTable
ALTER TABLE "EventIdentity" ADD COLUMN     "category" "EventCategory" NOT NULL;

-- CreateIndex
CREATE INDEX "EventIdentity_category_idx" ON "EventIdentity"("category");
