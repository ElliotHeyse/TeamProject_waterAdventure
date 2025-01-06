<script lang="ts">
	import { BellAlert, UserCircle, Icon } from 'svelte-hero-icons';

	interface User {
		name: string;
		avatar: string;
	}

	interface Notification {
		id: number;
		message: string;
		timestamp: string;
	}

	let user = $state<User>({
		name: 'John Doe',
		avatar: ''
	});

	let notifications = $state<Notification[]>([]);
</script>

<header class="h-16 border-b border-gray-200 bg-white">
	<div class="container mx-auto h-full px-4">
		<div class="flex h-full items-center justify-between">
			<div class="flex-1">
				<h2 class="text-2xl font-semibold text-gray-800">Dashboard</h2>
			</div>

			<div class="flex items-center space-x-4">
				<button class="relative rounded-full p-2 hover:bg-gray-100">
					<Icon src={BellAlert} class="h-5 w-5 text-gray-600" />
					{#if notifications.length > 0}
						<span
							class="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
						>
							{notifications.length}
						</span>
					{/if}
				</button>

				<div class="flex items-center space-x-3">
					<Icon src={UserCircle} class="h-5 w-5 text-gray-600" />
					<span class="font-medium text-gray-700">{user.name}</span>
				</div>
			</div>
		</div>
	</div>
</header>
