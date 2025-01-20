<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/coach/ui/table';
	import * as m from '$lib/paraglide/messages.js';
	import DataTableActions from './data-table-actions.svelte';

	interface Parent {
		id: string;
		user: {
			name: string;
			email: string;
		};
		phone: string | null;
		pupils: {
			id: string;
			name: string;
		}[];
	}

	let { parents } = $props<{ parents: Parent[] }>();
</script>

<div class="rounded-md border">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>{m.name()}</TableHead>
				<TableHead>{m.email()}</TableHead>
				<TableHead>{m.phone()}</TableHead>
				<TableHead>{m.pupils()}</TableHead>
				<TableHead class="w-[0px]" />
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each parents as parent}
				<TableRow>
					<TableCell>{parent.user.name}</TableCell>
					<TableCell>{parent.user.email}</TableCell>
					<TableCell>{parent.phone || '-'}</TableCell>
					<TableCell>
						{parent.pupils.map((pupil: { name: string }) => pupil.name).join(', ') || '-'}
					</TableCell>
					<TableCell>
						<DataTableActions id={parent.id} />
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
