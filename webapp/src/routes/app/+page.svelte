<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { goto } from '$app/navigation';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import { isMobileView } from '$lib/stores/viewport';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import { cn } from '$lib/components/coach/utils';
	// import { notifications } from '$lib/paraglide/messages';
	import type { ParentUser, Level, Pupil, UserNotification } from './types';

	// import badge from '$lib/img/badge-placeholder.svg';
	import badge0 from '$lib/img//progressBadges/badge-level-0.svg';
	import badge1 from '$lib/img//progressBadges/badge-level-1.svg';
	import badge2 from '$lib/img//progressBadges/badge-level-2.svg';
	import badge3 from '$lib/img//progressBadges/badge-level-3.svg';
	import badge4 from '$lib/img//progressBadges/badge-level-4.svg';
	import badge5 from '$lib/img//progressBadges/badge-level-5.svg';
	import badge6 from '$lib/img//progressBadges/badge-level-6.svg';
	import badge7 from '$lib/img//progressBadges/badge-level-7.svg';
	import { is } from 'date-fns/locale';
	const badges = [badge0, badge1, badge2, badge3, badge4, badge5, badge6, badge7];

	interface FrontendNotification {
		id: string,
		timestamp: Date,
		isRead: Boolean,
		type: string,
		title: string,
		body: string,
		levelNumber: number,
		isBodyHidden: Boolean
	}

	// region Child logic

	const { data } = $props<{
		data: {
			parentUser: ParentUser,
			levels: Level[]
		}
	}>();

	const selectedChild = $derived(
		data.parentUser.parent.pupils.find((pupil: Pupil) => pupil.id === $selectedChildIdStore) || data.parentUser.parent.pupils[0]
	);

	const badge = $derived(() => badges[selectedChild.progress]);

	const TOTAL_LEVELS = data.levels.length;

	// region Notifications logic

	// format notifications to frontend model
	const notificationData_sorted: UserNotification[] = data.parentUser.notifications.sort((a: UserNotification, b: UserNotification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	const notifications: FrontendNotification[] = $state(
		notificationData_sorted.map(notification => ({
		...notification,
		timestamp: new Date(notification.timestamp),
		isBodyHidden: true
	})));
	// const notfications: FrontendNotification[] = []; // test empty state

	let nowTimestamp = $state(new Date().toISOString());

	$effect(() => {
		// Update nowTimestamp every second
		const interval = setInterval(() => {
			nowTimestamp = new Date().toISOString();
		}, 1000);

		return () => clearInterval(interval);
	});

	const formatTimeAgo = $derived((thenTimestamp: Date | string) => {
		const now = new Date(nowTimestamp).getTime();
		const then = typeof thenTimestamp === 'string' ? new Date(thenTimestamp).getTime() : thenTimestamp.getTime();
		const diffInSeconds = Math.floor((now - then) / 1000);

		// Debug logging
		console.log('Formatting time for:', {
			timestamp: thenTimestamp,
			parsed: new Date(thenTimestamp),
			now: new Date(nowTimestamp),
			diffInSeconds
		});

		if (diffInSeconds < 60) {
			return 'just now';
		}

		const intervals = [
			{ label: 'year', seconds: 31536000 },
			{ label: 'month', seconds: 2592000 },
			{ label: 'day', seconds: 86400 },
			{ label: 'hour', seconds: 3600 },
			{ label: 'minute', seconds: 60 }
		];

		for (const interval of intervals) {
			const count = Math.floor(diffInSeconds / interval.seconds);
			if (count > 0) {
				return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
			}
		}

		return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
	});

	const resetOtherNotificationBodies = function (notificationId: string) {
		notifications.forEach(notification => {
			if (notification.id !== notificationId) {
				notification.isBodyHidden = true;
			}
		});
	}

	const markNotificationAsRead = async function (notificationId: string) {
		// Frontend: update read status
		const notification = notifications.find(notification => notification.id === notificationId);
		if (notification) {
			notification.isRead = true;
		}

		// Update in the database
		try {
			const response = await fetch('/api/notifications/mark-read', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ notificationId })
			});

			if (!response.ok) {
				console.error('Failed to mark notification as read');
			}
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	}
</script>

