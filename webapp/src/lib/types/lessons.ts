import type { Level } from '@prisma/client';

export interface LessonData {
	id: string;
	title: string;
	description: string;
	level: Level;
	duration: number;
	date: Date;
	maxPupils: number;
	lessonPupils: {
		pupil: {
			id: string;
			name: string;
			level: Level;
		};
		attended: boolean;
	}[];
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

export interface LessonProgressData {
	lesson: LessonData;
	submissions: {
		id: string;
		pupilName: string;
		status: 'PENDING' | 'REVIEWED';
		videoUrl: string;
		feedback?: string;
		review?: {
			rating: number;
			comment: string;
		};
	}[];
}
