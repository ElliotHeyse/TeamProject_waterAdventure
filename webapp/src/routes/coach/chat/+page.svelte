<script lang="ts">
	import Button from '$lib/components/coach/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { io, type Socket } from 'socket.io-client';
	import type { PageData } from './$types';
	import type { Parent, Pupil, User } from '@prisma/client';
	import { onMount } from 'svelte';
	import { getGravatarUrl } from '$lib/utils/gravatar';

	const { data } = $props<{ data: PageData }>();
	let parents: (Parent & { user: User; pupils: Pupil[]; unreadCount: number })[] = $state(data.parents);

	let messages = $state<
		{
			id: string;
			content: string;
			createdAt: string;
			parentId: string;
			coachId: string;
			parent: { user: { name: string } };
			coach: { user: { name: string } };
			sender: string;
			isRead: boolean;
		}[]
	>([]);

	let selectedParent: (Parent & { user: User; pupils: Pupil[] }) | null = $state(null);
	let newMessage = $state('');
	let socket: Socket;
	let scrollContainer: HTMLDivElement | null = $state(null);

	// Handle scrolling whenever messages change
	$effect(() => {
		if (scrollContainer && messages.length > 0) {
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

	async function selectParent(parent: Parent & { user: User; pupils: Pupil[] }) {
		selectedParent = parent;
		if (!parent) return;

		// Fetch messages for this conversation
		const response = await fetch(`/api/messages?parentId=${parent.id}&coachId=${data.coach.id}`);
		if (response.ok) {
			messages = await response.json();

			// Mark messages from this parent as read
			const unreadMessages = messages.filter(m => m.sender === 'PARENT' && !m.isRead);
			if (unreadMessages.length > 0) {
				await fetch('/api/mark-messages-read', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						messageIds: unreadMessages.map(m => m.id)
					})
				});

				// Update the unread count in the UI
				parents = parents.map((p) =>
					p.id === parent.id ? { ...p, unreadCount: 0 } : p
				);
			}
		}

		// Join the chat room for this conversation
		if (socket) {
			socket.emit('join_chat', {
				coachId: data.coach.id,
				parentId: parent.id
			});
		}
	}

	onMount(() => {
		selectParent(parents[0]);
	});

	function initSocket() {
		socket = io({
			path: '/socket.io'
		});

		socket.on('message', (message) => {
			if (message.coachId === data.coach.id) {
				// Update messages if we're in the chat
				if (selectedParent && message.parentId === selectedParent.id) {
					messages = [...messages, message];
				}

				// Only increment unread count for new messages from parent
				if (message.sender === 'PARENT') {
					const isCurrentChat = selectedParent?.id === message.parentId;
					if (!isCurrentChat) {
						parents = parents.map(p =>
							p.id === message.parentId
								? { ...p, unreadCount: (p.unreadCount || 0) + 1 }
								: p
						);
					}
				}
			}
		});

		socket.on('error', (error) => {
			console.error('Socket error:', error);
		});

		socket.on('connect', () => {
			console.log('Connected to chat server');
			// Re-join chat room if we have a selected parent
			if (selectedParent) {
				socket.emit('join_chat', {
					coachId: data.coach.id,
					parentId: selectedParent.id
				});
			}
		});

		socket.on('disconnect', () => {
			console.log('Disconnected from chat server');
		});
	}

	function cleanup() {
		if (socket) {
			socket.disconnect();
		}
	}

	$effect.root(() => {
		initSocket();
		return cleanup;
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!newMessage.trim() || !socket || !selectedParent) return;

		const message = {
			content: newMessage,
			coachId: data.coach.id,
			parentId: selectedParent.id,
			sender: 'COACH'
		};

		socket.emit('message', message);
		newMessage = '';
	}
</script>

<div class="flex h-[calc(100vh-theme(spacing.16))]">
	<!-- Conversation List -->
	<div class="border-border bg-background/50 flex w-80 flex-col border-r">
		<div class="border-border flex h-14 items-center border-b px-4">
			<h2 class="text-foreground text-lg font-semibold">{m.messages()}</h2>
		</div>
		<div class="flex-1 overflow-y-auto">
			{#each parents as parent}
				<button
					class={{
						'w-full p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none': true,
						'bg-muted/80': selectedParent?.id === parent.id
					}}
					onclick={() => selectParent(parent)}
				>
					<div class="flex items-center gap-2 relative">
						<img src={getGravatarUrl(parent.user.email, 40)} alt="" />
						<div class="flex flex-col min-w-0 flex-1">
							<span class="text-sm font-medium">{parent.user.name}</span>
							<span class="text-xs text-muted-foreground truncate">
								{parent.pupils.map((p: { id: string; name: string }) => p.name).join(', ')}
							</span>
						</div>
						{#if parent.unreadCount > 0}
							<div class="absolute -right-2 top-1/2 -translate-y-1/2">
								<span class="bg-[#FF5555] text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 font-medium">
									{parent.unreadCount}
								</span>
							</div>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Chat Area -->
	<div class="bg-background flex flex-1 flex-col">
		{#if selectedParent}
			<div class="border-border flex h-14 items-center justify-between border-b px-4">
				<div>
					<h3 class="text-foreground font-semibold">{selectedParent.user.name}</h3>
					<p class="text-muted-foreground text-sm">{selectedParent.user.email}</p>
				</div>
			</div>

			<div bind:this={scrollContainer} class="flex-1 space-y-4 overflow-y-auto p-4">
				{#each messages as message}
					<div
						class="flex"
						class:justify-end={message.coachId === data.coach.id && message.sender === 'COACH'}
					>
						<div
							class="max-w-[70%] rounded-lg p-3 shadow-sm"
							class:bg-muted={message.coachId !== data.coach.id || message.sender !== 'COACH'}
							class:bg-primary={message.coachId === data.coach.id && message.sender === 'COACH'}
							class:text-primary-foreground={message.coachId === data.coach.id &&
								message.sender === 'COACH'}
						>
							<p class="text-sm font-medium">
								{message.coachId === data.coach.id && message.sender === 'COACH'
									? message.coach.user.name
									: message.parent.user.name}
							</p>
							<p class="mt-1">{message.content}</p>
							<p class="text-muted-foreground mt-1 text-xs">
								{new Date(message.createdAt).toLocaleTimeString()}
							</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="border-border border-t bg-background p-4">
				<form onsubmit={handleSubmit} class="flex gap-4">
					<input
						type="text"
						bind:value={newMessage}
						class="border-input ring-offset-background focus:ring-ring flex-1 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder={m.type_message()}
					/>
					<Button type="submit" disabled={!newMessage.trim()}>{m.send()}</Button>
				</form>
			</div>
		{:else}
			<div class="text-muted-foreground flex flex-1 items-center justify-center">
				{m.select_conversation()}
			</div>
		{/if}
	</div>
</div>
