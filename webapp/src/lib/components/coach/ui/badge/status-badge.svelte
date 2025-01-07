<script lang="ts">
	import { Icon, AcademicCap, Clock, CheckCircle } from 'svelte-hero-icons';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/coach/ui/badge';
	import { tv } from 'tailwind-variants';

	let { status = $bindable('PENDING') }: { status: string } = $props();

	const statusVariants = tv({
		base: 'transition-colors',
		variants: {
			status: {
				PENDING:
					'bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/30',
				REVIEWED:
					'bg-green-100 dark:bg-green-500/20 hover:bg-green-200 dark:hover:bg-green-500/30 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-500/30'
			}
		},
		defaultVariants: {
			status: 'PENDING'
		}
	});

	const iconVariants = tv({
		variants: {
			status: {
				PENDING: 'text-amber-600 dark:text-amber-400',
				REVIEWED: 'text-green-600 dark:text-green-400'
			}
		},
		defaultVariants: {
			status: 'PENDING'
		}
	});

	const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
</script>

<Badge
	variant="outline"
	class={cn(
		'gap-1.5 pl-2 pr-2.5 font-medium',
		statusVariants({ status: status as 'PENDING' | 'REVIEWED' })
	)}
>
	<Icon
		src={status === 'PENDING' ? Clock : CheckCircle}
		class={cn('h-3.5 w-3.5', iconVariants({ status: status as 'PENDING' | 'REVIEWED' }))}
	/>
	{formattedStatus}
</Badge>
