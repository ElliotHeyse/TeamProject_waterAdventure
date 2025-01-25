<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { Button } from '$lib/components/coach/ui/button';
	import { Input } from '$lib/components/coach/ui/input';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { formatDistanceToNow } from 'date-fns';
	import { io, type Socket } from 'socket.io-client';
	import { userSettings } from '$lib/stores/userSettings';
	import { isMobileView } from '$lib/stores/viewport';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import type { Message } from '../types';

	const { data } = $props<{ data: PageData }>();
	let messageInput = $state('');
	let messages = $state(data.messages);
	let scrollContainer: HTMLDivElement | null = $state(null);
	let socket: Socket;

	// Handle scrolling whenever messages change
	$effect(() => {
		if (scrollContainer && messages?.length > 0) {
			requestAnimationFrame(() => {
				scrollContainer?.scrollTo({
					top: scrollContainer.scrollHeight,
					behavior: 'smooth'
				});
			});
		}
	});

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}

	onMount(() => {
		// Connect to Socket.IO server
		socket = io({
			path: '/socket.io'
		});

		// Listen for incoming messages
		socket.on('message', (message) => {
			messages = [...messages, message];
		});

		// Handle errors
		socket.on('error', (error) => {
			console.error('Socket error:', error);
		});

		// Initialize connection
		socket.on('connect', () => {
			console.log('Connected to chat server');
		});

		socket.on('disconnect', () => {
			console.log('Disconnected from chat server');
		});
	});

	onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}
	});

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (!messageInput.trim() || !socket) return;

		const message = {
			content: messageInput,
			parentId: data.parent.id,
			coachId: data.coach.id,
			isFromParent: true
		};

		socket.emit('message', message);
		messageInput = '';
	}

	$isSidebarOpen = (false);

	let markAsReadSucces: number = 0;
	let markAsReadError: number = 0;
	if (data.messages) {
		data.messages.forEach(async (message: Message) => {
			if (message.sender === 'COACH' && !message.isRead) {
				const response = await fetch("/api/mark-as-read/message", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ id: message.id })
				});
				if (response.ok) {
					markAsReadSucces += 1;
					console.info(`Message ${message.id} marked as read`);
				} else {
					markAsReadError += 1;
				}
			}
		});
		if (markAsReadSucces > 0) {
			console.info(`${markAsReadSucces} messages marked as read`);
		}
	}
</script>

<div class="h-full flex flex-col pb-14">
	<div class=" fixed w-full z-30 -mt-16">
		<div class="bg-background h-16"></div>
		<div class={cn("flex gap-2 p-2 z-30 border-b",
			$userSettings.theme === "DARK" ? "bg-blue-950 border-background" : "bg-blue-100 border-gray-300"
		)}>
			<div
				class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
			>
				{getInitials(data.coach.user.name)}
			</div>
			<div>
				<p class="fz-ms2 font-semibold">{data.coach.user.name}</p>
				<p class="fz-ms1 text-muted-foreground">Your Swimming Coach</p>
			</div>
		</div>
	</div>

	<div bind:this={scrollContainer} class={cn("flex-1 overflow-y-auto px-4 pt-[72px] pb-4",
		$isMobileView ? "pb-[4.5rem]" : "pb-[2rem]"
	)}>
		<div class="flex flex-col">
			{#each messages as message, index}
				<div
					class={cn(
						'flex gap-2 max-w-[80%]',
						(message.parentId === data.parent.id && message.sender === 'PARENT'
							? 'ml-auto flex-row-reverse'
							: 'flex-row'),
						(messages[index-1]?.sender === message.sender ? "mt-1" : "mt-4")
					)}
				>
					<div
						class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm shrink-0"
					>
						{message.parentId === data.parent.id && message.sender === 'PARENT'
							? getInitials(message.parent.user.name)
							: getInitials(message.coach.user.name)}
					</div>
					<div
						class={cn(
							'rounded-lg p-3',
							message.parentId === data.parent.id && message.sender === 'PARENT'
								? `${$userSettings.theme === "DARK" ? "bg-blue-900 text-primary-background" : "bg-blue-700 text-primary-foreground"}`
								: 'bg-muted'
						)}
					>
						<p class="fz-ms1 min-[375px]:fz-ms2 break-words">{message.content}</p>
						<p class="fz-ms1 opacity-70 mt-1">
							{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class={cn("fixed bottom-0 z-30 border-t border-gray-300 bg-blue-100",
		$isMobileView ? "bottom-14 w-full" : "bottom-0 w-[calc(100%-4rem)] h-[73px] grid items-center",
		$userSettings.theme === "DARK" ? "bg-blue-950 border-background" : "bg-blue-100 border-gray-300"
	)}>
		<div class="p-3">
			<form onsubmit={handleSubmit} class="flex gap-2">
				<Input
					type="text"
					bind:value={messageInput}
					placeholder="Type your message..."
					class={cn("text-[0.875rem] !ring-0 focus:border-blue-500 bg-background",
						$userSettings.theme === 'DARK' ? "hover:bg-opacity-50 focus:bg-opacity-75" : "hover:bg-gray-100 focus:border-blue-500 focus:bg-blue-50"
					)}
				/>
				<Button class={cn("!ring-0 text-[0.875rem] border border-blue-500 border-opacity-0 focus:border-opacity-100",
					$userSettings.theme === 'DARK' ? "focus:bg-blue-200 focus:text-blue-600" : "focus:bg-blue-900 focus:text-blue-400"
				)} type="submit">Send</Button>
			</form>
		</div>
		{#if $isMobileView}
				<div class="h-14 bg-background -mb-14"></div>
		{/if}
	</div>
</div>

<!-- TODO dark mode -->