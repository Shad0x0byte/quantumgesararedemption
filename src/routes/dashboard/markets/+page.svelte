<script lang="ts">
  import { onMount } from 'svelte';
  import { getCryptoMarkets, buyCrypto, sellCrypto } from '$lib/api/client';
  import { cryptoAssets, formatUsd, formatCrypto } from '$lib/crypto/demo';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { CryptoAsset } from '$lib/types';

  let loading = true;
  let loadError = '';
  let assets: CryptoAsset[] = cryptoAssets;
  let priceMeta: any = null;

  let modal: null | 'buy' | 'sell' = null;
  let active: CryptoAsset | null = null;
  let usdAmount = 100;
  let sellAmount = 0;
  let busy = false;
  let formError = '';
  let formOk = '';

  async function refresh() {
    const res = await getCryptoMarkets();
    const d = res.data as any;
    if (res.success && d?.assets?.length) {
      assets = d.assets;
      priceMeta = d.price_meta ?? null;
      loadError = '';
    } else if (!assets.length) {
      loadError = res.error ?? 'Ticker down. Probably nothing.';
    }
  }

  function open(kind: 'buy' | 'sell', a: CryptoAsset) {
    modal = kind;
    active = a;
    formError = '';
    formOk = '';
    usdAmount = 100;
    sellAmount = 0;
  }
  function close() {
    modal = null;
    active = null;
  }

  async function doBuy() {
    if (!active || usdAmount <= 0) {
      formError = 'Enter a positive USD amount. No dust.';
      return;
    }
    busy = true;
    formError = '';
    const res = await buyCrypto(active.symbol, usdAmount);
    const d = res.data as any;
    busy = false;
    if (res.success) {
      formOk = `Aped ${formatCrypto(d.crypto_amount ?? 0, active.symbol)} for ${formatUsd(usdAmount)} (fee ${formatUsd(d.fee_usd ?? 0)}).`;
      await refresh();
      active = assets.find((a) => a.symbol === active!.symbol) ?? active;
      toast.success('Ape successful');
    } else {
      formError = res.error ?? 'Ape failed.';
    }
  }

  async function doSell() {
    if (!active || sellAmount <= 0) {
      formError = 'Enter a positive amount.';
      return;
    }
    if (sellAmount > active.balance) {
      formError = `Exceeds your ${formatCrypto(active.balance, active.symbol)}. Spot only — no margin.`;
      return;
    }
    busy = true;
    formError = '';
    const res = await sellCrypto(active.symbol, sellAmount);
    const d = res.data as any;
    busy = false;
    if (res.success) {
      formOk = `Paper-handed ${formatCrypto(sellAmount, active.symbol)} for ${formatUsd(d.usd_received ?? 0)}. Weak? Or genius? Time tells.`;
      await refresh();
      active = assets.find((a) => a.symbol === active!.symbol) ?? active;
      toast.success('Dump settled');
    } else {
      formError = res.error ?? 'Dump failed.';
    }
  }

  onMount(async () => {
    await refresh();
    loading = false;
  });
</script>

<svelte:head><title>Ticker — QGR Exchange</title></svelte:head>

