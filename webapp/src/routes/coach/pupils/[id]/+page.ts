import type { Level } from '@prisma/client';

export interface PageData {
	pupil: {
		id: string;
		name: string;
		level: Level;
	};
	lessons: {
		id: string;
		date: Date;
		status: string;
		notes: string | null;
	}[];
}
