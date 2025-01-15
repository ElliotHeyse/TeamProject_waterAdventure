<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { Button } from '$lib/components/coach/ui/button';
	import { Input } from '$lib/components/coach/ui/input';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { formatDistanceToNow } from 'date-fns';
	import { io, type Socket } from 'socket.io-client';

	export let data: PageData;

	let messageInput: string = '';
	let scrollContainer: HTMLDivElement;
	let socket: Socket;

	$: if (scrollContainer) {
		scrollContainer.scrollTop = scrollContainer.scrollHeight;
	}

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
			data.messages = [...data.messages, message];
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
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

<Card class="h-[calc(100vh-2rem)]">
	<CardHeader>
		<CardTitle class="flex items-center gap-4">
			<div
				class="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
			>
				{getInitials(data.coach.user.name)}
			</div>
			<div>
				<p class="text-lg font-semibold">{data.coach.user.name}</p>
				<p class="text-sm text-muted-foreground">Your Swimming Coach</p>
			</div>
		</CardTitle>
	</CardHeader>
	<CardContent class="flex flex-col h-[calc(100%-5rem)]">
		<div bind:this={scrollContainer} class="flex-1 overflow-y-auto pr-4">
			<div class="flex flex-col gap-4">
				{#each data.messages as message}
					<div
						class={cn(
							'flex gap-2 max-w-[80%]',
							message.isFromParent ? 'ml-auto flex-row-reverse' : 'flex-row'
						)}
					>
						<div
							class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm"
						>
							{message.isFromParent
								? getInitials(message.parent.user.name)
								: getInitials(message.coach.user.name)}
						</div>
						<div
							class={cn(
								'rounded-lg p-3',
								message.isFromParent ? 'bg-muted' : 'bg-primary text-primary-foreground'
							)}
						>
							<p>{message.content}</p>
							<p class="text-xs opacity-70 mt-1">
								{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<form on:submit={handleSubmit} class="flex gap-2 mt-4">
			<Input
				type="text"
				bind:value={messageInput}
				placeholder="Type your message..."
				class="flex-1"
			/>
			<Button type="submit">Send</Button>
		</form>
	</CardContent>
</Card>
