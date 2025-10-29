/*
  Warnings:

  - You are about to drop the column `data` on the `Event` table. All the data in the column will be lost.
  - Added the required column `eventDataId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "data",
ADD COLUMN     "eventDataId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "EventData" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EventData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventDataId_fkey" FOREIGN KEY ("eventDataId") REFERENCES "EventData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
