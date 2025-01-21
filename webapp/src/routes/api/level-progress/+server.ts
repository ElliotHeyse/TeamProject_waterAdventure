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
    console.log("Level fully completed");
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
    }

    return json({
      pupil: updatedPupil,
      levelProgress: updatedLevelProgress
    });
  } else {
    return json({
      pupil: pupil,
      levelProgress: updatedLevelProgress
    });
  }
};