<script lang="ts">
	import {
		Icon,
		UserGroup,
		BookOpen,
		ClipboardDocumentCheck,
		ChatBubbleLeftRight,
		VideoCamera,
		Envelope,
		Calendar
	} from 'svelte-hero-icons';
	import type { PageData } from './$types';
	import type { ActivityItem } from './types';

	let { data } = $props<{ data: PageData }>();

	function getActivityIcon(type: ActivityItem['type']) {
		switch (type) {
			case 'submission':
				return VideoCamera;
			case 'message':
				return Envelope;
			case 'lesson':
				return Calendar;
		}
	}
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- Stats Cards -->
		<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class="flex items-center justify-between p-6">
				<div>
					<p class="text-muted-foreground text-sm font-medium">Total Pupils</p>
					<p class="text-2xl font-semibold">{data.stats.totalPupils}</p>
				</div>
				<Icon src={UserGroup} class="text-muted-foreground h-8 w-8" />
			</div>
		</div>

		<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class="flex items-center justify-between p-6">
				<div>
					<p class="text-muted-foreground text-sm font-medium">Active Lessons</p>
					<p class="text-2xl font-semibold">{data.stats.activeLessons}</p>
				</div>
				<Icon src={BookOpen} class="text-muted-foreground h-8 w-8" />
			</div>
		</div>

		<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class="flex items-center justify-between p-6">
				<div>
					<p class="text-muted-foreground text-sm font-medium">Pending Submissions</p>
					<p class="text-2xl font-semibold">{data.stats.pendingSubmissions}</p>
				</div>
				<Icon src={ClipboardDocumentCheck} class="text-muted-foreground h-8 w-8" />
			</div>
		</div>

		<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class="flex items-center justify-between p-6">
				<div>
					<p class="text-muted-foreground text-sm font-medium">Unread Messages</p>
					<p class="text-2xl font-semibold">{data.stats.unreadMessages}</p>
				</div>
				<Icon src={ChatBubbleLeftRight} class="text-muted-foreground h-8 w-8" />
			</div>
		</div>
	</div>

	<!-- Recent Activity -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="p-6">
			<h3 class="text-lg font-semibold">Recent Activity</h3>
			<div class="mt-4 space-y-4">
				{#each data.recentActivity as activity}
					<div class="hover:bg-muted flex items-start space-x-4 rounded-lg p-4 transition-colors">
						<Icon src={getActivityIcon(activity.type)} class="text-muted-foreground h-5 w-5" />
						<div class="flex-1">
							<p class="text-foreground">{activity.text}</p>
							<p class="text-muted-foreground text-sm">{activity.time}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
