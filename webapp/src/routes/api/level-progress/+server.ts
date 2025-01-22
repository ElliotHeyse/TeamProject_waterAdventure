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
  } else {
    console.log("API: request received")
    console.log(pupil.name);
    console.log(levelProgress);
  }

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
    throw error(500, 'Failed to update level progress');
  }

  if (updatedLevelProgress.firstPartCompleted && updatedLevelProgress.fullyCompleted) {
    console.log("Level fully completed, updating. Current progress:", pupil.progress);
    if (levelProgress.levelNumber === pupil.progress + 1) {
      // the new levelnumber is 1 above the current pupil progress (normal situation)
      const updatedPupil = await prisma.pupil.update({
        where: {
          id: pupil.id
        },
        data: {
          progress: levelProgress.levelNumber
        }
      });

      if (!updatedPupil) {
        throw error(500, 'Failed to update pupil progress');
      } else {
        console.info("Updated progress:", updatedPupil.progress);
      }

      return json({
        pupil: updatedPupil,
        levelProgress: updatedLevelProgress
      });
    } else if (levelProgress.levelNumber < pupil.progress + 1) {
      // the new levelnumber is equal to or lower than the current pupil progress (user went back to re-complete level that has been completed before)
      console.log("Level already completed, no update needed");
      return json({
        pupil: pupil,
        levelProgress: updatedLevelProgress
      });
    } else {
      // the new levelnumber is more than 1 above the current pupil progress (invalid situation)
      throw error(400, 'Invalid level number');
    }
  } else {
    return json({
      pupil: pupil,
      levelProgress: updatedLevelProgress
    });
  }
};