{#if loading}
  <div class="flex items-center justify-center py-32"><LoadingSpinner size="lg" /></div>
{:else if loadError && !assets.length}
  <div class="brut-flat border-blood bg-white p-8 text-center font-bold text-blood">{loadError}</div>
{:else}
  <div class="fade-in space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="micro-label text-gold-deep">/// TICKER</p>
        <h1 class="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">NUMBER GO UP?</h1>
        <p class="mt-1 font-mono text-xs text-ink/60">COINGECKO-FED · {priceMeta ? (priceMeta.mode === 'live' ? '● LIVE' : `CACHED ${priceMeta.age_seconds ?? '?'}S`) : ''} · APE IN OR OUT VS USD</p>
      </div>
      <button class="btn-secondary" onclick={refresh}>↻ REFRESH</button>
    </div>
    <div class="brut-card overflow-hidden bg-white">
      <div class="grid grid-cols-[1.2fr_0.9fr_0.7fr_0.8fr] border-b-2 border-ink bg-ink px-5 py-3 font-display text-[10px] font-bold tracking-[0.18em] text-gold sm:px-6">
        <span>ASSET</span><span>PRICE</span><span>24H</span><span class="text-right">YOUR BAG</span>
      </div>
      {#each assets as asset}
        <div class="grid grid-cols-[1.2fr_0.9fr_0.7fr_0.8fr] items-center border-b border-ink/15 px-5 py-4 last:border-0 hover:bg-paper sm:px-6">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center border-2 border-ink bg-gold font-display font-bold">{asset.icon}</div>
            <div>
              <p class="font-display text-sm font-bold">{asset.name.toUpperCase()}</p>
              <p class="font-mono text-xs text-ink/50">{asset.symbol} · {asset.network}</p>
            </div>
          </div>
          <p class="font-mono text-sm font-bold">{formatUsd(asset.price_usd, asset.price_usd < 10 ? 4 : 2)}</p>
          <p class="font-mono text-xs font-bold {asset.change_24h >= 0 ? 'text-up' : 'text-down'}">{asset.change_24h >= 0 ? '▲' : '▼'}{Math.abs(asset.change_24h).toFixed(2)}%</p>
          <div class="text-right">
            <p class="font-mono text-sm font-bold">{formatUsd(asset.value_usd)}</p>
            <p class="font-mono text-xs text-ink/50">{formatCrypto(asset.balance, asset.symbol)}</p>
            <div class="mt-1 flex justify-end gap-1">
              <button class="border-2 border-ink bg-acid px-2 py-1 font-display text-[11px] font-bold hover:bg-gold" onclick={() => open('buy', asset)}>APE</button>
              <button class="border-2 border-ink bg-white px-2 py-1 font-display text-[11px] font-bold hover:bg-blood hover:text-white" onclick={() => open('sell', asset)}>DUMP</button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if modal && active}
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center" role="dialog" aria-modal="true">
    <div class="brut-card w-full max-w-md bg-white p-6">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-lg font-bold">{modal === 'buy' ? `APE ${active.symbol}` : `DUMP ${active.symbol}`}</h2>
        <button class="border-2 border-ink bg-paper px-2 font-bold hover:bg-blood hover:text-white" onclick={close}>✕</button>
      </div>
      <p class="mt-1 font-mono text-xs text-ink/50">{formatUsd(active.price_usd, active.price_usd < 10 ? 4 : 2)} · BAG {formatCrypto(active.balance, active.symbol)}</p>

      {#if formError}<div class="brut-flat mt-4 border-blood bg-white p-3 text-sm font-bold text-blood">REKT: {formError}</div>{/if}
      {#if formOk}<div class="brut-flat mt-4 border-ink bg-acid p-3 text-sm font-bold">WAGMI: {formOk}</div>{/if}

      {#if modal === 'buy'}
        <div class="mt-4">
          <label class="micro-label" for="buy-usd">SPEND IN USD (FROM CHECKING)</label>
          <input id="buy-usd" type="number" min="0" step="any" bind:value={usdAmount} class="input-base mt-1 font-mono" />
          <p class="mt-2 font-mono text-xs text-ink/50">≈ {formatCrypto(usdAmount / (active.price_usd || 1), active.symbol)} BEFORE 0.35% VIG</p>
          <button class="btn-acid mt-3 w-full" onclick={doBuy} disabled={busy}>{busy ? 'APING…' : 'CONFIRM APE'}</button>
        </div>
      {:else}
        <div class="mt-4">
          <label class="micro-label" for="sell-amt">DUMP AMOUNT ({active.symbol})</label>
          <input id="sell-amt" type="number" min="0" step="any" bind:value={sellAmount} class="input-base mt-1 font-mono" />
          <p class="mt-2 font-mono text-xs text-ink/50">≈ {formatUsd(sellAmount * active.price_usd)} BEFORE 0.35% VIG</p>
          <button class="btn-danger mt-3 w-full" onclick={doSell} disabled={busy}>{busy ? 'DUMPING…' : 'CONFIRM DUMP'}</button>
        </div>
      {/if}
    </div>
  </div>
{/if}
