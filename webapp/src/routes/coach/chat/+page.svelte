<script lang="ts">
	interface Conversation {
		id: number;
		parent: string;
		pupil: string;
		lastMessage: string;
		timestamp: string;
		unread: boolean;
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
			unread: true
		},
		{
			id: 2,
			parent: 'Mike Smith',
			pupil: 'Bob Smith',
			lastMessage: 'When is the next lesson?',
			timestamp: 'Yesterday',
			unread: false
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
	<div class="flex w-80 flex-col border-r border-gray-200 bg-white">
		<div class="border-b border-gray-200 p-4">
			<h2 class="text-lg font-semibold text-gray-900">Messages</h2>
		</div>
		<div class="flex-1 overflow-y-auto">
			{#each conversations as conversation}
				<button
					class="w-full p-4 text-left hover:bg-gray-50 focus:outline-none"
					class:bg-blue-50={selectedConversation?.id === conversation.id}
					onclick={() => selectConversation(conversation)}
				>
					<div class="flex items-start justify-between">
						<div>
							<p class="font-medium text-gray-900">{conversation.parent}</p>
							<p class="text-sm text-gray-600">Re: {conversation.pupil}</p>
							<p class="mt-1 line-clamp-1 text-sm text-gray-500">{conversation.lastMessage}</p>
						</div>
						<div class="flex flex-col items-end">
							<span class="text-xs text-gray-500">{conversation.timestamp}</span>
							{#if conversation.unread}
								<span class="mt-1 h-2 w-2 rounded-full bg-blue-600"></span>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Chat Area -->
	<div class="flex flex-1 flex-col bg-gray-50">
		{#if selectedConversation}
			<div class="border-b border-gray-200 bg-white p-4">
				<h3 class="font-semibold text-gray-900">{selectedConversation.parent}</h3>
				<p class="text-sm text-gray-600">Re: {selectedConversation.pupil}</p>
			</div>

			<div class="flex-1 space-y-4 overflow-y-auto p-4">
				{#each messages as message}
					<div class="flex" class:justify-end={!message.isParent}>
						<div
							class="max-w-[70%] rounded-lg bg-white p-3 shadow-sm"
							class:bg-blue-600={!message.isParent}
							class:text-white={!message.isParent}
						>
							<p class="text-sm font-medium">{message.sender}</p>
							<p class="mt-1">{message.content}</p>
							<p class="mt-1 text-xs opacity-75">{message.timestamp}</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="border-t border-gray-200 bg-white p-4">
				<form class="flex space-x-4" onsubmit={sendMessage}>
					<input
						type="text"
						bind:value={newMessage}
						class="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						placeholder="Type your message..."
					/>
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						disabled={!newMessage.trim()}
					>
						Send
					</button>
				</form>
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center text-gray-500">
				Select a conversation to start messaging
			</div>
		{/if}
	</div>
</div>
