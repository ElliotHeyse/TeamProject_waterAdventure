<script lang="ts">
	import AppLayout from '$lib/components/app/layout/AppLayout.svelte';
	import { userSettings } from '$lib/stores/userSettings';
	import { onMount } from 'svelte';

	export let data;

	onMount(() => {
		userSettings.load();
	});
</script>

<AppLayout>
	<slot />
</AppLayout>
