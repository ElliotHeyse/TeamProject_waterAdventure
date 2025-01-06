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
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Pupils</p>
					<p class="text-2xl font-semibold text-gray-900">{data.stats.totalPupils}</p>
				</div>
				<Icon src={UserGroup} class="h-8 w-8 text-gray-400" />
			</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Active Lessons</p>
					<p class="text-2xl font-semibold text-gray-900">{data.stats.activeLessons}</p>
				</div>
				<Icon src={BookOpen} class="h-8 w-8 text-gray-400" />
			</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Pending Submissions</p>
					<p class="text-2xl font-semibold text-gray-900">{data.stats.pendingSubmissions}</p>
				</div>
				<Icon src={ClipboardDocumentCheck} class="h-8 w-8 text-gray-400" />
			</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Unread Messages</p>
					<p class="text-2xl font-semibold text-gray-900">{data.stats.unreadMessages}</p>
				</div>
				<Icon src={ChatBubbleLeftRight} class="h-8 w-8 text-gray-400" />
			</div>
		</div>
	</div>

	<!-- Recent Activity -->
	<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
		<div class="p-6">
			<h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
			<div class="mt-4 space-y-4">
				{#each data.recentActivity as activity}
					<div class="flex items-start space-x-4 rounded-lg p-4 transition-colors hover:bg-gray-50">
						<Icon src={getActivityIcon(activity.type)} class="h-5 w-5 text-gray-600" />
						<div class="flex-1">
							<p class="text-gray-900">{activity.text}</p>
							<p class="text-sm text-gray-500">{activity.time}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
