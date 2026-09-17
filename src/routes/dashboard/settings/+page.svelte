<script lang="ts">
import { toast } from '$lib/stores/toast';
import { auth } from '$lib/stores/auth';

	let authState = $auth;

	let profileData = {
		firstName: authState.user?.first_name || 'Demo',
		lastName: authState.user?.last_name || 'User',
		email: authState.user?.email || '',
		phone: authState.user?.phone || '(555) 123-4567',
		dateOfBirth: '1990-01-15',
		address: '123 Main Street',
		city: 'New York',
		state: 'NY',
		zipCode: '10001'
	};

	let notifications = {
		email: true,
		sms: false,
		push: true,
		transactions: true,
		security: true,
		marketing: false
	};

	let preferences = {
		language: 'en',
		currency: 'USD',
		timezone: 'America/New_York'
	};

	function handleSaveProfile() {
		toast.success('Profile updated successfully!');
	}

	function handleSaveNotifications() {
		toast.success('Notification preferences saved!');
	}

	function handleSavePreferences() {
		toast.success('Preferences updated successfully!');
	}
</script>

<svelte:head>
	<title>Settings - QGR Investment</title>
</svelte:head>

<div>
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
		<p class="mt-2 text-slate-600">Manage your account settings and preferences.</p>
	</div>

	{#if $auth.user?.status === 'suspended'}
		<div class="mb-8 flex flex-col gap-4  border border-red-200 bg-red-50 p-5 shadow-sm sm:flex-row sm:items-center">
			<div class="flex h-12 w-12 shrink-0 items-center justify-center  bg-red-100 text-2xl">
				🚫
			</div>
			<div class="flex-1">
				<h3 class="text-sm font-bold text-red-900 sm:text-base">Profile Updates Restricted</h3>
				<p class="mt-0.5 text-xs text-red-700 sm:text-sm">
					Your account is currently suspended. While you can view your profile, personal data updates are temporarily disabled.
				</p>
			</div>
			<a href="mailto:support@quantumgesararedemption.com" 
				class=" bg-red-600 px-4 py-2 text-center text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors sm:px-5 sm:py-2.5 sm:text-sm">
				Contact Support
			</a>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Settings Navigation -->
		<div class="lg:col-span-1">
			<div
				class="sticky top-8 overflow-hidden  border border-slate-200 bg-white shadow-sm"
			>
				<nav class="space-y-1 p-4">
					<a
						href="#profile"
						class="flex items-center gap-3  px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
					>
						<span class="text-xl">👤</span>
						<span>Profile</span>
					</a>
					<a
						href="#notifications"
						class="flex items-center gap-3  px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
					>
						<span class="text-xl">🔔</span>
						<span>Notifications</span>
					</a>
					<a
						href="#preferences"
						class="flex items-center gap-3  px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
					>
						<span class="text-xl">⚙️</span>
						<span>Preferences</span>
					</a>
					<a
						href="#privacy"
						class="flex items-center gap-3  px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
					>
						<span class="text-xl">🔒</span>
						<span>Privacy</span>
					</a>
				</nav>
			</div>
		</div>

		<!-- Settings Content -->
		<div class="space-y-8 lg:col-span-2">
			<!-- Profile Section -->
			<section
				id="profile"
				class="overflow-hidden  border border-slate-200 bg-white shadow-sm"
			>
				<div class="border-b border-slate-200 p-6">
					<h3 class="text-lg font-bold text-slate-900">Profile Information</h3>
					<p class="mt-1 text-sm text-slate-500">Update your personal information</p>
				</div>
				<div class="space-y-6 p-6">
					<div class="mb-6 flex items-center gap-6">
						<div
							class="flex h-24 w-24 items-center justify-center  bg-gradient-to-br from-gold to-gold text-4xl font-bold text-white shadow-lg"
						>
							{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
						</div>
						<div>
							<button
								disabled={$auth.user?.status === 'suspended'}
								class=" bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Change Photo
							</button>
							<p class="mt-2 text-xs text-slate-500">JPG, PNG or GIF. Max 2MB.</p>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-2 block text-sm font-semibold text-slate-700">First Name</label>
							<input
								type="text"
								bind:value={profileData.firstName}
								disabled={$auth.user?.status === 'suspended'}
								class="block w-full  border border-slate-200 bg-white px-4 py-3 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm"
							/>
						</div>
						<div>
							<label class="mb-2 block text-sm font-semibold text-slate-700">Last Name</label>
							<input
								type="text"
								bind:value={profileData.lastName}
								disabled={$auth.user?.status === 'suspended'}
								class="block w-full  border border-slate-200 bg-white px-4 py-3 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm"
							/>
						</div>
					</div>

					<div>
						<label class="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
						<input
							type="email"
							bind:value={profileData.email}
							disabled={$auth.user?.status === 'suspended'}
							class="block w-full  border border-slate-200 bg-white px-4 py-3 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm"
						/>
					</div>

					<div>
						<label class="mb-2 block text-sm font-semibold text-slate-700">Phone Number</label>
						<input
							type="tel"
							bind:value={profileData.phone}
							disabled={$auth.user?.status === 'suspended'}
							class="block w-full  border border-slate-200 bg-white px-4 py-3 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm"
						/>
					</div>

					<div class="border-t border-slate-200 pt-4">
						<button
							onclick={handleSaveProfile}
							disabled={$auth.user?.status === 'suspended'}
							class=" bg-gold px-6 py-3 font-semibold text-white transition-all hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Save Changes
						</button>
					</div>
				</div>
			</section>

			<!-- Notifications Section -->
			<section
				id="notifications"
				class="overflow-hidden  border border-slate-200 bg-white shadow-sm"
			>
				<div class="border-b border-slate-200 p-6">
					<h3 class="text-lg font-bold text-slate-900">Notification Preferences</h3>
					<p class="mt-1 text-sm text-slate-500">Choose how you want to be notified</p>
				</div>
				<div class="space-y-4 p-6">
					<div class="flex items-center justify-between  bg-slate-50 p-4">
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center  bg-blue-100 text-xl"
							>
								📧
							</div>
							<div>
								<p class="font-semibold text-slate-900">Email Notifications</p>
								<p class="text-sm text-slate-500">Receive updates via email</p>
							</div>
						</div>
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" bind:checked={notifications.email} class="peer sr-only" />
							<div
								class="peer h-7 w-14  bg-slate-200 peer-checked:bg-gold peer-focus:ring-4 peer-focus:ring-emerald-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after: after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
							></div>
						</label>
					</div>

					<div class="flex items-center justify-between  bg-slate-50 p-4">
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center  bg-green-100 text-xl"
							>
								📱
							</div>
							<div>
								<p class="font-semibold text-slate-900">SMS Notifications</p>
								<p class="text-sm text-slate-500">Receive updates via text message</p>
							</div>
						</div>
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" bind:checked={notifications.sms} class="peer sr-only" />
							<div
								class="peer h-7 w-14  bg-slate-200 peer-checked:bg-gold peer-focus:ring-4 peer-focus:ring-emerald-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after: after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
							></div>
						</label>
					</div>

					<div class="flex items-center justify-between  bg-slate-50 p-4">
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center  bg-purple-100 text-xl"
							>
								🔔
							</div>
							<div>
								<p class="font-semibold text-slate-900">Push Notifications</p>
								<p class="text-sm text-slate-500">Receive updates in the app</p>
							</div>
						</div>
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" bind:checked={notifications.push} class="peer sr-only" />
							<div
								class="peer h-7 w-14  bg-slate-200 peer-checked:bg-gold peer-focus:ring-4 peer-focus:ring-emerald-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after: after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
							></div>
						</label>
					</div>

					<div class="border-t border-slate-200 pt-4">
						<button
							onclick={handleSaveNotifications}
							class=" bg-gold px-6 py-3 font-semibold text-white transition-all hover:bg-gold"
						>
							Save Preferences
						</button>
					</div>
				</div>
			</section>

			<!-- Preferences Section with Working Theme -->
			<section
				id="preferences"
				class="overflow-hidden  border border-slate-200 bg-white shadow-sm"
			>
				<div class="border-b border-slate-200 p-6">
					<h3 class="text-lg font-bold text-slate-900">App Preferences</h3>
					<p class="mt-1 text-sm text-slate-500">Customize your experience</p>
				</div>
				<div class="space-y-6 p-6">
					<div>
						<label class="mb-2 block text-sm font-semibold text-slate-700">Language</label>
						<select
							bind:value={preferences.language}
							class="block w-full  border border-slate-200 bg-white px-4 py-3 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 sm:text-sm"
						>
							<option value="en">English</option>
							<option value="es">Spanish</option>
							<option value="fr">French</option>
							<option value="de">German</option>
						</select>
					</div>

					<div>
						<label class="mb-2 block text-sm font-semibold text-slate-700">Currency</label>
						<select
							bind:value={preferences.currency}
							class="block w-full  border border-slate-200 bg-white px-4 py-3 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 sm:text-sm"
						>
							<option value="USD">USD - US Dollar</option>
							<option value="EUR">EUR - Euro</option>
							<option value="GBP">GBP - British Pound</option>
							<option value="CAD">CAD - Canadian Dollar</option>
						</select>
					</div>

					<div>
						<label class="mb-2 block text-sm font-semibold text-slate-700">Timezone</label>
						<select
							bind:value={preferences.timezone}
							class="block w-full  border border-slate-200 bg-white px-4 py-3 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20 sm:text-sm"
						>
							<option value="America/New_York">Eastern Time (ET)</option>
							<option value="America/Chicago">Central Time (CT)</option>
							<option value="America/Denver">Mountain Time (MT)</option>
							<option value="America/Los_Angeles">Pacific Time (PT)</option>
						</select>
					</div>

					<div class="border-t border-slate-200 pt-4">
						<button
							onclick={handleSavePreferences}
							class=" bg-gold px-6 py-3 font-semibold text-white transition-all hover:bg-gold"
						>
							Save Preferences
						</button>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>
