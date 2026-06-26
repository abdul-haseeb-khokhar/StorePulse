/*
  Warnings:

  - Added the required column `visitorId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "visitorId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Event_siteId_visitorId_idx" ON "Event"("siteId", "visitorId");
