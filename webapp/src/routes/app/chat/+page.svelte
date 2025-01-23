<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { Button } from '$lib/components/coach/ui/button';
	import { Input } from '$lib/components/coach/ui/input';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { formatDistanceToNow } from 'date-fns';
	import { io, type Socket } from 'socket.io-client';

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
</script>

<div class="flex flex-col h-[calc(100vh-128px)] mt-16 mb-16">
	<div class="flex items-center gap-4 p-4 border-b bg-background fixed top-16 left-0 right-0 z-50">
		<div
			class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
		>
			{getInitials(data.coach.user.name)}
		</div>
		<div>
			<p class="text-lg font-semibold">{data.coach.user.name}</p>
			<p class="text-sm text-muted-foreground">Your Swimming Coach</p>
		</div>
	</div>

	<div bind:this={scrollContainer} class="flex-1 overflow-y-auto px-4 pt-[72px] pb-4">
		<div class="flex flex-col gap-4">
			{#each messages as message}
				<div
					class={cn(
						'flex gap-2 max-w-[80%]',
						message.parentId === data.parent.id && message.sender === 'PARENT'
							? 'ml-auto flex-row-reverse'
							: 'flex-row'
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
								? 'bg-primary text-primary-foreground'
								: 'bg-muted'
						)}
					>
						<p class="break-words">{message.content}</p>
						<p class="text-xs opacity-70 mt-1">
							{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<form
		onsubmit={handleSubmit}
		class="flex-none flex gap-2 p-4 bg-background border-t fixed bottom-14 left-0 right-0"
	>
		<Input
			type="text"
			bind:value={messageInput}
			placeholder="Type your message..."
			class="flex-1"
		/>
		<Button type="submit">Send</Button>
	</form>
</div>
