<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Ticker from '$lib/components/Ticker.svelte';
  import Translate from '$lib/components/Translate.svelte';

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
    { title: 'MANAGED PORTFOLIOS', desc: 'Deposit crypto and let the company trade it for you. Live valuations, full history, zero spreadsheet cope.', sticker: 'INVEST' },
    { title: 'COMPANY DEPOSIT ADDRESSES', desc: 'Admin-published wallet addresses per asset. Copy, send, declare — approval credits your portfolio.', sticker: 'DEPOSIT' },
    { title: 'LINK YOUR WALLET', desc: 'Connect Trust Wallet, MetaMask or Phantom by public address only. Read-only balances, never any seed phrases.', sticker: 'BRIDGE' },
    { title: 'SETTLEMENT LEDGER', desc: 'Every balance movement is accounted for — double-entry discipline, atomic settlement, full audit trail. Your money, fully explainable.', sticker: 'LEDGER' },
    { title: 'RECOVERY PHRASES', desc: 'Every account gets a 12-word platform recovery phrase. Sign in with password or phrase.', sticker: 'KEYS' },
    { title: 'OPS CONTROL ROOM', desc: 'Admin console for deposits, balances, approvals and audit trails. Suspension enforced server-side.', sticker: 'OPS' }
  ];

  const faqs = [
    { q: 'What is QGR Investment?', a: 'A crypto investment platform: you deposit crypto to company addresses, link your own wallets read-only, and the company trades on your behalf. Full portfolio tracking, deposit approvals and a complete transaction ledger.' },
    { q: 'Where do prices come from?', a: 'Live from CoinGecko, refreshed server-side every 5 minutes with automatic fallback. If the feed is unreachable, the app keeps serving the last synced prices and marks them CACHED with an age stamp.' },
    { q: 'How do deposits work?', a: 'Open Deposit, copy the company address for your asset, send funds, then declare the deposit. An admin reviews and approves — approval credits your portfolio through the ledger.' },
    { q: 'What can I do on the platform?', a: 'Hold BTC, ETH, SOL, POL and stablecoins, deposit to company addresses, link external wallets by address, send and transfer between users, and track everything onchain-style.' },
    { q: 'Is my account safe?', a: 'Passwords are bcrypt-hashed, sessions are JWT-secured with 24-hour expiry, every financial mutation settles atomically with idempotency protection, and privileged operations are written to an audit trail. We never ask for your external wallet seed phrases.' },
    { q: 'How do I contact support?', a: 'support@quantumgesararedemption.com — real inbox, real humans, fast response times.' }
  ];
</script>

<svelte:head>
  <title>QGR Investment — Deposit. Link. Grow.</title>
  <meta name="description" content="QGR Investment: multi-chain crypto wallet and swap engine. Live prices, instant settlement, bank-grade security." />
</svelte:head>

