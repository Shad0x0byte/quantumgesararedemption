<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Ticker from '$lib/components/Ticker.svelte';

  let scrolled = false;
  let mobileOpen = false;
  let openFaq = -1;

  onMount(() => {
    auth.loadFromStorage();
    const unsub = auth.subscribe((s) => {
      if (!s.loading && s.isAuthenticated) goto('/dashboard');
    });
    const fn = () => {
      scrolled = window.scrollY > 30;
    };
    window.addEventListener('scroll', fn);
    return () => {
      window.removeEventListener('scroll', fn);
      unsub();
    };
  });

  const chains = [
    { sym: 'BTC', name: 'Bitcoin', desc: 'Digital gold. The hardest money ever deployed.', tag: 'UTXO' },
    { sym: 'ETH', name: 'Ethereum', desc: 'Programmable money. Home of DeFi, stablecoins, degeneracy.', tag: 'EVM' },
    { sym: 'SOL', name: 'Solana', desc: 'Lightspeed settlement for high-frequency apes.', tag: 'SVM' },
    { sym: 'POL', name: 'Polygon', desc: 'Cheap, fast EVM rails. Gas fees that respect your stack.', tag: 'EVM' },
    { sym: 'BASE', name: 'Base', desc: 'Coinbase-backed L2. Onchain summer never ends.', tag: 'L2' },
    { sym: 'USDC', name: 'Stablecoins', desc: 'USDC + USDT. Park profits, dodge volatility, stay liquid.', tag: '$' }
  ];

  const features = [
    { title: 'MULTI-CHAIN VAULT', desc: 'One dashboard, every chain. Native balances, live CoinGecko valuations, zero spreadsheet cope.', sticker: 'VAULT' },
    { title: 'INSTANT SWAP ENGINE', desc: 'Backend-quoted swaps across pairs with 0.35% fees, expiry-safe quotes and full ledger settlement.', sticker: '0.35%' },
    { title: 'ONCHAIN ACTIVITY FEED', desc: 'Every deposit, send, swap, buy and sell lands in your history with hashes, fees and status.', sticker: 'TXNS' },
    { title: 'SETTLEMENT LEDGER', desc: 'Every balance movement is accounted for — double-entry discipline, atomic settlement, full audit trail. Your money, fully explainable.', sticker: 'LEDGER' },
    { title: 'SELF-CUSTODY VIBES', desc: 'Per-wallet addresses with QR + copy, available-vs-locked balances, exportable flows.', sticker: 'KEYS' },
    { title: 'OPS CONTROL ROOM', desc: 'Admin console for balances, approvals, assets, fees and audit trails. Suspension enforced server-side.', sticker: 'OPS' }
  ];

  const faqs = [
    { q: 'Is QGR Exchange a real exchange?', a: 'Yes. QGR Exchange is a full crypto wallet and swap platform: multi-chain balances, instant internal transfers, backend-quoted swaps, buy/sell against USD, and a complete transaction ledger with hashes, fees and status tracking.' },
    { q: 'Where do prices come from?', a: 'Live from CoinGecko, refreshed server-side every 5 minutes with automatic fallback. If the feed is unreachable, the app keeps serving the last synced prices and marks them CACHED with an age stamp.' },
    { q: 'What does it cost to trade?', a: 'A flat 0.35% fee on swaps, sends, buys and sells — quoted upfront, no spread games, no hidden charges. Internal transfers between QGR users settle instantly.' },
    { q: 'What can I do on the platform?', a: 'Hold BTC, ETH, SOL, POL and stablecoins across 5 networks, deposit to per-wallet addresses with QR codes, send to any address, beam funds to other users by email, swap across pairs, and buy or sell against USD.' },
    { q: 'Is my account safe?', a: 'Passwords are bcrypt-hashed, sessions are JWT-secured with 24-hour expiry, every financial mutation settles atomically with idempotency protection, and privileged operations are written to an audit trail. Suspended accounts are blocked server-side from all trading.' },
    { q: 'How do I contact support?', a: 'support@quantumgesararedemption.com — real inbox, real humans, fast response times.' }
  ];
</script>

<svelte:head>
  <title>QGR Exchange — Stack. Swap. HODL.</title>
  <meta name="description" content="QGR Exchange: multi-chain crypto wallet and swap engine. Live prices, instant settlement, bank-grade security." />
</svelte:head>

