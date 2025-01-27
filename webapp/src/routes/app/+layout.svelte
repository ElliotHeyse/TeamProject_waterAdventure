<script lang="ts">
	import AppLayout from '$lib/components/app/layout/AppLayout.svelte';
	import { userSettings } from '$lib/stores/userSettings';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		userSettings.load();
	});
</script>

<AppLayout>
	{@render children()}
</AppLayout>
