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
	import * as m from '$lib/paraglide/messages.js';

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

	const stats = [
		{
			title: m.total_pupils(),
			value: data.stats.totalPupils,
			icon: UserGroup,
			description: m.active_students(),
			href: '/coach/pupils'
		},
		{
			title: m.active_lessons(),
			value: data.stats.activeLevels,
			icon: BookOpen,
			description: m.ongoing_lessons(),
			href: '/coach/lessons'
		},
		{
			title: m.pending_submissions(),
			value: data.stats.pendingSubmissions,
			icon: ClipboardDocumentCheck,
			description: m.submissions_awaiting(),
			href: '/coach/submissions'
		},
		{
			title: m.unread_messages(),
			value: data.stats.unreadMessages,
			icon: ChatBubbleLeftRight,
			description: m.messages_attention(),
			href: '/coach/chat'
		}
	];
</script>

<div class="space-y-8 p-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<a
				href={stat.href}
				class="group relative block overflow-hidden rounded-md border bg-card p-6 transition-all duration-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
				></div>
				<div class="relative flex items-center justify-between">
					<div class="space-y-2">
						<p class="text-sm font-medium text-muted-foreground">{stat.title}</p>
						<p class="text-3xl font-bold tracking-tight">{stat.value}</p>
						<p class="text-xs text-muted-foreground">{stat.description}</p>
					</div>
					<div
						class="rounded-full bg-primary/10 p-3 transition-transform duration-200 group-hover:scale-110"
					>
						<Icon src={stat.icon} class="h-6 w-6 text-primary" />
					</div>
				</div>
			</a>
		{/each}
	</div>

	<div class="rounded-md border bg-card shadow-sm">
		<div class="border-b p-6">
			<h3 class="text-xl font-semibold tracking-tight">{m.recent_activity()}</h3>
			<p class="text-sm text-muted-foreground">{m.latest_updates()}</p>
		</div>
		<div class="divide-y">
			{#each data.recentActivity as activity}
				<div class="group flex items-start space-x-4 p-6 transition-colors hover:bg-muted/50">
					<div class="rounded-full bg-primary/10 p-2">
						<Icon
							src={getActivityIcon(activity.type)}
							class="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110"
						/>
					</div>
					<div class="flex-1 space-y-1">
						<p class="font-medium leading-none">{activity.text}</p>
						<p class="text-sm text-muted-foreground">{activity.time}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
