<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { goto } from '$app/navigation';
	import { selectedChildIdStore } from '$lib/stores/child.store';

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

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<Card>
			<CardHeader>
				<CardTitle>Welcome</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Welcome to your WaterAdventure dashboard!</p>
			</CardContent>
		</Card>
	</div>

	{#if selectedChild}
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">{selectedChild.name}</h2>
			<div class="grid gap-6 md:grid-cols-2">
				<button
					class="cursor-pointer hover:shadow-md transition-shadow w-full text-left"
					onclick={() => handleReviewClick(selectedChild)}
					type="button"
				>
					<Card>
						<CardHeader>
							<CardTitle>Latest Feedback</CardTitle>
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

				<button
					class="cursor-pointer hover:shadow-md transition-shadow w-full text-left"
					onclick={() => goto(`/app/levels/${selectedChild.currentLevelOrder}`)}
					type="button"
				>
					<Card>
						<CardHeader>
							<CardTitle>Level Progress</CardTitle>
						</CardHeader>
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
			</div>
		</div>
	{/if}
</div>
