<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">All Submissions</h2>
			<p class="text-muted-foreground">View and manage all student submissions</p>
		</div>
	</div>

	<DataTable submissions={data.submissions} />
</div>
