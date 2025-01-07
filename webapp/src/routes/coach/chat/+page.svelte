<script lang="ts">
	import Button from '$lib/components/coach/ui/button/button.svelte';

	interface Conversation {
		id: number;
		parent: string;
		pupil: string;
		lastMessage: string;
		timestamp: string;
		unread: boolean;
		email?: string;
		avatar?: string;
		pupils?: { id: string; name: string }[];
	}

	interface Message {
		id: number;
		sender: string;
		content: string;
		timestamp: string;
		isParent: boolean;
	}

	let conversations = $state<Conversation[]>([
		{
			id: 1,
			parent: 'Sarah Johnson',
			pupil: 'Alice Johnson',
			lastMessage: 'Thank you for the feedback!',
			timestamp: '10:30 AM',
			unread: true,
			email: 'sarah.johnson@example.com',
			pupils: [
				{ id: 'cm5m4l7l0000ilxo0lg0ra1nf', name: 'Alice Johnson' },
				{ id: 'cm5m4l7l0000ilxo0lg0ra1nf', name: 'Tom Johnson' }
			],
			avatar: 'SJ'
		},
		{
			id: 2,
			parent: 'Mike Smith',
			pupil: 'Bob Smith',
			lastMessage: 'When is the next lesson?',
			timestamp: 'Yesterday',
			unread: false,
			email: 'mike.smith@example.com',
			pupils: [{ id: 'cm5m4l7l0000ilxo0lg0ra1nf', name: 'Bob Smith' }],
			avatar: 'MS'
		}
	]);

	let selectedConversation = $state<Conversation | null>(null);
	let newMessage = $state('');

	let messages = $state<Message[]>([
		{
			id: 1,
			sender: 'Sarah Johnson',
			content: 'Hi, how is Alice progressing with her freestyle?',
			timestamp: '10:15 AM',
			isParent: true
		},
		{
			id: 2,
			sender: 'Coach',
			content: 'Alice is doing great! Her form has improved significantly in the last few weeks.',
			timestamp: '10:20 AM',
			isParent: false
		},
		{
			id: 3,
			sender: 'Sarah Johnson',
			content: 'Thank you for the feedback!',
			timestamp: '10:30 AM',
			isParent: true
		}
	]);

	function sendMessage(e: Event) {
		e.preventDefault();
		if (newMessage.trim() && selectedConversation) {
			messages = [
				...messages,
				{
					id: messages.length + 1,
					sender: 'Coach',
					content: newMessage,
					timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					isParent: false
				}
			];
			newMessage = '';
		}
	}

	function selectConversation(conversation: Conversation) {
		selectedConversation = conversation;
		// Mark as read
		conversations = conversations.map((c) =>
			c.id === conversation.id ? { ...c, unread: false } : c
		);
	}
</script>

<div class="flex h-[calc(100vh-theme(spacing.16))]">
	<!-- Conversation List -->
	<div class="border-border bg-background/50 flex w-80 flex-col border-r">
		<div class="border-border flex h-14 items-center border-b px-4">
			<h2 class="text-foreground text-lg font-semibold">Messages</h2>
		</div>
		<div class="flex-1 overflow-y-auto">
			{#each conversations as conversation}
				<button
					class={{
						'w-full p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none': true,
						'bg-muted/80': selectedConversation?.id === conversation.id
					}}
					onclick={() => selectConversation(conversation)}
				>
					<div class="flex items-start gap-3">
						<div
							class="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
						>
							{conversation.avatar}
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<p class="text-foreground font-medium">{conversation.parent}</p>
								<span class="text-muted-foreground text-xs">{conversation.timestamp}</span>
							</div>
							<p class="text-muted-foreground text-sm">Re: {conversation.pupil}</p>
							<p class="text-muted-foreground mt-1 line-clamp-1 text-sm">
								{conversation.lastMessage}
							</p>
						</div>
						{#if conversation.unread}
							<span class="bg-primary mt-1.5 h-2 w-2 rounded-full"></span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Chat Area -->
	<div class="bg-background flex flex-1 flex-col">
		{#if selectedConversation}
			<div class="border-border flex h-14 items-center justify-between border-b px-4">
				<div>
					<h3 class="text-foreground font-semibold">{selectedConversation.parent}</h3>
					<p class="text-muted-foreground text-sm">Re: {selectedConversation.pupil}</p>
				</div>
			</div>

			<div class="flex-1 space-y-4 overflow-y-auto p-4">
				{#each messages as message}
					<div class="flex" class:justify-end={!message.isParent}>
						<div
							class="max-w-[70%] rounded-lg p-3 shadow-sm"
							class:bg-muted={message.isParent}
							class:bg-primary={!message.isParent}
							class:text-primary-foreground={!message.isParent}
						>
							<p class="text-sm font-medium">{message.sender}</p>
							<p class="mt-1">{message.content}</p>
							<p class="text-muted-foreground mt-1 text-xs">{message.timestamp}</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="border-border border-t bg-background p-4">
				<form class="flex gap-4" onsubmit={sendMessage}>
					<input
						type="text"
						bind:value={newMessage}
						class="border-input ring-offset-background focus:ring-ring flex-1 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Type your message..."
					/>
					<button
						type="submit"
						class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
						disabled={!newMessage.trim()}
					>
						Send
					</button>
				</form>
			</div>
		{:else}
			<div class="text-muted-foreground flex flex-1 items-center justify-center">
				Select a conversation to start messaging
			</div>
		{/if}
	</div>

	<!-- Right Sidebar - Parent Information -->
	{#if selectedConversation}
		<div class="border-border bg-background/50 flex w-80 flex-col border-l">
			<div class="border-border flex h-14 items-center border-b px-4">
				<h2 class="text-foreground text-lg font-semibold">Parent Info</h2>
			</div>
			<div class="p-4">
				<div class="flex items-center gap-4">
					<div
						class="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full text-xl font-medium"
					>
						{selectedConversation.avatar}
					</div>
					<div>
						<h3 class="text-foreground text-lg font-semibold">{selectedConversation.parent}</h3>
						<p class="text-muted-foreground text-sm">{selectedConversation.email}</p>
					</div>
				</div>

				<div class="mt-6">
					<h4 class="text-foreground mb-2 font-medium">Pupils</h4>
					<div class="space-y-2">
						<hr />
						{#each selectedConversation.pupils || [] as pupil}
							<Button variant="link" href={`/coach/pupils/${pupil.id}`}>
								{pupil.name}
							</Button>
							<hr />
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
