/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `Site` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "publicDashboardEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Site_publicToken_key" ON "Site"("publicToken");
