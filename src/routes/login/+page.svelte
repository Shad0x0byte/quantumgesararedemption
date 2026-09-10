<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { login as apiLogin } from '$lib/api/client';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Ticker from '$lib/components/Ticker.svelte';

	let email = '';
	let password = '';
	let rememberMe = false;
	let isLoading = false;
	let showPassword = false;
	let errors: { email?: string; password?: string; general?: string } = {};

	function validateForm(): boolean {
		errors = {};
		let valid = true;
		if (!email) {
			errors.email = 'Email is required';
			valid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Enter a valid email address';
			valid = false;
		}
		if (!password) {
			errors.password = 'Password is required';
			valid = false;
		}
		return valid;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validateForm()) return;
		isLoading = true;
		errors.general = undefined;
		try {
			const res = await apiLogin(email, password);
			if (res.success && res.data) {
				const { user, token } = res.data as any;
				auth.setAuth(user, token);
				if (typeof window !== 'undefined') {
					if (rememberMe) localStorage.setItem('remember_me', '1');
					else localStorage.removeItem('remember_me');
				}
				toast.success('Vault unlocked. WAGMI.');
				goto(user.role === 'admin' ? '/admin' : '/dashboard');
			} else {
				errors.general = res.error || 'Invalid email or password';
				toast.error(res.error || 'Login failed');
			}
		} catch {
			errors.general = 'Network error. Please try again.';
			toast.error('Connection failed. Check your internet.');
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Enter the Vault — QGR Exchange</title>
</svelte:head>

<div class="paper-grain flex min-h-screen bg-paper text-ink">
	<!-- LEFT: navy panel -->
	<div class="hidden w-1/2 shrink-0 flex-col justify-between border-r-2 border-ink bg-ink p-10 text-white lg:flex">
		<a href="/" class="flex items-center gap-2.5">
			<img src="/qgr-mark.svg" alt="QGR" class="h-10 w-10 border-2 border-gold bg-gold" />
			<span class="font-display text-xl font-bold">QGR/EXCHANGE</span>
		</a>
		<div>
			<span class="sticker">SESSION 02</span>
			<h1 class="font-display mt-5 text-6xl leading-[0.95] font-bold tracking-tight">
				ENTER<br />THE<br /><span class="bg-gold px-2 text-ink">VAULT.</span>
			</h1>
			<p class="mt-5 max-w-sm leading-relaxed text-white/60">
			Your stack is right where you left it. Live prices, settled ledger, zero funny business.
			</p>
		</div>
		<div class="space-y-3 font-mono text-xs text-white/50">
			<p><span class="text-acid">■</span> BCRYPT-HASHED CREDS</p>
			<p><span class="text-acid">■</span> JWT SESSIONS · 24H</p>
			<p><span class="text-acid">■</span> SUSPENDED? TALK TO OPS</p>
		</div>
	</div>

	<!-- RIGHT: form -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
		<div class="flex-1 items-center justify-center p-6 sm:p-10 lg:flex">
			<div class="w-full max-w-md">
				<div class="mb-6 lg:hidden">
					<a href="/" class="flex items-center gap-2">
						<img src="/qgr-mark.svg" alt="QGR" class="h-9 w-9 border-2 border-ink bg-gold" />
						<span class="font-display text-lg font-bold">QGR/EXCHANGE</span>
					</a>
				</div>
				<span class="sticker-gold">LOG IN</span>
				<h2 class="font-display mt-3 text-3xl font-bold tracking-tight">BACK TO THE TERMINAL</h2>
				<p class="mt-1 text-sm text-ink/60">Direct account access — email + password.</p>

				{#if errors.general}
					<div class="brut-flat mt-6 border-blood bg-white p-4">
						<p class="font-display text-sm font-bold text-blood">ACCESS DENIED</p>
						<p class="mt-1 text-sm">{errors.general}</p>
					</div>
				{/if}

				<form onsubmit={handleSubmit} class="brut-card mt-6 space-y-5 bg-white p-6 sm:p-8">
					<div>
						<label class="micro-label" for="email">EMAIL ADDRESS</label>
						<input id="email" type="email" bind:value={email} autocomplete="email" placeholder="degen@qgr.exchange" class="input-base mt-2 font-mono" />
						{#if errors.email}<p class="mt-2 font-mono text-xs font-bold text-blood">!! {errors.email}</p>{/if}
					</div>
					<div>
						<label class="micro-label" for="pw">PASSWORD</label>
						<div class="relative mt-2">
							<input id="pw" type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="current-password" placeholder="••••••••" class="input-base pr-12 font-mono" />
							<button type="button" onclick={() => (showPassword = !showPassword)} class="absolute top-1/2 right-3 -translate-y-1/2 border border-ink bg-paper px-1.5 font-mono text-[11px] font-bold" aria-label={showPassword ? 'Hide password' : 'Show password'}>
								{showPassword ? 'HIDE' : 'SHOW'}
							</button>
						</div>
						{#if errors.password}<p class="mt-2 font-mono text-xs font-bold text-blood">!! {errors.password}</p>{/if}
					</div>
					<div class="flex items-center justify-between">
						<label class="flex cursor-pointer items-center gap-2 text-sm font-bold" for="remember">
							<input type="checkbox" id="remember" bind:checked={rememberMe} class="h-4 w-4 rounded-none border-2 border-ink accent-[#d4a73a]" />
							HODL MY SESSION
						</label>
						<span class="font-mono text-xs text-ink/50">30 DAYS</span>
					</div>
					<button type="submit" disabled={isLoading} class="btn-primary w-full !py-4">
						{#if isLoading}
							<LoadingSpinner size="sm" />
							<span class="ml-2">UNLOCKING…</span>
						{:else}
							UNLOCK VAULT →
						{/if}
					</button>
				</form>

				<p class="mt-6 text-center text-sm">
					No stack yet?
					<a href="/signup" class="font-display font-bold underline decoration-gold decoration-2 underline-offset-4 hover:bg-acid">MINT AN ACCOUNT →</a>
				</p>
				<p class="mt-3 text-center font-mono text-[11px] text-ink/50">JWT-SECURED · LIVE MARKET DATA · INSTANT SETTLEMENT</p>
			</div>
		</div>
		<Ticker />
	</div>
</div>
