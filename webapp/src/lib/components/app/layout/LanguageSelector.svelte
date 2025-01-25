<script lang="ts">
	import * as Select from '$lib/components/coach/ui/select';
	import { i18n } from '$lib/i18n';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { goto } from '$app/navigation';

	async function handleLanguageChange(newLang: AvailableLanguageTag) {
		const currentPath = window.location.pathname;
		const currentLang = i18n.strategy.getLanguageFromLocalisedPath(currentPath) || 'en';
		const canonicalPath = i18n.strategy.getCanonicalPath(currentPath, currentLang);

		// Navigate to new language path
		if (newLang === 'en') {
			await goto(canonicalPath, { invalidateAll: true });
		} else {
			const newPath = i18n.strategy.getLocalisedPath(canonicalPath, newLang);
			await goto(newPath, { invalidateAll: true });
		}
	}

	const currentLang = i18n.strategy.getLanguageFromLocalisedPath(window.location.pathname) || 'en';
</script>

<Select.Root type="single" value={currentLang} onValueChange={(value) => handleLanguageChange(value as AvailableLanguageTag)}>
	<Select.Trigger class="w-32 bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50">
		<div class="flex items-center justify-center font-medium">
			{#if currentLang === 'en'}
				<span>English</span>
			{:else if currentLang === 'nl'}
				<span>Nederlands</span>
			{:else}
				<span>Français</span>
			{/if}
		</div>
	</Select.Trigger>
	<Select.Content class="bg-white border-2 border-gray-300 min-w-[128px]">
		<Select.Item value="en" class="hover:bg-gray-100 text-gray-900 font-medium">English</Select.Item>
		<Select.Item value="nl" class="hover:bg-gray-100 text-gray-900 font-medium">Nederlands</Select.Item>
		<Select.Item value="fr" class="hover:bg-gray-100 text-gray-900 font-medium">Français</Select.Item>
	</Select.Content>
</Select.Root> 