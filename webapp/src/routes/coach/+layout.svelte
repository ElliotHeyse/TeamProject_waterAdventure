<script lang="ts">
	import '$lib/styles/app.css';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen bg-gray-50">
	<Sidebar />

	<main class="flex flex-1 flex-col">
		<Header />
		<div class="flex-1 p-6">
			{@render children()}
		</div>
	</main>
</div>
