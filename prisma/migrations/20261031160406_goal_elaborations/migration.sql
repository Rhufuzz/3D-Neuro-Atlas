-- CreateTable
CREATE TABLE "GoalElaboration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "goalIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'shaky',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalElaboration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalElaboration_userId_idx" ON "GoalElaboration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoalElaboration_userId_moduleId_goalIndex_key" ON "GoalElaboration"("userId", "moduleId", "goalIndex");

-- AddForeignKey
ALTER TABLE "GoalElaboration" ADD CONSTRAINT "GoalElaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

