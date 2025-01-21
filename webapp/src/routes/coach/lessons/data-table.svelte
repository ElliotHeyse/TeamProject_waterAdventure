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
	import type { Level, LevelLanguageContent } from '@prisma/client';
	import DataTableCheckbox from './data-table-checkbox.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface LevelWithLanguageContent extends Level {
		languageContents: LevelLanguageContent[];
	}

	let { levels }: { levels: LevelWithLanguageContent[] } = $props();
	let filterValue = $state('');
	let table: TableType<LevelWithLanguageContent> | undefined = $state();

	const columns: ColumnDef<LevelWithLanguageContent>[] = [
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
			accessorKey: 'levelNumber',
			header: m.level_number(),
			enableSorting: true,
			cell: ({ row }) => {
				const levelNumber = row.getValue<number>('levelNumber');
				const levelNumberSnippet = createRawSnippet<[number]>((getLevelNumber) => {
					const levelNumber = getLevelNumber();
					return {
						render: () => `<div>${levelNumber}</div>`
					};
				});
				return renderSnippet(levelNumberSnippet, levelNumber);
			}
		},
		{
			id: 'title',
			header: m.title(),
			enableSorting: true,
			cell: ({ row }) => {
				const title = row.original.languageContents[0]?.title ?? '';
				const titleSnippet = createRawSnippet<[string]>((getTitle) => {
					const title = getTitle();
					return {
						render: () => `<div class="font-medium">${title}</div>`
					};
				});
				return renderSnippet(titleSnippet, title);
			},
			filterFn: (row, id, value) => {
				const title = row.original.languageContents[0]?.title ?? '';
				return title.toLowerCase().includes((value as string).toLowerCase());
			}
		},
		{
			id: 'description',
			header: m.description(),
			enableSorting: false,
			cell: ({ row }) => {
				const description = row.original.languageContents[0]?.description ?? '';
				const descriptionSnippet = createRawSnippet<[string]>((getDescription) => {
					const description = getDescription();
					return {
						render: () => `<div class="truncate max-w-[500px]">${description}</div>`
					};
				});
				return renderSnippet(descriptionSnippet, description);
			}
		},
		{
			accessorKey: 'duration',
			header: m.duration(),
			enableSorting: true,
			cell: ({ row }) => {
				const duration = row.getValue<number>('duration');
				const durationSnippet = createRawSnippet<[number]>((getDuration) => {
					const duration = getDuration();
					return {
						render: () => `<div>${m.duration_minutes({ duration })}</div>`
					};
				});
				return renderSnippet(durationSnippet, duration);
			}
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
			return levels;
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
			placeholder={m.filter_levels()}
			value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
			onchange={(e) => {
				table.getColumn('title')?.setFilterValue(e.currentTarget.value);
			}}
			oninput={(e) => {
				table.getColumn('title')?.setFilterValue(e.currentTarget.value);
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
				{#each table.getHeaderGroups() as headerGroup}
					<Table.Row>
						{#each headerGroup.headers as header}
							<Table.Head>
								{#if !header.isPlaceholder}
									<div class="flex items-center space-x-2">
										<FlexRender
											of={header.column.columnDef.header}
											{header}
										/>
										{#if header.column.getCanSort()}
											<Button
												variant="ghost"
												size="sm"
												class="-ml-3 h-8 data-[state=open]:bg-accent"
												onclick={() => header.column.toggleSorting()}
											>
												<ArrowUpDown class="size-4" />
											</Button>
										{/if}
									</div>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#if table.getRowModel().rows?.length}
					{#each table.getRowModel().rows as row}
						<Table.Row data-state={row.getIsSelected() ? 'selected' : undefined}>
							{#each row.getVisibleCells() as cell}
								<Table.Cell>
									<FlexRender of={cell.column.columnDef.cell} {cell} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell
							colSpan={columns.length}
							class="h-24 text-center"
						>
							{m.no_results()}
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="text-muted-foreground flex-1 text-sm">
			{#if table.getFilteredSelectedRowModel().rows.length}
				{m.selected_rows({ count: table.getFilteredSelectedRowModel().rows.length })}
			{/if}
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
