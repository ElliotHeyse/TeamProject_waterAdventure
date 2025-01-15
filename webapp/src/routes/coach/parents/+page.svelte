<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.parents()}</h2>
			<p class="text-muted-foreground">{m.manage_parents()}</p>
		</div>
	</div>

	<DataTable parents={data.parents} />
</div>
