-- CreateTable
CREATE TABLE "TailoredRun" (
    "id" TEXT NOT NULL,
    "resume" TEXT NOT NULL,
    "jd" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TailoredRun_pkey" PRIMARY KEY ("id")
);
