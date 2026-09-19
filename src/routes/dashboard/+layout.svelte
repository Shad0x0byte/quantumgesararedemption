<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { apiRequest } from '$lib/api/client';
  import DashboardFooter from '$lib/components/DashboardFooter.svelte';
  import Translate from '$lib/components/Translate.svelte';
  import type { AuthState } from '$lib/types';

  interface NavItem {
    href: string;
    icon: string;
    label: string;
  }

  let authState: AuthState = { user: null, isAuthenticated: false, loading: true, token: null };
  let sidebarOpen = false;
  let profilePictureUrl: string | null = null;

  const authUnsubscribe = auth.subscribe((s: AuthState) => {
    authState = s;
    profilePictureUrl = (s.user as any)?.profile_picture_url ?? null;
  });

  onMount(() => {
    auth.loadFromStorage();
    apiRequest<any>('/user/profile.php').then((res) => {
      if (res.success && res.data?.user) {
        const u = res.data.user;
        profilePictureUrl = u.profile_picture_url ?? null;
        auth.updateUser({ profile_picture_url: profilePictureUrl } as any);
      }
    });
  });

  const redirectUnsubscribe = auth.subscribe((s: AuthState) => {
    if (!s.loading && !s.isAuthenticated) goto('/login');
  });

  onDestroy(() => {
    authUnsubscribe();
    redirectUnsubscribe();
  });

  $: userName = authState.user ? `${authState.user.first_name ?? ''} ${authState.user.last_name ?? ''}`.trim() : '';
  $: userEmail = authState.user?.email ?? '';
  $: initials = userName ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'QG';

  function navActive(href: string) {
    const path = ($page.url.pathname || '/dashboard').replace(/\/$/, '') || '/dashboard';
    const target = href.replace(/\/$/, '') || '/dashboard';
    if (target === '/dashboard') return path === '/dashboard';
    return path === target || path.startsWith(target + '/');
  }

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'OVERVIEW', icon: '▦' },
    { href: '/dashboard/deposit', label: 'DEPOSIT', icon: '$' },
    { href: '/dashboard/external', label: 'LINK WALLET', icon: '🔗' },
    { href: '/dashboard/wallets', label: 'WALLETS', icon: '⬢' },
    { href: '/dashboard/security', label: 'SECURITY', icon: '#' },
    { href: '/dashboard/settings', label: 'SETTINGS', icon: '⚙' }
  ];

  const mobileNavItems: NavItem[] = [
    { href: '/dashboard', label: 'OVERVIEW', icon: '▦' },
    { href: '/dashboard/deposit', label: 'DEPOSIT', icon: '$' },
    { href: '/dashboard/wallets', label: 'WALLETS', icon: '⬢' },
    { href: '/dashboard/external', label: 'LINK', icon: '🔗' }
  ];

  async function handleSignOut() {
    auth.clearAuth();
    goto('/login');
  }
</script>

