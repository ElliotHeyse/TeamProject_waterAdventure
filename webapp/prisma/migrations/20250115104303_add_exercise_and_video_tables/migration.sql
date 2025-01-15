/*
  Warnings:

  - You are about to drop the `SwimmingExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SwimmingLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SwimmingVideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SwimmingExercise" DROP CONSTRAINT "SwimmingExercise_levelId_fkey";

-- DropForeignKey
ALTER TABLE "SwimmingVideo" DROP CONSTRAINT "SwimmingVideo_exerciseId_fkey";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "isSwimmingLesson" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "objective" TEXT;

-- DropTable
DROP TABLE "SwimmingExercise";

-- DropTable
DROP TABLE "SwimmingLevel";

-- DropTable
DROP TABLE "SwimmingVideo";

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "important" TEXT,
    "tip" TEXT,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
