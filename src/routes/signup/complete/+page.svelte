<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import type { AuthState } from '$lib/types';
  let authState: AuthState = { isAuthenticated: false, user: null, token: null, loading: false };
  auth.subscribe((s) => {
    authState = s;
  });

  let phrase = '';
  let copied = false;
  let confirmed = false;
  onMount(() => {
    phrase = localStorage.getItem('qgr_recovery_phrase') ?? '';
  });

  async function copyPhrase() {
    if (!phrase) return;
    try {
      await navigator.clipboard.writeText(phrase);
      copied = true;
      toast.success('Recovery phrase copied — store it offline');
    } catch {
      toast.error('Copy failed — write it down manually');
    }
  }

  function enter() {
    if (phrase && !confirmed) {
      toast.error('Confirm you saved your recovery phrase first');
      return;
    }
    localStorage.removeItem('qgr_recovery_phrase');
    goto('/dashboard');
  }
</script>

<svelte:head><title>Account Created — QGR Investment</title></svelte:head>

<div class="paper-grain flex min-h-screen items-center justify-center bg-paper px-4 py-12 text-ink">
  <div class="w-full max-w-md text-center">
    <div class="brut-card bg-white p-8">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-2 border-ink bg-acid">
        <svg class="h-10 w-10" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
      </div>
      <span class="sticker">ACCOUNT CREATED</span>
      <h1 class="font-display mt-3 text-3xl font-bold tracking-tight break-words">WELCOME{#if authState.user}, {authState.user.first_name.toUpperCase()}{/if}.</h1>
      <p class="mt-2 font-mono text-xs break-words text-ink/60">YOUR ACCOUNT IS READY.</p>
      {#if authState.user}
        <div class="mt-6 space-y-2 border-2 border-ink bg-paper p-4 text-left font-mono text-sm">
          <div class="flex justify-between gap-2"><span class="shrink-0 text-ink/50">EMAIL</span><span class="min-w-0 flex-1 text-right font-bold break-words">{authState.user.email}</span></div>
          <div class="flex justify-between gap-2"><span class="shrink-0 text-ink/50">ACCOUNT</span><span class="font-bold">ACTIVE TIER</span></div>
          <div class="flex justify-between gap-2"><span class="shrink-0 text-ink/50">STATUS</span><span class="font-bold text-up">ACTIVE ■</span></div>
        </div>
      {/if}
      {#if phrase}
        <div class="mt-6 border-2 border-blood bg-paper p-4 text-left">
          <p class="font-display text-sm font-bold text-blood">RECOVERY PHRASE — SAVE NOW, SHOWN ONCE</p>
          <p class="mt-2 border-2 border-ink bg-white p-3 font-mono text-sm font-bold break-words">{phrase}</p>
          <div class="mt-3 flex items-center justify-between gap-2">
            <button onclick={copyPhrase} class="btn-secondary !px-4 !py-2 !text-xs">{copied ? 'COPIED ✓' : 'COPY PHRASE'}</button>
            <label class="flex cursor-pointer items-center gap-2 font-mono text-xs font-bold">
              <input type="checkbox" bind:checked={confirmed} class="h-4 w-4 border-2 border-ink" />
              I SAVED IT OFFLINE
            </label>
          </div>
          <p class="mt-2 font-mono text-[11px] text-ink/60">Sign in later with email + password OR this phrase. This is your platform account phrase — never enter exchange/TrustWallet seeds anywhere.</p>
        </div>
      {/if}
      <button onclick={enter} class="btn-acid mt-6 w-full !py-4">GO TO DASHBOARD →</button>
    </div>
  </div>
</div>
