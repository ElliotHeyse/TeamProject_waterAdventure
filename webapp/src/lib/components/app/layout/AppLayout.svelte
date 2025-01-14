<script lang="ts">
	import { Button } from "$lib/components/coach/ui/button";
	import { Sheet, SheetContent, SheetTrigger } from "$lib/components/coach/ui/sheet";
	import { Menu } from "lucide-svelte";
	import AppSidebar from "./AppSidebar.svelte";
	import AppHeader from "./AppHeader.svelte";
	import { isSidebarOpen } from "$lib/stores/sidebar";
	
	let { children } = $props<{ children: any }>();
</script>

<div class="relative flex min-h-screen">
	<!-- Desktop Sidebar -->
	<div class={`lg:block ${$isSidebarOpen ? 'block' : 'hidden'}`}>
		<AppSidebar />
	</div>

	<!-- Mobile Sidebar -->
	<Sheet>
		<SheetTrigger asChild>
			<Button variant="ghost" class="lg:hidden absolute left-4 top-4 p-0 w-10 h-10">
				<Menu class="h-6 w-6" />
			</Button>
		</SheetTrigger>
		<SheetContent side="left" class="p-0 w-64">
			<AppSidebar />
		</SheetContent>
	</Sheet>

	<div class="flex-1 flex flex-col">
		<AppHeader />
		<!-- Main Content -->
		<main class="flex-1 px-4 py-4 lg:px-8">
			{@render children()}
		</main>
	</div>
</div>