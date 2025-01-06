<script lang="ts">
	import { CheckCircle, Clock, Icon } from 'svelte-hero-icons';

	interface Submission {
		id: number;
		pupilName: string;
		lessonTitle: string;
		date: string;
		status: 'pending' | 'reviewed';
		videoUrl: string;
		feedback: string;
	}

	let submissions = $state<Submission[]>([
		{
			id: 1,
			pupilName: 'Alice Johnson',
			lessonTitle: 'Freestyle Basics',
			date: '2024-01-05',
			status: 'pending',
			videoUrl: 'https://example.com/video1',
			feedback: ''
		},
		{
			id: 2,
			pupilName: 'Bob Smith',
			lessonTitle: 'Advanced Backstroke',
			date: '2024-01-04',
			status: 'reviewed',
			videoUrl: 'https://example.com/video2',
			feedback: 'Good form, but work on arm position'
		}
	]);

	let selectedSubmission = $state<Submission | null>(null);
	let feedback = $state('');

	function reviewSubmission(submission: Submission) {
		selectedSubmission = submission;
		feedback = submission.feedback;
	}

	function submitReview() {
		if (selectedSubmission) {
			submissions = submissions.map((s) =>
				s.id === selectedSubmission!.id ? { ...s, status: 'reviewed', feedback } : s
			);
			selectedSubmission = null;
			feedback = '';
		}
	}

	let pendingCount = $derived(submissions.filter((s) => s.status === 'pending').length);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">Submissions</h2>
			<p class="mt-1 text-gray-600">
				{pendingCount} pending reviews
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Submissions List -->
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<div class="border-b border-gray-200 p-4">
				<h3 class="font-semibold text-gray-900">All Submissions</h3>
			</div>
			<div class="divide-y divide-gray-200">
				{#each submissions as submission}
					<button
						class="w-full cursor-pointer p-4 text-left hover:bg-gray-50"
						class:bg-blue-50={selectedSubmission?.id === submission.id}
						onclick={() => reviewSubmission(submission)}
					>
						<div class="flex items-start justify-between">
							<div>
								<h4 class="font-medium text-gray-900">{submission.pupilName}</h4>
								<p class="text-sm text-gray-600">{submission.lessonTitle}</p>
								<p class="text-sm text-gray-500">Submitted on {submission.date}</p>
							</div>
							<span
								class="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
								class:bg-yellow-100={submission.status === 'pending'}
								class:text-yellow-800={submission.status === 'pending'}
								class:bg-green-100={submission.status === 'reviewed'}
								class:text-green-800={submission.status === 'reviewed'}
							>
								<Icon src={submission.status === 'pending' ? Clock : CheckCircle} class="h-4 w-4" />
								{submission.status}
							</span>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Review Panel -->
		<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
			{#if selectedSubmission}
				<div class="space-y-6 p-6">
					<div>
						<h3 class="text-lg font-semibold text-gray-900">Review Submission</h3>
						<p class="text-gray-600">
							{selectedSubmission.pupilName} - {selectedSubmission.lessonTitle}
						</p>
					</div>

					<div class="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
						<!-- Video player would go here -->
						<p class="text-gray-500">Video Player Placeholder</p>
					</div>

					<div class="space-y-4">
						<label class="block">
							<span class="text-sm font-medium text-gray-700">Feedback</span>
							<textarea
								bind:value={feedback}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								rows="4"
								placeholder="Enter your feedback..."
							></textarea>
						</label>

						<div class="flex justify-end space-x-3">
							<button
								class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
								onclick={() => (selectedSubmission = null)}
							>
								Cancel
							</button>
							<button
								class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
								onclick={submitReview}
							>
								Submit Review
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="p-6 text-center text-gray-500">Select a submission to review</div>
			{/if}
		</div>
	</div>
</div>
