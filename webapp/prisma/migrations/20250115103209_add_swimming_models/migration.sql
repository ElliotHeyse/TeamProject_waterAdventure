-- CreateTable
CREATE TABLE "SwimmingLevel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwimmingLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwimmingExercise" (
    "id" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "important" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwimmingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwimmingVideo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwimmingVideo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SwimmingExercise" ADD CONSTRAINT "SwimmingExercise_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "SwimmingLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwimmingVideo" ADD CONSTRAINT "SwimmingVideo_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "SwimmingExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
