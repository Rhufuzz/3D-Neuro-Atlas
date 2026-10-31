-- CreateTable
CREATE TABLE "LearnStepProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "goalIndex" INTEGER NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearnStepProgress_userId_idx" ON "LearnStepProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnStepProgress_userId_moduleId_stepIndex_key" ON "LearnStepProgress"("userId", "moduleId", "stepIndex");

-- CreateIndex
CREATE INDEX "GoalProgress_userId_idx" ON "GoalProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoalProgress_userId_moduleId_goalIndex_key" ON "GoalProgress"("userId", "moduleId", "goalIndex");

-- AddForeignKey
ALTER TABLE "LearnStepProgress" ADD CONSTRAINT "LearnStepProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalProgress" ADD CONSTRAINT "GoalProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

