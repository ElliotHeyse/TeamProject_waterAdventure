<script lang="ts">
	import '$lib/styles/app.css';
	import Sidebar from '$lib/components/coach/layout/Sidebar.svelte';
	import Header from '$lib/components/coach/layout/Header.svelte';

	let { children } = $props();
	let isSidebarOpen = $state(true);
</script>

<div class="flex min-h-screen bg-gray-50">
	<Sidebar {isSidebarOpen} />

	<main class="flex flex-1 flex-col">
		<Header bind:isSidebarOpen />
		<div class="flex-1 p-6">
			{@render children()}
		</div>
	</main>
</div>
