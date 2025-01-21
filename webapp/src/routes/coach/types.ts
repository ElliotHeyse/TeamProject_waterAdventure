export interface DashboardStats {
	totalPupils: number;
	activeLevels: number;
	pendingSubmissions: number;
	unreadMessages: number;
}

export interface ActivityItem {
	type: 'submission' | 'message';
	text: string;
	time: string;
}

export interface DashboardData {
	stats: DashboardStats;
	recentActivity: ActivityItem[];
}
