<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { getCryptoDashboard } from '$lib/api/client';
  import { cryptoAssets, cryptoTransactions, formatUsd, formatCrypto } from '$lib/crypto/demo';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { CryptoAsset, CryptoTransaction } from '$lib/types';

  let loading = true;
  let user: any = null;
  let assets: CryptoAsset[] = cryptoAssets;
  let transactions: CryptoTransaction[] = cryptoTransactions;
  let portfolioTotal = 0;
  let portfolioChange = 0;
  let priceMeta: any = null;
  let usingDemo = true;

  async function load() {
    const res = await getCryptoDashboard();
    const d = res.data as any;
    if (res.success && d) {
      usingDemo = false;
      user = d.user;
      assets = d.assets?.length ? d.assets : cryptoAssets;
      transactions = d.transactions?.length ? d.transactions : cryptoTransactions;
      portfolioTotal = Number(d.portfolio_total_usd ?? 0);
      portfolioChange = Number(d.change_24h_pct ?? 0);
      priceMeta = d.price_meta ?? null;
      if (user) auth.updateUser(user);
    } else {
      const s = await new Promise<any>((resolve) => {
        const unsub = auth.subscribe((v) => {
          resolve(v);
          unsub();
        });
      });
      user = s.user;
    }
  }

  onMount(async () => {
    await load();
    loading = false;
  });

  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'GM' : h < 18 ? 'GA' : 'GN';
  }

  function txGlyph(tx: CryptoTransaction) {
    return tx.type === 'received' ? '↓' : tx.type === 'sent' ? '↑' : tx.type === 'swap' ? '⇄' : tx.type === 'buy' ? '+' : tx.type === 'sell' ? '−' : '•';
  }

  $: maxVal = Math.max(1, ...assets.map((a) => a.value_usd));
</script>

<svelte:head><title>Stack — QGR Exchange</title></svelte:head>

