import type { Level } from '@prisma/client';

export interface PupilData {
	id: string;
	name: string;
	dateOfBirth: Date;
	level: Level;
	parent: {
		user: {
			name: string;
			email: string;
		};
	};
	notes: string | null;
}

export interface NewPupilData {
	name: string;
	dateOfBirth: string;
	level: Level;
	parentId: string;
	notes?: string;
}

export interface PupilsPageData {
	pupils: PupilData[];
	parents: {
		id: string;
		user: {
			name: string;
			email: string;
		};
	}[];
}