{#if authState.loading}
  <div class="flex min-h-screen items-center justify-center bg-ink">
    <div class="border-2 border-gold bg-ink p-6 font-display text-2xl font-bold text-gold">QGR<span class="pulse-dot">_</span></div>
  </div>
{:else if authState.isAuthenticated}
  <div class="paper-grain flex min-h-screen bg-paper">
    {#if sidebarOpen}
      <div class="fixed inset-0 z-40 bg-ink/60 lg:hidden" onclick={() => (sidebarOpen = false)} role="presentation"></div>
    {/if}

    <!-- SIDEBAR -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-ink bg-ink text-white transition-transform duration-200 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0"
    >
      <div class="flex h-16 items-center gap-3 border-b-2 border-gold/40 px-5">
        <img src="/qgr-mark.svg" alt="QGR" class="h-9 w-9 border-2 border-gold bg-gold" />
        <div>
          <p class="font-display text-base font-bold tracking-tight">QGR/INVEST</p>
          <p class="micro-label !text-[9px] text-gold">SECURE LEDGER</p>
        </div>
        <button class="ml-auto border border-white/20 p-1.5 text-white/60 hover:text-white lg:hidden" onclick={() => (sidebarOpen = false)} aria-label="Close">✕</button>
      </div>

      <nav class="flex-1 overflow-y-auto p-3">
        <ul class="space-y-1.5">
          {#each navItems as item}
            <li>
              <a
                href={item.href}
                onclick={() => (sidebarOpen = false)}
                aria-current={navActive(item.href) ? 'page' : undefined}
                class="flex items-center gap-3 border-2 px-3 py-2.5 font-display text-sm font-bold tracking-widest transition-all {navActive(item.href)
                  ? 'border-gold bg-gold text-ink'
                  : 'border-transparent text-white/60 hover:border-white/30 hover:text-white'}"
              >
                <span class="w-5 text-center">{item.icon}</span>
                {item.label}
                {#if navActive(item.href)}<span class="ml-auto font-mono text-[10px]">◀</span>{/if}
              </a>
            </li>
          {/each}
        </ul>
        <div class="mt-6 border-t-2 border-white/10 pt-4">
          <a href="mailto:support@quantumgesararedemption.com" class="flex items-center gap-3 px-3 py-2 font-mono text-xs text-white/50 hover:bg-acid hover:text-ink">
            <span>✉</span><span class="break-all">support@…</span>
          </a>
        </div>
      </nav>

      <div class="border-t-2 border-gold/40 p-3">
        <div class="flex items-center gap-3 border-2 border-white/15 bg-white/5 p-3">
          {#if profilePictureUrl}
            <img src={profilePictureUrl} alt={userName} class="h-10 w-10 border-2 border-gold object-cover" onerror={() => (profilePictureUrl = null)} />
          {:else}
            <div class="flex h-10 w-10 items-center justify-center border-2 border-gold bg-gold font-display text-sm font-bold text-ink">{initials}</div>
          {/if}
          <div class="min-w-0 flex-1">
            <p class="truncate font-display text-sm font-bold">{userName}</p>
            <p class="truncate font-mono text-[11px] text-white/50">{userEmail}</p>
          </div>
          <button onclick={handleSignOut} class="border border-white/20 p-1.5 text-white/60 hover:border-blood hover:bg-blood hover:text-white" title="Log out">⏻</button>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="flex min-w-0 flex-1 flex-col lg:ml-72">
      <header class="sticky top-0 z-30 flex min-h-16 flex-wrap items-center gap-2 border-b-2 border-ink bg-paper px-3 py-2 sm:gap-4 sm:px-6">
        <button class="border-2 border-ink bg-white p-1.5 lg:hidden" onclick={() => (sidebarOpen = !sidebarOpen)} aria-label="Menu">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div class="flex-1">
          <p class="font-display text-sm font-bold tracking-widest">
            {#if navActive('/dashboard') && $page.url.pathname.replace(/\/$/, '') === '/dashboard'}Hello, {(authState.user?.first_name ?? 'INVESTOR').toUpperCase()}
            {:else if $page.url.pathname.includes('deposit')}DEPOSIT // FUND
            {:else if $page.url.pathname.includes('external')}LINK // WALLETS
            {:else if $page.url.pathname.includes('wallets')}MY WALLETS
            {:else}TERMINAL{/if}
          </p>
        </div>
        <span class="sticker hidden !text-[9px] sm:inline-block">LIVE PRICES</span>
        <Translate />
        <a href="/dashboard/deposit" class="btn-primary !px-3 !py-1.5 !text-xs sm:!px-4 sm:!py-2">DEPOSIT $</a>
      </header>

      <main class="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <slot />
      </main>

      <div class="hidden lg:block">
        <DashboardFooter />
      </div>
    </div>

    <!-- MOBILE NAV -->
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-ink lg:hidden">
      <div class="safe-bottom flex items-stretch">
        {#each mobileNavItems as item}
          <a href={item.href} class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 {navActive(item.href) ? 'bg-gold text-ink' : 'text-white/50'}">
            <span class="text-base leading-none">{item.icon}</span>
            <span class="font-display text-[9px] font-bold tracking-widest">{item.label}</span>
          </a>
        {/each}
        <button class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-white/50" onclick={() => (sidebarOpen = true)}>
          <span class="text-base leading-none">···</span>
          <span class="font-display text-[9px] font-bold tracking-widest">MORE</span>
        </button>
      </div>
    </nav>
  </div>
{/if}
