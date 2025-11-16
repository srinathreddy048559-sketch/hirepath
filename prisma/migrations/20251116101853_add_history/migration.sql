/*
  Warnings:

  - You are about to drop the column `jdText` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `outputText` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `resumeText` on the `History` table. All the data in the column will be lost.
  - Added the required column `jd` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resume` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tailored` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_History" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "jd" TEXT NOT NULL,
    "resume" TEXT NOT NULL,
    "tailored" TEXT NOT NULL
);
INSERT INTO "new_History" ("createdAt", "id") SELECT "createdAt", "id" FROM "History";
DROP TABLE "History";
ALTER TABLE "new_History" RENAME TO "History";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
