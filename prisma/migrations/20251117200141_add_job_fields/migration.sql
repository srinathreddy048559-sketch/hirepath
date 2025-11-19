-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "jobType" TEXT NOT NULL DEFAULT 'Full-time',
    "workMode" TEXT NOT NULL DEFAULT 'Onsite',
    "salaryRange" TEXT,
    "tags" TEXT,
    "employment" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "postedById" TEXT NOT NULL,
    CONSTRAINT "Job_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("company", "createdAt", "description", "employment", "id", "location", "postedById", "requirements", "title") SELECT "company", "createdAt", "description", "employment", "id", "location", "postedById", "requirements", "title" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
