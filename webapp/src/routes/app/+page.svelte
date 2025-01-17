<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { goto } from '$app/navigation';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import {isMobileView} from '$lib/stores/viewport';
	import { cn } from '$lib/components/coach/utils';
	import badge from '$lib/img/badge-placeholder.svg';

	interface Child {
		id: string;
		name: string;
		currentLevel: string;
		currentLevelOrder: number;
		latestReview?: {
			lessonOrder: number;
			updatedAt: string;
			review?: {
				feedback: string;
				coach?: {
					user?: {
						name: string;
					};
				};
			};
		};
	}

	const { data } = $props<{ data: { children: Child[] } }>();

	const selectedChild = $derived(
		data.children.find((child: Child) => child.id === $selectedChildIdStore) || data.children[0]
	);

	function handleReviewClick(child: Child) {
		if (child.latestReview?.review) {
			goto(`/app/levels/${child.latestReview.lessonOrder}#feedback`);
		}
	}

	const TOTAL_LEVELS = 7;
</script>

<div class="mx-auto space-y-6">
	{#if selectedChild}

	<button
		class="cursor-pointer w-full "
		onclick={() => goto("/app/levels")}
		type="button"
	>
		<div class="bg-blue-100 flex flex-col gap-4 p-6 items-center">
			<div class="flex flex-col gap-2 items-center">
				<div>
					<img src={badge} alt="Progress badge">
				</div>
				<div>
					<h1 class="text-[28px] leading-[120%] text-main">BEGINNER</h1>
				</div>
			</div>
			<div class="w-full flex flex-col gap-[4px]">
				<div class="flex justify-between">
					<div>
						<span class="text-sm text-gray-500">Level</span>
					</div>
					<div class="flex gap-0">
						<span class="text-sm text-main font-bold">3</span>
						<span class="text-sm text-gray-500">/7</span>
					</div>
				</div>
				<div class="h-2 w-full rounded-full bg-muted">
					<div
						class="h-full rounded-full bg-blue-500 transition-all"
						style="width: {(selectedChild.currentLevelOrder / TOTAL_LEVELS) * 100}%"
					></div>
				</div>
			</div>
		</div>
	</button>

	<div class="flex flex-col gap-6 py-6 px-4">
		<div>Next level content</div>
		<div>Notifications content</div>
	</div>

	<!-- <div>
		<h2 class={cn("text-2xl font-bold",
			$isMobileView ? 'hidden' : "")}>
			{selectedChild.name}
		</h2>
		<div class="grid gap-6 md:grid-cols-2">
			<button
				class="cursor-pointer hover:shadow-md transition-shadow w-full text-left"
				onclick={() => goto(`/app/levels/${selectedChild.currentLevelOrder}`)}
				type="button"
			>
				<Card>
					<CardContent>
						<div class="space-y-4">
							<div>
								<p class="text-lg font-semibold">{selectedChild.currentLevel}</p>
								<div class="h-2 w-full rounded-full bg-muted mt-2">
									<div
										class="h-full rounded-full bg-primary transition-all"
										style="width: {(selectedChild.currentLevelOrder / TOTAL_LEVELS) * 100}%"
									></div>
								</div>
								<p class="text-sm text-muted-foreground mt-1">
									Level {selectedChild.currentLevelOrder} out of {TOTAL_LEVELS} levels
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</button>

			<button
				class="cursor-pointer hover:shadow-md transition-shadow w-full text-left"
				onclick={() => handleReviewClick(selectedChild)}
				type="button"
			>
				<Card>
					<CardHeader>
						<CardTitle>Latest Feedback (mag weg, want notifications)</CardTitle>
					</CardHeader>
					<CardContent>
						{#if selectedChild.latestReview?.review}
							<div class="space-y-2">
								<p class="text-muted-foreground text-sm">
									Reviewed by {selectedChild.latestReview.review.coach?.user?.name || 'Unknown'} on
									{new Date(selectedChild.latestReview.updatedAt).toLocaleDateString()}
								</p>
								<p>{selectedChild.latestReview.review.feedback}</p>
							</div>
						{:else}
							<p class="text-muted-foreground">No reviews yet</p>
						{/if}
					</CardContent>
				</Card>
			</button>

			<Card>
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
				</CardHeader>
				<CardContent>
					<p>All notifications displayed here</p>
				</CardContent>
			</Card>
		</div>
	</div> -->
	{/if}
</div>
