-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Banned', 'Inactive');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'Active';
