import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Pupil, LevelProgress } from '../../app/types';

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const {pupil, levelProgress} = await request.json();
  if (!pupil || !levelProgress) {
    throw error(400, 'Missing required fields');
  }

  console.info("API[level-progress]: request received");

  // update the levelProgress entry in the Database
  const updatedLevelProgress = await prisma.levelProgress.update({
    where: {
      id: levelProgress.id
    },
    data: {
      firstPartCompleted: Boolean(levelProgress.firstPartCompleted),
      fullyCompleted: Boolean(levelProgress.fullyCompleted)
    }
  });

  if (!updatedLevelProgress) {
    console.warn("API[level-progress]: Failed to update level progress, throwing 500 error");
    throw error(500, 'Failed to update level progress');
  }

  if (updatedLevelProgress.firstPartCompleted && updatedLevelProgress.fullyCompleted) {
    // Level fully completed, updating pupil progress
    if (levelProgress.levelNumber === pupil.progress + 1) {
      // the new levelnumber is 1 above the current pupil progress (normal situation)
      console.info("API[level-progress]: Level fully completed, updating pupil progress");
      const updatedPupil = await prisma.pupil.update({
        where: {
          id: pupil.id
        },
        data: {
          progress: levelProgress.levelNumber
        }
      });

      if (!updatedPupil) {
        console.warn("API[level-progress]: Failed to update pupil progress, throwing 500 error");
        throw error(500, 'Failed to update pupil progress');
      }

      console.info("new progress:", updatedPupil.progress);

      console.info("API[level-progress]: successfully processed request");
      return json({
        pupil: updatedPupil,
        levelProgress: updatedLevelProgress
      });

    } else if (levelProgress.levelNumber < pupil.progress + 1) {
      // the new levelnumber is equal to or lower than the current pupil progress (user went back to re-complete level that has been completed before)
      console.info("API[level-progress]: Level fully completed, updating pupil progress not required as it is already higher");
      // no pupil progress update required
      console.info("API[level-progress]: successfully processed request");
      return json({
        pupil: pupil,
        levelProgress: updatedLevelProgress
      });

    } else {
      // the new levelnumber is more than 1 above the current pupil progress (invalid situation)
      console.warn("API[level-progress]: Invalid level number, throwing 400 error");
      throw error(400, 'Invalid level number');
    }
  } else {
    console.info("API[level-progress]: successfully processed request");
    return json({
      pupil: pupil,
      levelProgress: updatedLevelProgress
    });
  }
};