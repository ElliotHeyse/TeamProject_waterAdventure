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
				BEGINNER: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50',
				INTERMEDIATE: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200/50',
				ADVANCED: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200/50'
			}
		},
		defaultVariants: {
			level: 'BEGINNER'
		}
	});

	const iconVariants = tv({
		variants: {
			level: {
				BEGINNER: 'text-emerald-500',
				INTERMEDIATE: 'text-sky-500',
				ADVANCED: 'text-violet-500'
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
