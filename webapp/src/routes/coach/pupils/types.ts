export interface PupilData {
	id: string;
	name: string;
	dateOfBirth: Date;
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
