<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { goto } from '$app/navigation';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import {isMobileView} from '$lib/stores/viewport';
	import { cn } from '$lib/components/coach/utils';
	import badge from '$lib/img/badge-placeholder.svg';
	// import { notifications } from '$lib/paraglide/messages';

	interface Child {
		id: string;
		name: string;
		currentLevel: string;
		currentLevelOrder: number;
		latestReview?: {
			lessonOrder: number;
			updatedAt: string;
			review?: {
				feedback: string;
				coach?: {
					user?: {
						name: string;
					};
				};
			};
		};
	}

	const { data } = $props<{ data: { children: Child[] } }>();

	const selectedChild = $derived(
		data.children.find((child: Child) => child.id === $selectedChildIdStore) || data.children[0]
	);

	function handleReviewClick(child: Child) {
		if (child.latestReview?.review) {
			goto(`/app/levels/${child.latestReview.lessonOrder}#feedback`);
		}
	}

	const TOTAL_LEVELS = 7;
	console.log(selectedChild);

	// Notifications logic

	// hardcoded notifications for now, these would be the fetched notifications
	const notifications_hardcoded = [
		{ "id": 0, "timestamp": "2025-01-09T08:00:00Z", "read": true,	"type": "meta",		"level": null,
			"title": "Welcome to the First Wateradventure", "body": "We're excited to have you join us! Explore the app to get started and make the most of your experience." },
		{ "id": 1, "timestamp": "2025-01-10T09:00:00Z", "read": true,	"type": "message",	"level": null,
			"title": null, "body": null},
		{ "id": 2, "timestamp": "2025-01-11T11:00:00Z", "read": true,	"type": "feedback",	"level": 1,
			"title": null, "body": "Nicely done. Excellent job on your first level!" },
		{ "id": 3, "timestamp": "2025-01-12T13:00:00Z", "read": true,	"type": "message",	"level": null,
			"title": null, "body": null},
		{ "id": 4, "timestamp": "2025-01-13T08:00:00Z", "read": true,	"type": "feedback",	"level": 2,
			"title": null, "body": "Great job! You're making progress."},
		{ "id": 5, "timestamp": "2025-01-14T10:00:00Z", "read": true,	"type": "message",	"level": null,
			"title": null, "body": null},
		{ "id": 6, "timestamp": "2025-01-15T07:00:00Z", "read": false,	"type": "meta",		"level": null,
			"title": "Scheduled Maintenance Alert", "body": "The app will be down for maintenance on 16th January 2025 from 9:00 AM to 12:00 PM UTC. We apologize in advance for any inconvenience you may experience." },
		{ "id": 7, "timestamp": "2025-01-16T09:00:00Z", "read": false,	"type": "message",	"level": null,
			"title": null, "body": null},
		{ "id": 8, "timestamp": "2025-01-17T11:00:00Z", "read": false,	"type": "feedback",	"level": 3,
			"title": null, "body": "Pay attention to the details. Keep your fingers properly closed when pushing the water. Keep up the good work!"}
	];

	const notifications_sorted = notifications_hardcoded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	const notifications = $state(notifications_sorted.map(notification => ({
		...notification,
		isBodyHidden: true
	})));
	// const notifications: typeof notifications_hardcoded = []; // test empty state

	let nowTimestamp = new Date().toISOString();

	const formatTimeAgo = (thenTimestamp: string) => {
		// AI generated function. Not reviewed, but seems to work. Further testing recommended => update seed data
		const now = new Date().getTime();
		const then = new Date(thenTimestamp).getTime();
		const diffInSeconds = Math.floor((now - then) / 1000);

		const intervals = [
			{ label: 'year', seconds: 31536000 },
			{ label: 'month', seconds: 2592000 },
			{ label: 'day', seconds: 86400 },
			{ label: 'hour', seconds: 3600 },
			{ label: 'minute', seconds: 60 },
			{ label: 'second', seconds: 1 }
		];

		for (const interval of intervals) {
			const count = Math.floor(diffInSeconds / interval.seconds);
			if (count > 0) {
				return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
			}
		}

		return 'just now';
	};

	const resetNotificationBodies = function () {
		notifications.forEach(notification => {
			notification.isBodyHidden = true;
		});
	}

	const markNotificationAsRead = function (notificationId: number) {
		// Frontend: update read status, might be obsolete if new fetch is implemented
		const notification = notifications.find(notification => notification.id === notificationId);
		if (notification) {
			notification.read = true;
		}

		// TODO: Backend: update notification read status in database
	}
