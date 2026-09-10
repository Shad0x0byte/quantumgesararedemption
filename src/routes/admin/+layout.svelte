<script lang="ts">
  import '../../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { AuthState } from '$lib/types';

  let sidebarOpen = false;
  let authState: AuthState = { isAuthenticated: false, user: null, token: null, loading: true };
  let isAdmin = false;

  onMount(() => {
    auth.loadFromStorage();
    const unsubscribe = auth.subscribe((state) => {
      authState = state;
      if (!state.loading) {
        if (!state.isAuthenticated) goto('/login');
        else if (state.user?.role !== 'admin') goto('/dashboard');
        else isAdmin = true;
      }
    });
    return () => unsubscribe();
  });

  const navItems = [
    { href: '/admin', label: 'OVERVIEW', icon: '▦' },
    { href: '/admin/users', label: 'DEGENS', icon: '●' },
    { href: '/admin/crypto', label: 'OPS DESK', icon: '⬢' },
    { href: '/admin/assets', label: 'ASSETS+FEES', icon: '💱' },
    { href: '/admin/transactions', label: 'LEDGER', icon: '⛓' },
    { href: '/admin/cards', label: 'CARDS', icon: '▬' },
    { href: '/admin/logs', label: 'LOGS', icon: '≡' },
    { href: '/admin/settings', label: 'CONFIG', icon: '⚙' }
  ];

  function handleLogout() {
    auth.clearAuth();
    goto('/login');
  }

  function getInitials(): string {
    if (!authState.user?.first_name || !authState.user?.last_name) return 'OP';
    return (authState.user.first_name[0] + authState.user.last_name[0]).toUpperCase();
  }
</script>

<div class="paper-grain min-h-screen bg-paper">
  {#if authState.loading || !isAdmin}
    <div class="flex min-h-screen items-center justify-center bg-ink">
      <div class="border-2 border-gold bg-ink p-6 font-display text-2xl font-bold text-gold">OPS<span class="pulse-dot">_</span></div>
    </div>
  {:else}
    <div class="flex min-h-screen">
      <aside class="fixed top-0 left-0 z-50 h-screen w-80 transform border-r-2 border-ink bg-ink text-white transition-transform duration-200 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0">
        <div class="flex h-full flex-col">
          <div class="border-b-2 border-gold/40 p-6">
            <a href="/admin" class="flex items-center gap-3">
              <img src="/qgr-mark.svg" alt="QGR" class="h-12 w-12 border-2 border-gold bg-gold" />
              <div>
                <span class="block font-display text-xl font-bold tracking-tight">QGR/EXCHANGE</span>
                <span class="sticker-blood !text-[9px]">CONTROL ROOM</span>
              </div>
            </a>
          </div>
          <div class="border-b-2 border-white/10 p-6">
            <div class="flex items-center gap-3 border-2 border-gold/40 bg-white/5 p-4">
              <div class="flex h-14 w-14 items-center justify-center border-2 border-gold bg-gold font-display font-bold text-ink">{getInitials()}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-display text-sm font-bold">{authState.user?.first_name} {authState.user?.last_name || ''}</p>
                <p class="mt-0.5 font-mono text-xs text-gold">OPERATOR // FULL SEND</p>
              </div>
            </div>
          </div>
          <nav class="flex-1 space-y-1.5 overflow-y-auto p-4">
            {#each navItems as item}
              <a
                href={item.href}
                class="flex items-center gap-3 border-2 px-4 py-3 font-display text-sm font-bold tracking-widest transition-all {$page.url.pathname === item.href
                  ? 'border-gold bg-gold text-ink'
                  : 'border-transparent text-white/60 hover:border-white/30 hover:text-white'}"
              >
                <span class="w-5 text-center">{item.icon}</span>
                {item.label}
                {#if $page.url.pathname === item.href}<span class="ml-auto font-mono text-[10px]">◀</span>{/if}
              </a>
            {/each}
          </nav>
          <div class="border-t-2 border-white/10 p-4">
            <button
              onclick={handleLogout}
              class="flex w-full items-center gap-3 border-2 border-blood px-4 py-3 font-display text-sm font-bold tracking-widest text-blood transition-all hover:bg-blood hover:text-white"
            >
              <span>⏻</span> RAGE QUIT
            </button>
          </div>
        </div>
      </aside>

      <header class="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b-2 border-ink bg-ink p-4 text-white lg:hidden">
        <div class="flex items-center gap-2">
          <img src="/qgr-mark.svg" alt="QGR" class="h-8 w-8 border border-gold bg-gold" />
          <span class="font-display text-base font-bold">CONTROL ROOM</span>
        </div>
        <button onclick={() => (sidebarOpen = !sidebarOpen)} class="border-2 border-gold p-1.5 text-gold" aria-label="Menu">
          {#if sidebarOpen}✕{:else}☰{/if}
        </button>
      </header>

      {#if sidebarOpen}
        <div class="fixed inset-0 z-40 bg-ink/60 lg:hidden" onclick={() => (sidebarOpen = false)}></div>
      {/if}

      <main class="min-h-screen flex-1 pt-16 lg:ml-80 lg:pt-0">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <slot />
        </div>
      </main>
    </div>
  {/if}
</div>
