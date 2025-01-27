<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.all_submissions()}</h2>
			1
			<p class="text-muted-foreground">{m.manage_student_submissions()}</p>
		</div>
	</div>

	<DataTable submissions={data.submissions} data={{ levels: data.levels }} />
</div>