</script>

<div class="mx-auto">
	{#if selectedChild}
	<!-- Progress banner -->
	<button
	class="cursor-pointer w-full "
	onclick={() => goto("/app/levels")}
	type="button">
		<div class="bg-blue-100 flex flex-col gap-4 p-6 items-center">
			<div class="flex flex-col gap-2 items-center">
				<div>
					<img src={badge} alt="Progress badge">
				</div>
				<div>
					<h1 class="text-[28px] leading-[120%] text-main">{selectedChild.currentLevel}</h1>
				</div>
			</div>
			<div class="w-full flex flex-col gap-[4px]">
				<div class="flex justify-between">
					<div>
						<span class="text-sm text-gray-500">Level</span>
					</div>
					<div class="flex gap-0">
						<span class="text-sm text-main font-bold">{selectedChild.currentLevelOrder}</span>
						<span class="text-sm text-gray-500">/{TOTAL_LEVELS}</span>
					</div>
				</div>
				<div class="h-2 w-full rounded-full bg-muted">
					<div
						class="h-full rounded-full bg-blue-500 transition-all"
						style="width: {(selectedChild.currentLevelOrder / TOTAL_LEVELS) * 100}%"
					></div>
				</div>
			</div>
		</div>
	</button>

	<div class="flex flex-col gap-6 py-6 px-4 m-0">
		<!-- Next level -->
		{#if selectedChild.currentLevelOrder < TOTAL_LEVELS}
		<div class="flex flex-col gap-3">
			<div class="flex gap-3">
				<h2 class="text-[20px] leading-[150%] text-main font-semibold">Next</h2>
				<span class="w-full border-b-2 border-gray-300 h-4 "></span>
			</div>
			<div class="flex flex-col align-center">
				<div class="mb-[-12.5px] z-10">
					<span class="ml-6 px-3 py-[2px] border border-white bg-blue-200 rounded-lg text-[14px] leading-[150%] text-blue-950 font-medium">Level {selectedChild.currentLevelOrder+1}</span>
				</div>
				<div class="w-full flex justify-center pt-6 pb-8 bg-blue-950 rounded-[20px]">
					<span class="text-[36px] leading-[150%] text-blue-500">Level title</span>
				</div>
				<div class="mt-[-26.4px] flex justify-center">
					<button
					class="cursor-pointer bg-green-500 px-4 py-2 text-[28px] leading-[120%] font-extrabold text-green-100 border-2 border-white rounded-[20px]"
					onclick={() => goto(`/app/levels/${selectedChild.currentLevelOrder + 1}`)}
					type="button">
						START
					</button>
				</div>
			</div>
		</div>
		{/if}

		<!-- Notifications -->
		<div class="flex flex-col gap-3">
			<div>
				<div class="flex gap-3">
					<h2 class="text-[20px] leading-[150%] text-main font-semibold">Notifications</h2>
					<span class="w-full border-b-2 border-gray-300 h-4 "></span>
				</div>
				<span class="text-[14px] leading-[140%] text-gray-500">You have 2 unread messages.</span>
			</div>
			{#if notifications.length != 0}
				<div class="flex flex-col gap-3">
					{#each notifications as notification}
						{#if notification.type === "message"}
							<!-- Message notification (link to chat page) -->
							<button
							class="cursor-pointer w-full rounded hover:bg-blue-100"
							onclick={() => {
								resetNotificationBodies();
								markNotificationAsRead(notification.id);
								goto("/app/chat");
							}}
							type="button">
							<div>
								<div class="flex gap-4 px-2 py-[6px]">
									<div class={cn("mt-2 h-2 w-2 bg-blue-500 rounded-full",
										notification.read ? "opacity-0" : "opacity-100")}></div>
									<div class="w-full flex flex-col items-start gap-1">
										<span class="text-[14px] leading-[150%] font-medium text-main">You have a new message</span>
										<span class="text-[14px] leading-[150%] text-gray-500">
											{formatTimeAgo(notification.timestamp)}
										</span>
									</div>
								</div>
							</div>
							</button>
						{:else if notification.type === "feedback"}
							<!-- Feedback notification (link to specified feedback)-->
							<button
							class={cn("w-full cursor-default rounded hover:bg-blue-100 transition-all duration-300",
								notification.isBodyHidden ? "" : "bg-blue-50"
							)}
							onclick={() => {
								markNotificationAsRead(notification.id);
								resetNotificationBodies();
								if (notification.isBodyHidden) {
									notification.isBodyHidden = false;
								} else {
									notification.isBodyHidden = true;
								}
							}}
							type="button">
								<div class="pb-1 transition-all duration-300">
									<div class="flex gap-4 px-2 py-[6px]">
										<div class={cn("mt-2 h-2 w-2 bg-blue-500 rounded-full",
											notification.read ? "opacity-0" : "opacity-100")}></div>
										<div class="w-full flex flex-col items-start gap-1">
											<span class="text-[14px] leading-[150%] font-medium text-main">New feedback: Level {notification.level}</span>
											<span class="text-[14px] leading-[150%] text-gray-500">
												{formatTimeAgo(notification.timestamp)}
											</span>
										</div>
									</div>
									<a href="/app/levels/{notification.level}#feedback">
										<div class={cn("flex justify-start ml-6 px-2 py-1 mr-1 bg-blue-50 rounded border border-solid border-opacity-0 hover:border-opacity-100 hover:border-blue-500 transition-all duration-300",
											notification.isBodyHidden ? "hidden" : "block"
										)}>
											<p class="text-left text-[14px] leading-[150%] text-main">{notification.body}</p>
										</div>
									</a>
								</div>
							</button>
						{:else}
							<!-- Meta notification (no link) -->
							<button
							class={cn("w-full cursor-default rounded hover:bg-blue-100 transition-all duration-300",
								notification.isBodyHidden ? "" : "bg-blue-50"
							)}
							onclick={() => {
								markNotificationAsRead(notification.id);
								resetNotificationBodies();
								if (notification.isBodyHidden) {
									notification.isBodyHidden = false;
								} else {
									notification.isBodyHidden = true;
								}
							}}
							type="button">
								<div class="pb-1 transition-all duration-300">
									<div class="flex gap-4 px-2 py-[6px]">
										<div class={cn("mt-2 h-2 w-2 bg-blue-500 rounded-full",
											notification.read ? "opacity-0" : "opacity-100")}></div>
										<div class="w-full flex flex-col items-start gap-1">
											<span class="text-[14px] leading-[150%] font-medium text-main">{notification.title}</span>
											<span class="text-[14px] leading-[150%] text-gray-500">
												{formatTimeAgo(notification.timestamp)}
											</span>
										</div>
									</div>
									<div>
										<div class={cn("flex justify-start ml-6 px-2 py-1 mr-1 rounded transition-all duration-300",
											notification.isBodyHidden ? "hidden" : "block"
										)}>
											<p class="text-left text-[14px] leading-[150%] text-main">{notification.body}</p>
										</div>
									</div>
								</div>
							</button>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="text-gray-500 text-center">No notifications yet</p>
			{/if}
		</div>
	</div>
	{/if}
</div>
