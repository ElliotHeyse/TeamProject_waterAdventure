<script lang="ts">
	import { Icon, AcademicCap } from 'svelte-hero-icons';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/coach/ui/badge';
	import { tv } from 'tailwind-variants';

	let { level = $bindable('BEGINNER') }: { level: string } = $props();

	const levelVariants = tv({
		base: 'transition-colors',
		variants: {
			level: {
				BEGINNER:
					'bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/30',
				INTERMEDIATE:
					'bg-sky-100 dark:bg-sky-500/20 hover:bg-sky-200 dark:hover:bg-sky-500/30 text-sky-700 dark:text-sky-400 border-sky-200/50 dark:border-sky-500/30',
				ADVANCED:
					'bg-violet-100 dark:bg-violet-500/20 hover:bg-violet-200 dark:hover:bg-violet-500/30 text-violet-700 dark:text-violet-400 border-violet-200/50 dark:border-violet-500/30'
			}
		},
		defaultVariants: {
			level: 'BEGINNER'
		}
	});

	const iconVariants = tv({
		variants: {
			level: {
				BEGINNER: 'text-emerald-600 dark:text-emerald-400',
				INTERMEDIATE: 'text-sky-600 dark:text-sky-400',
				ADVANCED: 'text-violet-600 dark:text-violet-400'
			}
		},
		defaultVariants: {
			level: 'BEGINNER'
		}
	});

	const formattedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
</script>

<Badge
	variant="outline"
	class={cn(
		'gap-1.5 pl-2 pr-2.5 font-medium',
		levelVariants({ level: level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })
	)}
>
	<Icon
		src={AcademicCap}
		class={cn(
			'h-3.5 w-3.5',
			iconVariants({ level: level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })
		)}
	/>
	{formattedLevel}
</Badge>
