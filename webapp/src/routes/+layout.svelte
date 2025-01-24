<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import { userSettings } from '$lib/stores/userSettings';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { Language } from '$lib/stores/userSettings';
	import { page } from '$app/stores';

	import '../lib/styles/app.css';

	let { children, data } = $props();

	// Initialize settings from server data
	$effect(() => {
		if (browser && data?.settings) {
			const settings = {
				...data.settings,
				language: data.settings.language as Language
			};
			userSettings.set(settings);

			// Handle language path
			const currentPath = window.location.pathname;
			const currentLang = i18n.strategy.getLanguageFromLocalisedPath(currentPath) || 'en';

			// Only redirect if the current path language doesn't match the user's preferred language
			if (currentLang !== settings.language && settings.language !== 'en') {
				const canonicalPath = i18n.strategy.getCanonicalPath(currentPath, currentLang as Language);
				const newPath = i18n.strategy.getLocalisedPath(canonicalPath, settings.language);
				goto(newPath, { 
					invalidateAll: true,
					state: { preservedTheme: settings.theme }
				});
			}
		}
	});

	// Load settings from API when user logs in
	onMount(() => {
		if (browser && data?.user) {
			userSettings.load();
		}
	});
</script>

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>
