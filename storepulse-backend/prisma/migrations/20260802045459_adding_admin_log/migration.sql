-- CreateTable
CREATE TABLE "adminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adminLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "adminLog_adminId_idx" ON "adminLog"("adminId");

-- CreateIndex
CREATE INDEX "adminLog_targetedUserId_idx" ON "adminLog"("targetedUserId");