<div class="paper-grain min-h-screen bg-paper text-ink">
  <!-- NAV -->
  <nav class="fixed inset-x-0 top-0 z-50 border-b-2 border-ink bg-paper transition-all {scrolled ? 'shadow-[0_4px_0_#0b132b]' : ''}">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="/" class="flex items-center gap-2.5">
        <img src="/qgr-mark.svg" alt="QGR" class="h-9 w-9 border-2 border-ink bg-gold" />
        <span class="font-display text-xl font-bold tracking-tight">QGR<span class="text-gold-deep">/</span>INVEST</span>
      </a>
      <div class="hidden items-center gap-5 md:flex">
        {#each [['#chains', 'ASSETS'], ['#stack', 'WHY QGR'], ['#how', 'HOW IT WORKS'], ['#stories', 'STORIES'], ['#faq', 'FAQ']] as [href, label]}
          <a {href} class="font-display text-xs font-bold tracking-[0.18em] hover:bg-acid hover:px-1">{label}</a>
        {/each}
        <Translate />
        <a href="/login" class="font-display text-xs font-bold tracking-[0.18em] hover:bg-acid hover:px-1">LOG IN</a>
        <a href="/signup" class="btn-primary !px-5 !py-2">INVEST →</a>
      </div>
      <button class="border-2 border-ink bg-white p-1.5 md:hidden" onclick={() => (mobileOpen = !mobileOpen)} aria-label="Menu">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          {#if mobileOpen}<path d="M6 18L18 6M6 6l12 12" />{:else}<path d="M4 6h16M4 12h16M4 18h16" />{/if}
        </svg>
      </button>
    </div>
      {#if mobileOpen}
      <div class="space-y-1 border-t-2 border-ink bg-paper px-4 pt-2 pb-5 md:hidden">
        {#each [['#chains', 'ASSETS'], ['#stack', 'WHY QGR'], ['#how', 'HOW IT WORKS'], ['#stories', 'STORIES'], ['#faq', 'FAQ']] as [href, label]}
          <a {href} class="block py-2.5 font-display text-sm font-bold tracking-widest" onclick={() => (mobileOpen = false)}>{label}</a>
        {/each}
        <a href="/login" class="block py-2.5 font-display text-sm font-bold tracking-widest">LOG IN</a>
        <a href="/signup" class="btn-primary mt-2 w-full">INVEST →</a>
      </div>
    {/if}
  </nav>

  <!-- HERO -->
  <header class="border-b-2 border-ink bg-ink pt-16 text-white">
    <div class="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8 lg:pt-20">
      <div class="flex flex-wrap items-center gap-3">
        <span class="sticker">LIVE INVESTMENT</span>
        <span class="sticker-gold">5 chains live</span>
        <span class="tag-mono !border-gold !bg-transparent !text-gold">REAL-TIME PRICES · INSTANT SETTLEMENT</span>
      </div>
      <h1 class="font-display mt-6 text-6xl leading-[0.95] font-bold tracking-tight sm:text-7xl lg:text-8xl">
        DEPOSIT.<br /><span class="bg-gold px-2 text-ink">GROW.</span><br />WITHDRAW.
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
        QGR Investment is a crypto investment platform. Deposit assets, link your wallets,
        let the company trade — <span class="text-acid font-bold">built for serious investors.</span>
      </p>
      <div class="mt-8 flex flex-col gap-4 sm:flex-row">
        <a href="/signup" class="btn-acid !px-10 !py-4 !text-base">MINT YOUR STACK →</a>
        <a href="/login" class="inline-flex items-center justify-center gap-2 border-2 border-gold px-10 py-4 font-display text-base font-bold tracking-wider text-gold hover:bg-gold hover:text-ink">ENTER THE VAULT</a>
      </div>
      <div class="mt-10 grid grid-cols-3 gap-4 border-t-2 border-gold/30 pt-8">
        <div><p class="font-display text-3xl font-bold text-gold sm:text-4xl">5</p><p class="micro-label mt-1 text-white/50">Chains wired</p></div>
        <div><p class="font-display text-3xl font-bold text-gold sm:text-4xl">24/7</p><p class="micro-label mt-1 text-white/50">Managed trading</p></div>
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
      <h2 class="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">BUILT FOR INVESTORS.<br />HONEST LIKE A LEDGER.</h2>
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
      <h2 class="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">FROM SIGNUP TO YIELD IN 4 STEPS</h2>
      <div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {#each [['01', 'CREATE ACCOUNT', 'Sign up in minutes. Bcrypt-hashed passwords, JWT sessions, plus a 12-word recovery phrase — sign in with either.'], ['02', 'DEPOSIT CRYPTO', 'Copy the company wallet address for your asset, send funds, declare the deposit. Admin approval credits your portfolio.'], ['03', 'WE TRADE, YOU GROW', 'QGR strategists deploy across spot, staking and managed DeFi vaults. Watch allocation and P&L live.'], ['04', 'WITHDRAW ANYTIME', 'Send to your linked wallet or transfer between users. Every move settled on a double-entry ledger.']] as [n, t, d]}
          <div class="border-2 border-gold bg-ink-soft p-6">
            <p class="font-display text-5xl font-bold text-gold">{n}</p>
            <h3 class="font-display mt-3 text-xl font-bold">{t}</h3>
            <p class="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
          </div>
        {/each}
      </div>
      <div class="mt-10 flex flex-col gap-4 sm:flex-row">
        <a href="/signup" class="btn-acid !px-10 !py-4 !text-base">START INVESTING →</a>
        <a href="/login" class="inline-flex items-center justify-center gap-2 border-2 border-gold px-10 py-4 font-display text-base font-bold tracking-wider text-gold hover:bg-gold hover:text-ink">CHAT WITH HELP DESK</a>
      </div>
      <p class="mt-4 font-mono text-xs text-white/50">Logged-in clients get a live 24/7 help-desk chat bubble on every page.</p>
    </div>
  </section>

  <!-- STATS -->
  <section class="border-b-2 border-ink bg-gold text-ink">
    <div class="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
      {#each [['$48M+', 'ASSETS UNDER MANAGEMENT'], ['12,400+', 'INVESTORS ONBOARD'], ['20', 'TOP-CAP ASSETS SUPPORTED'], ['24/7', 'WEB3 HELP DESK']] as [v, l]}
        <div class="text-center">
          <p class="font-display text-4xl font-bold tracking-tight sm:text-5xl">{v}</p>
          <p class="micro-label mt-2">{l}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- WEB3 STRIP -->
  <section class="border-b-2 border-ink bg-paper">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p class="micro-label text-gold-deep">/// THE STACK</p>
      <div class="mt-3 flex flex-wrap gap-2.5 font-display text-xs font-bold tracking-widest">
        {#each ['WEB3 NATIVE', 'DEFI YIELD VAULTS', 'ONCHAIN SETTLEMENT', 'STAKING REWARDS', 'RISK-MANAGED LEVERAGE', 'COLD-STORAGE CUSTODY', 'REAL-TIME AUDIT', 'FIAT ON-RAMPS'] as b}
          <span class="border-2 border-ink bg-white px-3 py-1.5">{b}</span>
        {/each}
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section id="stories" class="border-b-2 border-ink bg-paper-dim">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p class="micro-label text-gold-deep">/// INVESTOR STORIES</p>
      <h2 class="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">COMPOUNDING, WITNESSED.</h2>
      <div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {#each [['Marcus T.', 'Lagos · Investor since 2024', 'I linked my Trust Wallet in two minutes and watched my first BTC deposit get approved the same day. The portfolio view reads like a Bloomberg terminal without the Bloomberg invoice.'], ['Adaeze O.', 'London · Investor since 2023', 'What sold me was the ledger — every credit has a receipt, every trade a trail. Support answered my withdrawal question at 2am. In minutes.'], ['Ruben P.', 'Madrid · Investor since 2024', 'I came for the ETH staking yields and stayed for the transparency. Recovery-phrase login means I never worry about losing access.'], ['Lena K.', 'Berlin · Investor since 2025', 'Twenty top-cap assets, one dashboard, zero spreadsheets. My USDC parking earns while I sleep and I can see exactly where it sits.']] as [n, m, q]}
          <figure class="brut-card bg-white p-6">
            <p class="font-display text-4xl text-gold">“</p>
            <blockquote class="mt-1 leading-relaxed">{q}</blockquote>
            <figcaption class="mt-4 border-t-2 border-ink pt-3">
              <p class="font-display text-sm font-bold">{n}</p>
              <p class="font-mono text-xs text-ink/50">{m}</p>
              <p class="mt-1 font-mono text-xs font-bold text-up">★★★★★ VERIFIED INVESTOR</p>
            </figcaption>
          </figure>
        {/each}
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
      <h2 class="font-display text-4xl font-bold tracking-tight sm:text-5xl">READY TO PUT CAPITAL TO WORK?</h2>
      <p class="mx-auto mt-3 max-w-xl font-medium text-ink/70">Free account. Recovery phrase included. Live portfolio from day one.</p>
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
            <span class="font-display text-lg font-bold text-white">QGR/INVEST</span>
          </div>
          <p class="text-sm leading-relaxed">Crypto investment management by Quantum Gesara Redemption — deposits, managed trading, web3 support.</p>
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
        <p>© 2026 QGR INVESTMENT. ALL RIGHTS RESERVED.</p>
        <p>PRICES: LIVE MARKET DATA · SUPPORT: support@quantumgesararedemption.com</p>
      </div>
    </div>
  </footer>
</div>
