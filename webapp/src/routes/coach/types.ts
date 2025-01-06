export interface DashboardStats {
	totalPupils: number;
	activeLessons: number;
	pendingSubmissions: number;
	unreadMessages: number;
}

export interface ActivityItem {
	type: 'submission' | 'message' | 'lesson';
	text: string;
	time: string;
}

export interface DashboardData {
	stats: DashboardStats;
	recentActivity: ActivityItem[];
}
