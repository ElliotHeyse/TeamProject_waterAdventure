import type { Level } from '@prisma/client';

export interface LessonData {
	id: string;
	title: string;
	description: string;
	level: Level;
	duration: number;
	date: Date;
	maxPupils: number;
}

export interface NewLessonData {
	title: string;
	description: string;
	level: Level;
	duration: number;
	date: string;
	maxPupils: number;
}

export interface LessonsPageData {
	lessons: LessonData[];
}
