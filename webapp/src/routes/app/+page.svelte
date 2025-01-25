<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { goto } from '$app/navigation';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import { isMobileView } from '$lib/stores/viewport';
	import { userSettings } from '$lib/stores/userSettings';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import { cn } from '$lib/components/coach/utils';
	import { v4 as uuidv4 } from 'uuid';
	import type { ParentUser, Level, Pupil, UserNotification, Submission, Message } from './types';

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
		frontendId: string,
		timestamp: Date,
		isRead: Boolean,
		type: string,
		title: string,
		body: string | null,
		levelNumber: number | null,
		pupilId: string | null,
		isBodyHidden: Boolean,
		backendId: string
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

	// region Notification logic

	// Format submissions to frontend model
	const formatSubmissions = function(pupil: Pupil): FrontendNotification[] {
		const result: FrontendNotification[] = [];
		pupil.submissions.forEach((submission: Submission) => {
			if (submission.status === 'REVIEWED') {
				result.push({
					frontendId: uuidv4(), // generate new UUID for each notification
					timestamp: submission.updatedAt,
					isRead: submission.isRead,
					type: "FEEDBACK",
					title: `New feedback: Level ${submission.levelNumber} - ${pupil.name}`,
					body: submission.feedback,
					levelNumber: submission.levelNumber,
					pupilId: pupil.id,
					isBodyHidden: true,
					backendId: submission.id
				});
			}
		});
		return result;
	}

	const formatMessages = function(parentUser: ParentUser): FrontendNotification[] {
		const result: FrontendNotification[] = [];
		parentUser.parent.messages.forEach((message: Message) => {
			if (message.sender === "COACH") {
				result.push({
					frontendId: uuidv4(), // generate new UUID for each notification
					timestamp: message.createdAt,
					isRead: message.isRead,
					type: "MESSAGE",
					title: "New message",
					body: null,
					levelNumber: null,
					pupilId: null,
					isBodyHidden: true,
					backendId: message.id
				});
			}
		});
		return result;
	}

	// Format notifications to frontend model
	const formatNotifications = function(parentUser: ParentUser): FrontendNotification[] {
		const result: FrontendNotification[] = [];
		parentUser.notifications.forEach((notification: UserNotification) => {
			if (notification.type === 'META') {
				result.push({
					frontendId: uuidv4(), // generate new UUID for each notification
					timestamp: notification.timestamp,
					isRead: notification.isRead,
					type: "META",
					title: notification.title,
					body: notification.body,
					levelNumber: null,
					pupilId: null,
					isBodyHidden: true,
					backendId: notification.id
				});
			}
		});
		return result;
	}

	// Combine all notification types
	const constructFrontendNotifications = function(parentUser: ParentUser): FrontendNotification[] {
		let result: FrontendNotification[] = [];

		// Format backend submissions
		parentUser.parent.pupils.forEach((pupil: Pupil) => {
			const subNotifications: FrontendNotification[] = $state(formatSubmissions(pupil));
			result = result.concat(subNotifications);
		});

		// Format backend messages
		const msgNotifications: FrontendNotification[] = $state(formatMessages(parentUser));
		result = result.concat(msgNotifications);

		// Format backend notifications (type META)
		const notNotifications: FrontendNotification[] = $state(formatNotifications(parentUser));
		result = result.concat(notNotifications);

		return result;
	}

	// Construct frontend notifications
	const notifications: FrontendNotification[] = $state(constructFrontendNotifications(data.parentUser).sort((a: FrontendNotification, b: FrontendNotification) => b.timestamp.getTime() - a.timestamp.getTime()));
	// console.info('NotificationData:', notifications);

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

		// // Debug logging
		// console.log('Formatting time for:', {
		// 	timestamp: thenTimestamp,
		// 	parsed: new Date(thenTimestamp),
		// 	now: new Date(nowTimestamp),
		// 	diffInSeconds
		// });

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

	const handleBodyShow = function (notificationId: string) {
		// Hide all other notification bodies
		// console.info("Hiding other notification bodies");
		notifications.forEach(notification => {
			if (notification.frontendId !== notificationId) {
				notification.isBodyHidden = true;
			}
		});
		// Toggle body visibility
		// console.info("Toggling body visibility for notification:", notificationId);
		let currentNotification = $state(notifications.find(notification => notification.frontendId === notificationId));
		if (currentNotification) {
			currentNotification.isBodyHidden = !currentNotification.isBodyHidden;
		}
	}

	const markNotificationAsRead = async function (notificationId: string) {
		const notification = $state(notifications.find(notification => notification.frontendId === notificationId));
		if (notification && !notification.isRead) {
			try {
				let route: string = '';
				switch (notification.type) {
					case "FEEDBACK":
						route = "/api/mark-as-read/submission";
						break;
					case "MESSAGE":
						route = "/api/mark-as-read/message";
						break;
					case "META":
						route = "/api/mark-as-read/meta";
						break;
					default:
						route = "";
				}

				const response = await fetch(route, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ id: notification.backendId })
				});

				if (!response.ok) {
					console.error('API result: Failed to mark as read');
				} else {
					console.info('API result: Marked as read');
					notification.isRead = true;
				}
			} catch (error) {
				console.error('Error marking notification as read:', error);
			}
		}
	}

	$isSidebarOpen = (false);
