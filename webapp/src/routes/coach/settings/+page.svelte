<script lang="ts">
	import { Label } from '$lib/components/coach/ui/label';
	import { Input } from '$lib/components/coach/ui/input';
	import { Button } from '$lib/components/coach/ui/button';
	import { Switch } from '$lib/components/coach/ui/switch';
	import * as Select from '$lib/components/coach/ui/select';
	import { Separator } from '$lib/components/coach/ui/separator';
	import { Icon, Sun, Moon } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/coach/ui/alert/alert.svelte';
	import AlertTitle from '$lib/components/coach/ui/alert/alert-title.svelte';
	import AlertDescription from '$lib/components/coach/ui/alert/alert-description.svelte';
	import { CircleAlert } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let formError: string | null = $state(null);

	// Profile settings
	let bio = $state(data.coach.bio || '');
	let specialties = $state(data.coach.specialties?.join(', ') || '');

	// Appearance settings
	let isDarkMode = $state(false);

	// Notification settings
	let emailNotifications = $state(true);
	let pushNotifications = $state(true);

	// Account settings
	let language = $state('en');

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		document.documentElement.classList.toggle('dark', isDarkMode);
		localStorage.setItem('darkMode', isDarkMode.toString());
	}

	onMount(() => {
		const savedDarkMode = localStorage.getItem('darkMode') === 'true';
		isDarkMode = savedDarkMode;
		document.documentElement.classList.toggle('dark', savedDarkMode);
	});
</script>

<div class="mx-auto space-y-6">
	<h1 class="text-3xl font-bold mb-8">Settings</h1>
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">Profile Settings</h3>
			<p class="text-muted-foreground text-sm">Manage your personal information</p>
		</div>
		<Separator />
		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				formError = null;
				return async ({ result }) => {
					if (result.type === 'failure') {
						formError = result.data?.message as string;
						toast.error('Failed to save settings', {
							description: result.data?.message as string
						});
					} else {
						toast.success('Settings saved successfully', {
							description: 'Your profile has been updated'
						});
					}
				};
			}}
			class="p-6 space-y-4"
		>
			{#if formError}
				<div class="alert-wrapper">
					<Alert variant="destructive">
						<CircleAlert class="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{formError}</AlertDescription>
					</Alert>
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input id="name" value={data.coach.user.name} disabled />
			</div>
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" value={data.coach.user.email} disabled />
			</div>
			<div class="space-y-2">
				<Label for="bio">Bio</Label>
				<Input
					id="bio"
					name="bio"
					bind:value={bio}
					placeholder="Tell us about yourself and your coaching experience..."
				/>
			</div>
			<div class="space-y-2">
				<Label for="specialties">Specialties</Label>
				<Input
					id="specialties"
					name="specialties"
					bind:value={specialties}
					placeholder="Enter your specialties separated by commas (e.g. Freestyle, Backstroke, Youth Training)"
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit">Save Profile</Button>
			</div>
		</form>
	</div>

	<!-- Appearance Settings -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">Appearance</h3>
			<p class="text-muted-foreground text-sm">Customize how SwimCoach looks</p>
		</div>
		<Separator />
		<div class="p-6">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>Dark Mode</Label>
					<div class="text-sm text-muted-foreground">Switch between light and dark mode</div>
				</div>
				<Button variant="outline" size="icon" onclick={toggleDarkMode}>
					<Icon src={isDarkMode ? Sun : Moon} class="h-5 w-5" />
				</Button>
			</div>
		</div>
	</div>

	<!-- Notification Settings -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">Notifications</h3>
			<p class="text-muted-foreground text-sm">Manage your notification preferences</p>
		</div>
		<Separator />
		<div class="p-6 space-y-4">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>Email Notifications</Label>
					<div class="text-sm text-muted-foreground">
						Receive email notifications about important updates
					</div>
				</div>
				<Switch bind:checked={emailNotifications} />
			</div>
			<Separator />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>Push Notifications</Label>
					<div class="text-sm text-muted-foreground">
						Receive push notifications in your browser
					</div>
				</div>
				<Switch bind:checked={pushNotifications} />
			</div>
		</div>
	</div>

	<!-- Account Settings -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">Account Settings</h3>
			<p class="text-muted-foreground text-sm">Manage your account preferences</p>
		</div>
		<Separator />
		<div class="p-6 space-y-4">
			<div class="space-y-2">
				<Label>Language</Label>
				<Select.Root type="single">
					<Select.Trigger class="w-[180px]">
						<span>{language === 'en' ? 'English' : language === 'nl' ? 'Dutch' : 'French'}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="en">English</Select.Item>
						<Select.Item value="nl">Dutch</Select.Item>
						<Select.Item value="fr">French</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>
</div>
