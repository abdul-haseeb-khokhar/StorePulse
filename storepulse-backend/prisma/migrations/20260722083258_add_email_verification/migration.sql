-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendingEmail" TEXT,
ADD COLUMN     "pendingEmailToken" TEXT,
ADD COLUMN     "pendingEmailTokenExpiry" TEXT;