<div class="paper-grain min-h-screen bg-paper text-ink">
  <!-- NAV -->
  <nav class="fixed inset-x-0 top-0 z-50 border-b-2 border-ink bg-paper transition-all {scrolled ? 'shadow-[0_4px_0_#0b132b]' : ''}">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="/" class="flex items-center gap-2.5">
        <img src="/qgr-mark.svg" alt="QGR" class="h-9 w-9 border-2 border-ink bg-gold" />
        <span class="font-display text-xl font-bold tracking-tight">QGR<span class="text-gold-deep">/</span>EXCHANGE</span>
      </a>
      <div class="hidden items-center gap-7 md:flex">
        {#each [['#chains', 'CHAINS'], ['#stack', 'WHY QGR'], ['#how', 'HOW IT WORKS'], ['#faq', 'FAQ']] as [href, label]}
          <a {href} class="font-display text-xs font-bold tracking-[0.18em] hover:bg-acid hover:px-1">{label}</a>
        {/each}
        <a href="/login" class="font-display text-xs font-bold tracking-[0.18em] hover:bg-acid hover:px-1">LOG IN</a>
        <a href="/signup" class="btn-primary !px-5 !py-2">APEin →</a>
      </div>
      <button class="border-2 border-ink bg-white p-1.5 md:hidden" onclick={() => (mobileOpen = !mobileOpen)} aria-label="Menu">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          {#if mobileOpen}<path d="M6 18L18 6M6 6l12 12" />{:else}<path d="M4 6h16M4 12h16M4 18h16" />{/if}
        </svg>
      </button>
    </div>
    {#if mobileOpen}
      <div class="space-y-1 border-t-2 border-ink bg-paper px-4 pt-2 pb-5 md:hidden">
        {#each [['#chains', 'CHAINS'], ['#stack', 'WHY QGR'], ['#how', 'HOW IT WORKS'], ['#faq', 'FAQ']] as [href, label]}
          <a {href} class="block py-2.5 font-display text-sm font-bold tracking-widest" onclick={() => (mobileOpen = false)}>{label}</a>
        {/each}
        <a href="/login" class="block py-2.5 font-display text-sm font-bold tracking-widest">LOG IN</a>
        <a href="/signup" class="btn-primary mt-2 w-full">APE IN →</a>
      </div>
    {/if}
  </nav>

  <!-- HERO -->
  <header class="border-b-2 border-ink bg-ink pt-16 text-white">
    <div class="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8 lg:pt-20">
      <div class="flex flex-wrap items-center gap-3">
        <span class="sticker">LIVE EXCHANGE</span>
        <span class="sticker-gold">5 chains live</span>
        <span class="tag-mono !border-gold !bg-transparent !text-gold">REAL-TIME PRICES · INSTANT SETTLEMENT</span>
      </div>
      <h1 class="font-display mt-6 text-6xl leading-[0.95] font-bold tracking-tight sm:text-7xl lg:text-8xl">
        STACK.<br /><span class="bg-gold px-2 text-ink">SWAP.</span><br />HODL.
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
        QGR Exchange is a multi-chain crypto wallet and swap engine. Live market valuations,
        instant settlement, per-wallet addresses — <span class="text-acid font-bold">built for serious holders.</span>
      </p>
      <div class="mt-8 flex flex-col gap-4 sm:flex-row">
        <a href="/signup" class="btn-acid !px-10 !py-4 !text-base">MINT YOUR STACK →</a>
        <a href="/login" class="inline-flex items-center justify-center gap-2 border-2 border-gold px-10 py-4 font-display text-base font-bold tracking-wider text-gold hover:bg-gold hover:text-ink">ENTER THE VAULT</a>
      </div>
      <div class="mt-10 grid grid-cols-3 gap-4 border-t-2 border-gold/30 pt-8">
        <div><p class="font-display text-3xl font-bold text-gold sm:text-4xl">5</p><p class="micro-label mt-1 text-white/50">Chains wired</p></div>
        <div><p class="font-display text-3xl font-bold text-gold sm:text-4xl">0.35%</p><p class="micro-label mt-1 text-white/50">Flat swap fee</p></div>
        <div><p class="font-display text-3xl font-bold text-gold sm:text-4xl">100%</p><p class="micro-label mt-1 text-white/50">Ledger-settled</p></div>
      </div>
    </div>
    <Ticker />
  </header>

  <!-- CHAINS -->
  <section id="chains" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <p class="micro-label text-gold-deep">/// SUPPORTED PROTOCOLS</p>
    <h2 class="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">PICK YOUR CHAIN.<br />WE SETTLE IT.</h2>
    <div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each chains as c}
        <div class="brut-card p-6 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
          <div class="flex items-start justify-between">
            <p class="font-display text-2xl font-bold">${c.sym}</p>
            <span class="tag-mono">{c.tag}</span>
          </div>
          <p class="font-display mt-1 text-sm font-bold tracking-widest text-gold-deep">{c.name.toUpperCase()}</p>
          <p class="mt-3 text-sm leading-relaxed text-ink/70">{c.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- WHY -->
  <section id="stack" class="border-y-2 border-ink bg-paper-dim">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p class="micro-label text-gold-deep">/// WHY QGR</p>
      <h2 class="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">BUILT LIKE AN EXCHANGE.<br />HONEST LIKE A LEDGER.</h2>
      <div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {#each features as f}
          <div class="brut-card p-6">
            <span class="sticker">{f.sticker}</span>
            <h3 class="font-display mt-4 text-lg font-bold tracking-tight">{f.title}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink/70">{f.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- HOW -->
  <section id="how" class="border-b-2 border-ink bg-ink text-white">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p class="micro-label text-gold">/// HOW IT WORKS</p>
      <h2 class="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">FROM ZERO TO APE IN 3 STEPS</h2>
      <div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {#each [['01', 'MINT IDENTITY', 'Sign up with email. Bcrypt-hashed passwords, JWT sessions, verified accounts in minutes.'], ['02', 'FUND THE VAULT', 'Deposit to your wallet addresses, receive top-ups, or get a transfer from another user.'], ['03', 'SWAP + HODL', 'Quote, confirm, settle. Every move lands in your transaction feed with hashes and fees.']] as [n, t, d]}
          <div class="border-2 border-gold bg-ink-soft p-6">
            <p class="font-display text-5xl font-bold text-gold">{n}</p>
            <h3 class="font-display mt-3 text-xl font-bold">{t}</h3>
            <p class="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
          </div>
        {/each}
      </div>
      <div class="mt-10">
        <a href="/signup" class="btn-acid !px-10 !py-4 !text-base">START STACKING →</a>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <p class="micro-label text-gold-deep">/// FAQ — NO DUMB QUESTIONS</p>
    <h2 class="font-display mt-2 text-4xl font-bold tracking-tight">FUD, ANSWERED</h2>
    <div class="mt-8 space-y-3">
      {#each faqs as faq, i}
        <div class="brut-flat">
          <button class="flex w-full items-center justify-between p-5 text-left hover:bg-paper" onclick={() => (openFaq = openFaq === i ? -1 : i)}>
            <span class="font-display font-bold">{faq.q}</span>
            <span class="ml-4 border-2 border-ink bg-gold px-2 font-display font-bold">{openFaq === i ? '−' : '+'}</span>
          </button>
          {#if openFaq === i}
            <div class="border-t-2 border-ink px-5 py-4 text-sm leading-relaxed text-ink/70">{faq.a}</div>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- CTA -->
  <section class="border-t-2 border-ink bg-gold">
    <div class="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
      <h2 class="font-display text-4xl font-bold tracking-tight sm:text-5xl">READY TO APE IN?</h2>
      <p class="mx-auto mt-3 max-w-xl font-medium text-ink/70">Free account. Live prices. Full wallet set. Start building your stack today.</p>
      <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a href="/signup" class="inline-flex items-center gap-2 border-2 border-ink bg-ink px-10 py-4 font-display text-base font-bold tracking-wider text-white hover:bg-ink-soft" style="box-shadow: 4px 4px 0 #f4f1ea;">MINT ACCOUNT</a>
        <a href="/login" class="inline-flex items-center gap-2 border-2 border-ink bg-paper px-10 py-4 font-display text-base font-bold tracking-wider hover:bg-white" style="box-shadow: 4px 4px 0 #0b132b;">LOG IN</a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t-2 border-ink bg-ink text-white/60">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <div class="mb-4 flex items-center gap-2">
            <img src="/qgr-mark.svg" alt="QGR" class="h-8 w-8 border-2 border-gold bg-gold" />
            <span class="font-display text-lg font-bold text-white">QGR/EXCHANGE</span>
          </div>
          <p class="text-sm leading-relaxed">Multi-chain wallet and swap engine by Quantum Gesara Redemption.</p>
          <p class="mt-3"><span class="sticker-gold !text-[9px]">SECURE · AUDITED LEDGER</span></p>
        </div>
        <div>
          <h4 class="micro-label text-gold">PROTOCOL</h4>
          <ul class="mt-3 space-y-2 font-mono text-sm">
            <li>BTC // BITCOIN</li>
            <li>ETH // ETHEREUM</li>
            <li>SOL // SOLANA</li>
            <li>POL // POLYGON</li>
            <li>BASE // L2</li>
          </ul>
        </div>
        <div>
          <h4 class="micro-label text-gold">TERMINAL</h4>
          <ul class="mt-3 space-y-2 text-sm font-bold">
            <li><a href="/signup" class="hover:bg-acid hover:text-ink hover:px-1">MINT ACCOUNT</a></li>
            <li><a href="/login" class="hover:bg-acid hover:text-ink hover:px-1">ENTER VAULT</a></li>
            <li><a href="#faq" class="hover:bg-acid hover:text-ink hover:px-1">FUD / FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 class="micro-label text-gold">COMMS</h4>
          <p class="mt-3 font-mono text-sm break-all">support@quantumgesararedemption.com</p>
          <p class="mt-2 text-xs">WAGMI. Probably.</p>
        </div>
      </div>
      <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 font-mono text-xs md:flex-row">
        <p>© 2026 QGR EXCHANGE. ALL RIGHTS RESERVED.</p>
        <p>PRICES: LIVE MARKET DATA · SUPPORT: support@quantumgesararedemption.com</p>
      </div>
    </div>
  </footer>
</div>
