/*
  Warnings:

  - You are about to drop the column `githubUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `locationCity` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `locationCountry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `locationState` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredJobTitle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredWorkStyle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileVisibility` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resumeFileName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `skillsJson` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "headline" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "workAuth" TEXT,
    "shortSummary" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "preferredRoles" TEXT,
    "preferredLocations" TEXT,
    "resumeUrl" TEXT,
    "profileCompletion" INTEGER,
    "profileUpdatedAt" DATETIME
);
INSERT INTO "new_User" ("email", "emailVerified", "headline", "id", "image", "name", "password", "phone", "preferredLocations", "shortSummary", "workAuth") SELECT "email", "emailVerified", "headline", "id", "image", "name", "password", "phone", "preferredLocations", "shortSummary", "workAuth" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
