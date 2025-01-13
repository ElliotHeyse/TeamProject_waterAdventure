<script lang="ts">
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ChevronUp from 'lucide-svelte/icons/chevron-up';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		type Table as TableType,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { createRawSnippet } from 'svelte';
	import DataTableActions from './data-table-actions.svelte';
	import * as Table from '$lib/components/coach/ui/table/index';
	import { Button } from '$lib/components/coach/ui/button/index';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu/index';
	import { Input } from '$lib/components/coach/ui/input/index';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/coach/ui/data-table/index';
	import type { Level } from '@prisma/client';
	import LevelBadge from '$lib/components/coach/ui/badge/level-badge.svelte';
	import DataTableCheckbox from './data-table-checkbox.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Pupil {
		id: string;
		name: string;
		dateOfBirth: Date;
		level: Level;
		parent: {
			id: string;
			user: {
				name: string;
				email: string;
			};
		};
	}

	let { pupils }: { pupils: Pupil[] } = $props();
	let filterValue = $state('');
	let table: TableType<Pupil> | undefined = $state();

	function calculateAge(dateOfBirth: Date): number {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}

	const columns: ColumnDef<Pupil>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(DataTableCheckbox, {
					checked: table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(value),
					indeterminate: table.getIsSomePageRowsSelected(),
					'aria-label': m.select_all()
				}),
			cell: ({ row }) =>
				renderComponent(DataTableCheckbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(value),
					'aria-label': m.select_row()
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'name',
			header: m.name(),
			enableSorting: true,
			cell: ({ row }) => {
				const name = row.getValue<string>('name');
				const nameSnippet = createRawSnippet<[string]>((getName) => {
					const name = getName();
					return {
						render: () => `<div class="font-medium">${name}</div>`
					};
				});
				return renderSnippet(nameSnippet, name);
			},
			filterFn: (row, id, value) => {
				const name = row.getValue<string>(id);
				return name.toLowerCase().includes((value as string).toLowerCase());
			}
		},
		{
			accessorKey: 'dateOfBirth',
			header: m.age(),
			enableSorting: true,
			cell: ({ row }) => {
				const dateOfBirth = row.getValue<Date>('dateOfBirth');
				const ageSnippet = createRawSnippet<[Date]>((getDateOfBirth) => {
					const dateOfBirth = getDateOfBirth();
					return {
						render: () => `<div>${calculateAge(dateOfBirth)}</div>`
					};
				});
				return renderSnippet(ageSnippet, dateOfBirth);
			}
		},
		{
			accessorKey: 'level',
			header: m.level(),
			enableSorting: true,
			cell: ({ row }) => {
				const level = row.getValue<Level>('level');
				return renderComponent(LevelBadge, {
					level
				});
			}
		},
		{
			accessorKey: 'parent.user.name',
			header: m.parent_info(),
			enableSorting: true
		},
		{
			accessorKey: 'parent.user.email',
			header: m.email(),
			enableSorting: true
		},
		{
			id: 'actions',
			header: m.actions(),
			cell: ({ row }) => renderComponent(DataTableActions, { id: row.original.id })
		}
	];

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	table = createSvelteTable({
		get data() {
			return pupils;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});
</script>

<div class="w-full">
	<div class="flex items-center py-4">
		<Input
			placeholder={m.filter_pupils()}
			value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
			onchange={(e) => {
				table.getColumn('name')?.setFilterValue(e.currentTarget.value);
			}}
			oninput={(e) => {
				table.getColumn('name')?.setFilterValue(e.currentTarget.value);
			}}
			class="max-w-sm"
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ml-auto">
						{m.columns()}
						<ChevronDown class="ml-2 size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="[&:has([role=checkbox])]:pl-3">
								{#if !header.isPlaceholder}
									<div class="flex items-center space-x-2">
										<button
											class="flex items-center space-x-2"
											onclick={() => header.column.toggleSorting()}
										>
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
											{#if header.column.getCanSort()}
												<span class="ml-2">
													{#if header.column.getIsSorted() === 'asc'}
														<ChevronUp class="size-4" />
													{:else if header.column.getIsSorted() === 'desc'}
														<ChevronDown class="size-4" />
													{:else}
														<ArrowUpDown class="size-4" />
													{/if}
												</span>
											{/if}
										</button>
									</div>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="[&:has([role=checkbox])]:pl-3">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">
							{m.no_results()}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 pt-4">
		<div class="text-muted-foreground flex-1 text-sm">
			{m.rows_selected({
				selected: table.getFilteredSelectedRowModel().rows.length,
				total: table.getFilteredRowModel().rows.length
			})}
		</div>
		<div class="space-x-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				{m.previous()}
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				{m.next()}
			</Button>
		</div>
	</div>
</div>
