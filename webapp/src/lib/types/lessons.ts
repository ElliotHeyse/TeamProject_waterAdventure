import type { Level } from '@prisma/client';

export interface Exercise {
	id: string;
	part: string;
	location: string;
	name: string;
	description: string;
	important?: string;
	tip?: string;
	videos: Video[];
}

export interface Video {
	id: string;
	url: string;
	description: string;
}

export interface LessonData {
	id: string;
	title: string;
	description: string;
	level: Level;
	duration: number;
	date: Date;
	maxPupils: number;
	isSwimmingLesson?: boolean;
	objective?: string;
	exercises?: Exercise[];
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
	order: number;
	isSwimmingLesson?: boolean;
	objective?: string;
	exercises?: {
		part: string;
		location: string;
		name: string;
		description: string;
		important?: string;
		tip?: string;
		videos: {
			url: string;
			description: string;
		}[];
	}[];
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
