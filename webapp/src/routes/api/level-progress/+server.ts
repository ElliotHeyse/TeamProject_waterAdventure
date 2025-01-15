import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const { lessonId, part, completed } = await request.json();

  if (!lessonId || !part || completed === undefined) {
    throw error(400, 'Missing required fields');
  }

  // Get the pupil ID from the parent relationship
  const parent = await prisma.parent.findUnique({
    where: {
      userId: locals.user.id
    },
    include: {
      pupils: {
        take: 1
      }
    }
  });

  if (!parent || !parent.pupils[0]) {
    throw error(404, 'No pupil found');
  }

  const pupilId = parent.pupils[0].id;

  // Find or create the progress entry
  const progress = await prisma.levelProgress.upsert({
    where: {
      pupilId_lessonId_part: {
        pupilId,
        lessonId,
        part,
      },
    },
    create: {
      pupilId,
      lessonId,
      part,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  return json(progress);
}; 