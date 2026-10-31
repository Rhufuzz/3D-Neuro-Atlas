-- CreateTable
CREATE TABLE "SampleExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampleExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SampleExamAttempt_userId_createdAt_idx" ON "SampleExamAttempt"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "SampleExamAttempt" ADD CONSTRAINT "SampleExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