{#if loading}
  <div class="flex items-center justify-center py-32"><LoadingSpinner size="lg" /></div>
{:else}
  <div class="fade-in space-y-6">
    {#if usingDemo}
      <div class="brut-flat flex items-center gap-3 border-gold bg-white p-4 text-sm font-bold">
        <span class="sticker-gold">OFFLINE</span>
        <span>Connection lost — showing last synced balances.</span>
      </div>
    {/if}

    <!-- HERO -->
    <section class="brut-card-navy p-6 sm:p-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="micro-label text-gold">{greeting()} — {user?.first_name?.toUpperCase() ?? 'DEGEN'}'S STACK</p>
          <p class="font-display mt-3 text-5xl font-bold tracking-tight sm:text-6xl">{formatUsd(portfolioTotal)}</p>
          <p class="mt-2 font-mono text-sm font-bold {portfolioChange >= 0 ? 'text-acid' : 'text-blood'}">
            {portfolioChange >= 0 ? '▲' : '▼'} {Math.abs(portfolioChange).toFixed(2)}% <span class="font-normal text-white/50">/ 24H</span>
          </p>
        </div>
        <div class="flex flex-col items-end gap-2">
          {#if priceMeta}
            <span class={priceMeta.mode === 'live' ? 'sticker' : 'sticker-gold'}>{priceMeta.mode === 'live' ? '● LIVE' : `CACHED ${priceMeta.age_seconds ?? '?'}S`}</span>
          {/if}
          <button class="border-2 border-gold px-3 py-2 font-display text-xs font-bold tracking-widest text-gold hover:bg-gold hover:text-ink" onclick={async () => ((loading = true), await load(), (loading = false))}>↻ REFRESH</button>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <a href="/dashboard/wallets" class="border-2 border-white/20 bg-white/5 p-4 hover:border-acid hover:bg-white/10">
          <p class="font-display text-xl font-bold text-acid">⬢</p>
          <p class="font-display mt-2 text-sm font-bold tracking-widest">VAULT</p>
          <p class="mt-1 font-mono text-[11px] text-white/50">keys + QRs</p>
        </a>
        <a href="/dashboard/markets" class="border-2 border-white/20 bg-white/5 p-4 hover:border-acid hover:bg-white/10">
          <p class="font-display text-xl font-bold text-acid">▲</p>
          <p class="font-display mt-2 text-sm font-bold tracking-widest">TICKER</p>
          <p class="mt-1 font-mono text-[11px] text-white/50">ape in/out</p>
        </a>
        <a href="/dashboard/swap" class="border-2 border-gold bg-gold p-4 text-ink hover:bg-acid">
          <p class="font-display text-xl font-bold">⇄</p>
          <p class="font-display mt-2 text-sm font-bold tracking-widest">SWAP</p>
          <p class="mt-1 font-mono text-[11px]">0.35% fee</p>
        </a>
        <a href="/dashboard/transactions" class="border-2 border-white/20 bg-white/5 p-4 hover:border-acid hover:bg-white/10">
          <p class="font-display text-xl font-bold text-acid">⛓</p>
          <p class="font-display mt-2 text-sm font-bold tracking-widest">ONCHAIN</p>
          <p class="mt-1 font-mono text-[11px] text-white/50">receipts</p>
        </a>
      </div>
    </section>

    <!-- ALLOCATION + ASSETS -->
    <section class="brut-card bg-white p-5 sm:p-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-display text-lg font-bold tracking-tight">ALLOCATION</h2>
          <p class="mt-0.5 font-mono text-xs text-ink/50">WHERE THE BAGS SIT</p>
        </div>
        <a href="/dashboard/wallets" class="font-display text-xs font-bold underline decoration-gold decoration-2 underline-offset-4 hover:bg-acid">MANAGE →</a>
      </div>
      <div class="mt-5 space-y-4">
        {#each assets.slice(0, 6) as asset}
          <div>
            <div class="flex items-center justify-between font-mono text-xs">
              <div class="flex items-center gap-2">
                <span class="border border-ink bg-paper px-1.5 py-0.5 font-display font-bold">{asset.symbol}</span>
                <span class="font-bold">{asset.name.toUpperCase()}</span>
              </div>
              <span class="font-bold">{formatUsd(asset.value_usd)}</span>
            </div>
            <div class="mt-1.5 h-3 border border-ink bg-paper">
              <div class="h-full bg-ink" style={`width:${Math.min(100, portfolioTotal > 0 ? (asset.value_usd / portfolioTotal) * 100 : 0)}%`}></div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- POSITIONS -->
    <section class="brut-card overflow-hidden bg-white">
      <div class="flex items-center justify-between border-b-2 border-ink px-5 py-4">
        <div>
          <h2 class="font-display text-lg font-bold tracking-tight">POSITIONS</h2>
          <p class="mt-0.5 font-mono text-xs text-ink/50">MARKED TO COINGECKO</p>
        </div>
        <a href="/dashboard/markets" class="font-display text-xs font-bold underline decoration-gold decoration-2 underline-offset-4 hover:bg-acid">FULL TICKER →</a>
      </div>
      <div>
        {#each assets as asset}
          <div class="flex items-center justify-between border-b border-ink/15 px-5 py-4 last:border-0 hover:bg-paper">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center border-2 border-ink bg-gold font-display font-bold">{asset.icon}</div>
              <div>
                <p class="font-display text-sm font-bold">{asset.name.toUpperCase()}</p>
                <p class="font-mono text-xs text-ink/50">{asset.network} · {formatCrypto(asset.balance, asset.symbol)}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-mono text-sm font-bold">{formatUsd(asset.value_usd)}</p>
              <p class="mt-0.5 font-mono text-xs font-bold {asset.change_24h >= 0 ? 'text-up' : 'text-down'}">{asset.change_24h >= 0 ? '▲' : '▼'}{Math.abs(asset.change_24h).toFixed(2)}%</p>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- FEED -->
    <section class="brut-card overflow-hidden bg-white">
      <div class="flex items-center justify-between border-b-2 border-ink px-5 py-4">
        <div>
          <h2 class="font-display text-lg font-bold tracking-tight">LATEST ONCHAIN</h2>
          <p class="mt-0.5 font-mono text-xs text-ink/50">SETTLED IN THE QGR LEDGER</p>
        </div>
        <a href="/dashboard/transactions" class="font-display text-xs font-bold underline decoration-gold decoration-2 underline-offset-4 hover:bg-acid">ALL →</a>
      </div>
      <div>
        {#each transactions.slice(0, 5) as tx}
          <div class="flex items-center justify-between px-5 py-4">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper font-display text-lg font-bold">{txGlyph(tx)}</div>
              <div class="min-w-0">
                <p class="truncate font-display text-sm font-bold">{tx.description}</p>
                <p class="truncate font-mono text-xs text-ink/50">{tx.network} · {new Date(tx.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            </div>
            <div class="ml-3 text-right">
              <p class="font-mono text-sm font-bold {tx.amount >= 0 ? 'text-up' : 'text-ink'}">{tx.amount >= 0 ? '+' : ''}{formatCrypto(tx.amount, tx.symbol)}</p>
              <span class="mt-1 inline-block border border-ink bg-paper px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">{tx.status}</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
{/if}