</script>

<div class="mx-auto pb-14">
	{#if selectedChild}
	<!-- Progress banner -->
	<button
	class="w-full cursor-pointer "
	onclick={() => goto("/app/levels")}
	type="button">
		<div class={cn("flex flex-col items-center gap-4 p-6  transition-colors duration-200",
			$isMobileView ? "" : "items-start px-8",
			$userSettings.theme === 'DARK' ? "bg-blue-950 bg-opacity-25 hover:bg-opacity-50" : "bg-blue-100 hover:bg-blue-200"
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
				<div class={cn("w-full h-2 rounded-full bg-muted",
					$userSettings.theme === 'DARK' ? "bg-blue-950" : "bg-gray-300"
				)}>
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
					<span class={cn("ml-6 px-3 py-[2px] border border-background rounded-lg text-blue-950 font-medium fz-ms1 min-[320px]:fz-ms2",
						$userSettings.theme === 'DARK' ? "bg-blue-300" : "bg-blue-200"
					)}>
						Level {selectedChild.progress+1}
					</span>
				</div>
				<div class={cn("w-full flex justify-center px-4 pt-6 pb-8 rounded-[20px] min-[768px]:pt-8 min-[768px]:justify-start min-[768px]:pl-6 bg-gradient-to-b min-[768px]:bg-gradient-to-r",
					$userSettings.theme === 'DARK' ? "from-blue-900 to-blue-950" : "from-blue-600 to-blue-900"
				)}>
					<span class="text-center text-blue-50 font-sniglet-regular fz-ms6 min-[375px]:fz-ms7 min-[425px]:fz-ms9 min-[768px]:text-left">
						{data.levels[selectedChild.progress].languageContents[0].title}
					</span>
				</div>
				<div class="mt-[-27.6px] min-[375px]:mt-[-30.6px] flex justify-center min-[425px]:mt-[-33.6px] min-[768px]:mt-[-92.6px] min-[768px]:justify-end mr-6">
					<button
					class={cn("px-4 py-2 border-[2px] rounded-[20px] border-blue-50 cursor-pointer text-blue-50 font-sniglet-extrabold fz-ms6 min-[375px]:fz-ms7 min-[425px]:fz-ms8 transition-colors duration-200",
						$userSettings.theme === 'DARK' ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
					)}
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
				<div class="flex flex-col gap-4">
					{#each notifications as notification, index}
						<button
						class={cn("w-full rounded",
							notification.type === "MESSAGE" ? "cursor-pointer" : "cursor-default",
							$userSettings.theme === 'DARK' ? "hover:bg-blue-950": "hover:bg-blue-100",
							notification.isBodyHidden ? "" : `${$userSettings.theme === 'DARK' ? "bg-blue-950 bg-opacity-50" : "bg-blue-50"}`
						)}
						onclick={() => {
							handleBodyShow(notification.frontendId);
							markNotificationAsRead(notification.frontendId);
							notification.type === "MESSAGE" ? goto("/app/chat") : null;
						}}
						type="button">
							<div class="flex flex-col min-[768px]:flex-row min-[768px]:gap-1 transition-all duration-200">
								<div class="flex gap-4 px-2 py-[6px] min-[768px]:flex-shrink-0">
									<div class={cn("mt-2 h-2 w-2 bg-blue-500 rounded-full",
										notification.isRead ? "opacity-0" : "opacity-100")}></div>
									<div class="flex flex-col items-start gap-1">
										<span class="text-left text-[14px] leading-[150%] font-medium text-main">
											{notification.title}
										</span>
										<span class="text-left text-[14px] leading-[150%] text-gray-500">
											{formatTimeAgo(notification.timestamp)}
										</span>
									</div>
								</div>
								{#if notification.type != "MESSAGE"}
									<a
									href="{(notification.type === 'FEEDBACK' && notification.pupilId === selectedChild.id) ? `/app/levels/${notification.levelNumber}#feedback` : ''}"
									class={cn("border-border min-[768px]:border-l my-1 flex items-start flex-1",
										notification.isBodyHidden ? "hidden" : "block"
									)}>
										<div class={cn("h-full flex flex-1 justify-start ml-6 min-[768px]:ml-0 px-2 py-1 mr-1 hover:border-opacity-100 rounded border border-solid border-opacity-0 transition-all duration-200",
											(notification.type === 'FEEDBACK' && notification.pupilId === selectedChild.id) ? "cursor-pointer" : "cursor-default",
											$userSettings.theme === 'DARK'
												? `bg-[#0D1735] ${(notification.type === 'FEEDBACK' && notification.pupilId === selectedChild.id) ? 'hover:border-blue-800' : ''}`
												: `bg-blue-50 ${(notification.type === 'FEEDBACK' && notification.pupilId === selectedChild.id) ? 'hover:border-blue-500' : ''}`
										)}>
											<p class="text-left break-words transition-all duration-200 fz-ms1 text-main">
												{notification.body}
											</p>
										</div>
									</a>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<p class="text-center text-gray-500">No notifications yet</p>
			{/if}
		</div>
	</div>
	{/if}
</div>