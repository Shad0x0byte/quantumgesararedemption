<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let mobileMenuOpen = false;

  function handleLogout() {
    auth.clearAuth();
    goto('/login');
  }
</script>

<nav class="sticky top-0 z-50 border-b-2 border-ink bg-paper text-ink">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 justify-between">
      <div class="flex items-center">
        <a href="/" class="flex items-center gap-2">
          <img src="/qgr-mark.svg" alt="QGR" class="h-10 w-10 border-2 border-ink bg-gold" />
          <div>
            <span class="font-display block text-xl font-bold tracking-tight">QGR/EXCHANGE</span>
            <span class="-mt-1 block font-mono text-[10px] text-gold-deep">STACK · SWAP · HODL</span>
          </div>
        </a>
      </div>

      <div class="hidden items-center gap-6 md:flex">
        {#if $auth.isAuthenticated}
          <a href="/dashboard" class="font-display text-xs font-bold tracking-widest hover:bg-acid hover:px-1">STACK</a>
          <a href="/dashboard/wallets" class="font-display text-xs font-bold tracking-widest hover:bg-acid hover:px-1">VAULT</a>
          <a href="/dashboard/swap" class="font-display text-xs font-bold tracking-widest hover:bg-acid hover:px-1">SWAP</a>
          <a href="/dashboard/settings" class="font-display text-xs font-bold tracking-widest hover:bg-acid hover:px-1">CONFIG</a>
          <div class="flex items-center gap-3 border-l-2 border-ink pl-4">
            <div class="text-right">
              <p class="font-display text-sm font-bold">{ $auth.user?.first_name } { $auth.user?.last_name }</p>
              <p class="font-mono text-xs text-ink/50">{ $auth.user?.email }</p>
            </div>
            <button onclick={handleLogout} class="border-2 border-ink bg-white px-3 py-1.5 font-display text-xs font-bold hover:bg-blood hover:text-white">RAGE QUIT</button>
          </div>
        {:else}
          <a href="/login" class="font-display text-xs font-bold tracking-widest hover:bg-acid hover:px-1">LOG IN</a>
          <a href="/signup" class="btn-primary !px-4 !py-2 !text-xs">APE IN →</a>
        {/if}
      </div>

      <div class="flex items-center md:hidden">
        <button onclick={() => (mobileMenuOpen = !mobileMenuOpen)} class="border-2 border-ink bg-white p-1.5" aria-label="Menu">
          {#if mobileMenuOpen}✕{:else}☰{/if}
        </button>
      </div>
    </div>
  </div>

  {#if mobileMenuOpen}
    <div class="border-t-2 border-ink bg-paper md:hidden">
      <div class="space-y-1 px-4 py-4">
        {#if $auth.isAuthenticated}
          <a href="/dashboard" class="block py-2 font-display text-sm font-bold tracking-widest">STACK</a>
          <a href="/dashboard/wallets" class="block py-2 font-display text-sm font-bold tracking-widest">VAULT</a>
          <a href="/dashboard/swap" class="block py-2 font-display text-sm font-bold tracking-widest">SWAP</a>
          <a href="/dashboard/settings" class="block py-2 font-display text-sm font-bold tracking-widest">CONFIG</a>
          <button onclick={handleLogout} class="block w-full py-2 text-left font-display text-sm font-bold text-blood">RAGE QUIT</button>
        {:else}
          <a href="/login" class="block py-2 font-display text-sm font-bold tracking-widest">LOG IN</a>
          <a href="/signup" class="btn-primary mt-2 block text-center">APE IN →</a>
        {/if}
      </div>
    </div>
  {/if}
</nav>