<div class="mx-auto">
	{#if selectedChild}
	<!-- Progress banner -->
	<button
	class="w-full cursor-pointer "
	onclick={() => goto("/app/levels")}
	type="button">
		<div class={cn("flex flex-col items-center gap-4 p-6 bg-blue-100 hover:bg-blue-200 transition-colors duration-200",
			$isMobileView ? "" : "items-start px-8"
		)}>
			<div class={cn("flex flex-col items-center gap-2",
				$isMobileView ? "" : "flex-row gap-8"
			)}>
				<div>
					<img src={badge()} alt="Progress badge">
				</div>
				<div class={cn($isMobileView ? "" : "mt-[3px]")}>
					<h1 class="text-main font-sniglet-regular fz-ms6 min-[320px]:fz-ms7 min-[375px]:fz-ms8">
						{#if [0, 1, 2].includes(selectedChild.progress)}
							BEGINNER
						{:else if [3, 4, 5].includes(selectedChild.progress)}
							INTERMEDIATE
						{:else}
							ADVANCED
						{/if}
					</h1>
				</div>
			</div>
			<div class="w-full flex flex-col gap-[4px]">
				<div class="flex justify-between">
					<div>
						<span class="text-gray-500 fz-ms2 min-[375px]:fz-ms3">Level</span>
					</div>
					<div class="flex gap-0">
						<span class="font-bold text-main fz-ms2 min-[375px]:fz-ms3">{selectedChild.progress}</span>
						<span class="text-gray-500 fz-ms2 min-[375px]:fz-ms3">/{TOTAL_LEVELS}</span>
					</div>
				</div>
				<div class="w-full h-2 rounded-full bg-muted">
					<div
						class="h-full transition-all bg-blue-500 rounded-full"
						style="width: {(selectedChild.progress / TOTAL_LEVELS) * 100}%"
					></div>
				</div>
			</div>
		</div>
	</button>

	<div class="flex flex-col gap-6 px-4 py-6 m-0">
		<!-- Next level -->
		{#if selectedChild.progress < TOTAL_LEVELS}
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<h2 class="font-semibold text-main fz-ms3 min-[320px]:fz-ms4 min-[375px]:fz-ms5">Next</h2>
				<div class="grid w-full h-6 grid-rows-[1fr_1fr]">
					<div class="w-full h-full border-gray-300 border-b-[0.5px]"></div>
					<div class="w-full h-full border-t-[0.5px] border-gray-300"></div>
				</div>
			</div>
			<div class="flex flex-col align-center min-[768px]:mb-6">
				<div class="z-10 mb-[-11px]">
					<span class="ml-6 px-3 py-[2px] border border-white bg-blue-200 rounded-lg text-blue-950 font-medium fz-ms1 min-[320px]:fz-ms2">
						Level {selectedChild.progress+1}
					</span>
				</div>
				<div class="w-full flex justify-center px-4 pt-6 pb-8 bg-blue-950 rounded-[20px] min-[768px]:pt-8 min-[768px]:justify-start min-[768px]:pl-6">
					<span class="text-center text-blue-500 font-sniglet-regular fz-ms6 min-[375px]:fz-ms7 min-[425px]:fz-ms9 min-[768px]:text-left">
						{data.levels[selectedChild.progress].languageContents[0].title}
						<!-- <p>Aquatisch ademen: vervolg</p> -->
						<!-- Lorem ipsum dolor sit amet consectetur, adipisicing elit. -->
						<!-- titel vak is 118px high -->
						<!-- button is 67.2px high-->
					</span>
				</div>
				<div class="mt-[-27.6px] min-[375px]:mt-[-30.6px] flex justify-center min-[425px]:mt-[-33.6px] min-[768px]:mt-[-92.6px] min-[768px]:justify-end mr-6">
					<button
					class="px-4 py-2 bg-blue-500 hover:bg-blue-600 border-[2px] rounded-[20px] border-white cursor-pointer text-blue-50 font-sniglet-extrabold fz-ms6 min-[375px]:fz-ms7 min-[425px]:fz-ms8 transition-colors duration-200"
					onclick={() => goto(`/app/levels/${selectedChild.progress + 1}`)}
					type="button">
						START
					</button>
				</div>
			</div>
		</div>
		{/if}

		<!-- Notifications -->
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<h2 class="font-semibold text-main fz-ms3 min-[320px]:fz-ms4 min-[375px]:fz-ms5">Notifications</h2>
				<div class="grid w-full h-6 grid-rows-[1fr_1fr]">
					<div class="w-full h-full border-gray-300 border-b-[0.5px]"></div>
					<div class="w-full h-full border-t-[0.5px] border-gray-300"></div>
				</div>
			</div>
			{#if notifications.length != 0}
				<div class="flex flex-col gap-3">
					{#each notifications as notification}
						{#if notification.type === "MESSAGE"}
							<!-- Message notification (link to chat page) -->
							<button
							class="w-full rounded cursor-pointer hover:bg-blue-100"
							onclick={() => {
								resetOtherNotificationBodies(notification.id);
								markNotificationAsRead(notification.id);
								goto("/app/chat");
							}}
							type="button">
							<div>
								<div class="flex gap-4 px-2 py-[6px]">
									<div class={cn("mt-2 h-2 w-2 bg-blue-500 rounded-full",
										notification.isRead ? "opacity-0" : "opacity-100")}></div>
									<div class="flex flex-col items-start w-full gap-1">
										<span class="text-[14px] leading-[150%] font-medium text-main">You have a new message</span>
										<span class="text-[14px] leading-[150%] text-gray-500">
											{formatTimeAgo(notification.timestamp)}
										</span>
									</div>
								</div>
							</div>
							</button>
						{:else if notification.type === "FEEDBACK"}
							<!-- Feedback notification (link to specified feedback) -->
							<button
							class={cn("w-full cursor-default rounded hover:bg-blue-100 transition-all duration-300",
								notification.isBodyHidden ? "" : "bg-blue-50"
							)}
							onclick={() => {
								markNotificationAsRead(notification.id);
								resetOtherNotificationBodies(notification.id);
								if (notification.isBodyHidden) {
									notification.isBodyHidden = false;
								} else {
									notification.isBodyHidden = true;
								}
							}}
							type="button">
								<div class="flex flex-col min-[768px]:flex-row min-[768px]:gap-1 transition-all duration-300">
									<div class="flex gap-4 px-2 py-[6px] min-[768px]:flex-shrink-0">
										<div class={cn("mt-2 h-2 w-2 bg-blue-500 rounded-full",
											notification.isRead ? "opacity-0" : "opacity-100")}></div>
										<div class="flex flex-col items-start gap-1">
											<span class="text-left text-[14px] leading-[150%] font-medium text-main">
												New feedback: Level {notification.levelNumber}
											</span>
											<span class="text-left text-[14px] leading-[150%] text-gray-500">
												{formatTimeAgo(notification.timestamp)}
												<!-- update formatTimeAgo() logic -->
											</span>
										</div>
									</div>
									<a href="/app/levels/{notification.levelNumber}#feedback" class={cn("border-border border-l my-1 flex items-start flex-1 transition-all duration-300", notification.isBodyHidden ? "hidden" : "block")}>
										<div class="h-full flex justify-start ml-6 min-[768px]:ml-0 px-2 py-1 mr-1 bg-blue-50 rounded border border-solid border-opacity-0 hover:border-opacity-100 hover:border-blue-500 transition-all duration-300">
											<p class="text-left break-words transition-all duration-300 fz-ms1 text-main">
												{notification.body}
											</p>
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
								resetOtherNotificationBodies(notification.id);
								if (notification.isBodyHidden) {
									notification.isBodyHidden = false;
								} else {
									notification.isBodyHidden = true;
								}
							}}
							type="button">
							<div class="flex flex-col min-[768px]:flex-row min-[768px]:gap-1 transition-all duration-300">
								<div class="flex flex-col min-[768px]:flex-row min-[768px]:gap-1 transition-all duration-300">
									<div class="flex gap-4 px-2 py-[6px] min-[768px]:flex-shrink-0">
										<div class={cn("mt-2 h-2 w-2 bg-blue-500 rounded-full",
											notification.isRead ? "opacity-0" : "opacity-100")}></div>
										<div class="flex flex-col items-start gap-1">
											<span class="text-left text-[14px] leading-[150%] font-medium text-main">{notification.title}</span>
											<span class="text-left text-[14px] leading-[150%] text-gray-500">
												{formatTimeAgo(notification.timestamp)}
												<!-- update formatTimeAgo() logic -->
											</span>
										</div>
									</div>
									<div class={cn("border-border border-l my-1 flex items-start flex-1 transition-all duration-300", notification.isBodyHidden ? "hidden" : "block")}>
										<div class="h-full flex justify-start ml-6 min-[768px]:ml-0 px-2 py-1 mr-1 bg-blue-50 rounded border border-solid border-opacity-0 hover:border-opacity-100 hover:border-blue-500 transition-all duration-300">
											<p class="text-left text-[14px] leading-[150%] text-main break-words transition-all duration-300">
												{notification.body}
											</p>
										</div>
									</div>
								</div>
							</div>
							</button>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="text-center text-gray-500">No notifications yet</p>
			{/if}
		</div>
	</div>
	{/if}
</div>
