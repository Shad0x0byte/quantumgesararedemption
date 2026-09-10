<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import type { AuthState } from '$lib/types';
  let authState: AuthState = { isAuthenticated: false, user: null, token: null, loading: false };
  auth.subscribe((s) => {
    authState = s;
  });
</script>

<svelte:head><title>Vault Minted — QGR Exchange</title></svelte:head>

<div class="paper-grain flex min-h-screen items-center justify-center bg-paper px-4 py-12 text-ink">
  <div class="w-full max-w-md text-center">
    <div class="brut-card bg-white p-8">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-2 border-ink bg-acid">
        <svg class="h-10 w-10" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
      </div>
      <span class="sticker">MINT CONFIRMED</span>
      <h1 class="font-display mt-3 text-3xl font-bold tracking-tight">WAGMI{#if authState.user}, {authState.user.first_name.toUpperCase()}{/if}.</h1>
      <p class="mt-2 font-mono text-xs text-ink/60">YOUR VAULT IS LIVE. STACK AWAITS.</p>
      {#if authState.user}
        <div class="mt-6 space-y-2 border-2 border-ink bg-paper p-4 text-left font-mono text-sm">
          <div class="flex justify-between"><span class="text-ink/50">EMAIL</span><span class="font-bold">{authState.user.email}</span></div>
          <div class="flex justify-between"><span class="text-ink/50">STACK</span><span class="font-bold">VAULT TIER</span></div>
          <div class="flex justify-between"><span class="text-ink/50">STATUS</span><span class="font-bold text-up">ACTIVE ■</span></div>
        </div>
      {/if}
      <button onclick={() => goto('/dashboard')} class="btn-acid mt-6 w-full !py-4">ENTER THE VAULT →</button>
    </div>
  </div>
</div>
