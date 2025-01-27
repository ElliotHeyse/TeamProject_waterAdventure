<script lang="ts">
	import { cn } from '$lib/components/coach/utils';
	import AppSidebar from './AppSidebar.svelte';
	import AppHeader from './AppHeader.svelte';
	import { isMobileView } from '$lib/stores/viewport';
</script>

<div class="relative flex min-h-screen">
	<!-- Desktop Sidebar -->
	<div
		class={cn(
			$isMobileView ? 'fixed bottom-0 min-h-fit w-full z-50' : 'block w-16'
			// : `lg:block ${$isSidebarOpen ? 'block' : 'hidden'}`
		)}
	>
		<AppSidebar />
	</div>

	<!-- Mobile Sidebar -->
	<!-- <Sheet>
		<SheetTrigger asChild>
			<Button variant="ghost" class="absolute w-10 h-10 p-0 lg:hidden left-4 top-4">
				<Menu class="w-6 h-6" />
			</Button>
		</SheetTrigger>
		<SheetContent side="left" class="w-64 p-0">
			<AppSidebar />
		</SheetContent>
	</Sheet> -->

	<div class="flex flex-col flex-1">
		<AppHeader />
		<!-- Main Content -->
		<main class="flex-1">
			<slot />
		</main>
	</div>
</div>
