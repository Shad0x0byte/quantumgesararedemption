<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getSwapQuote, executeSwap, getCryptoWallets } from '$lib/api/client';
  import { formatUsd, formatCrypto } from '$lib/crypto/demo';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { CryptoWallet } from '$lib/types';

  let wallets: CryptoWallet[] = [];
  let loading = true;
  let fromAsset = 'BTC';
  let toAsset = 'USDC';
  let amount = 0.01;
  let quoting = false;
  let confirming = false;
  let quote: any = null;
  let quoteError = '';
  let expiresIn = 0;
  let result: any = null;
  let resultError = '';
  let timer: ReturnType<typeof setInterval> | null = null;

  const symbols = () => [...new Set(wallets.map((w) => w.symbol))];
  const walletOf = (s: string) => wallets.find((w) => w.symbol === s);
  const priceOf = (s: string) => walletOf(s)?.price_usd ?? 0;

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function startExpiry() {
    stopTimer();
    expiresIn = quote?.expires_in_seconds ?? 60;
    timer = setInterval(() => {
      expiresIn -= 1;
      if (expiresIn <= 0) {
        stopTimer();
        quote = null;
        quoteError = 'Quote expired — the market waits for no one. Get a fresh one.';
      }
    }, 1000);
  }

  async function refresh() {
    const res = await getCryptoWallets();
    const d = res.data as any;
    if (res.success && d?.wallets?.length) wallets = d.wallets;
  }

  async function getQuote() {
    if (amount <= 0) {
      quoteError = 'Enter an amount greater than zero. Dust is for rugs.';
      return;
    }
    quoting = true;
    quoteError = '';
    result = null;
    resultError = '';
    const res = await getSwapQuote(fromAsset, toAsset, amount);
    const d = res.data as any;
    quoting = false;
    if (res.success && d) {
      quote = d;
      startExpiry();
    } else {
      quote = null;
      quoteError = res.error ?? 'Quote machine broke.';
    }
  }

  function flip() {
    const old = fromAsset;
    fromAsset = toAsset;
    toAsset = old;
    quote = null;
    result = null;
  }

  async function confirmSwap() {
    if (!quote) return;
    confirming = true;
    resultError = '';
    const res = await executeSwap(fromAsset, toAsset, amount, { quote_key: quote.quote_key });
    const d = res.data as any;
    confirming = false;
    if (res.success) {
      result = d;
      stopTimer();
      quote = null;
      await refresh();
      toast.success('Swap settled. Chef kiss.');
    } else {
      resultError = res.error ?? 'Swap got rekt';
      toast.error(res.error ?? 'Swap failed');
    }
  }

  onMount(async () => {
    await refresh();
    loading = false;
    if (symbols().includes('BTC') && symbols().includes('USDC')) await getQuote();
  });
  onDestroy(stopTimer);
</script>

<svelte:head><title>Swap Engine — QGR Exchange</title></svelte:head>

{#if loading}
  <div class="flex items-center justify-center py-32"><LoadingSpinner size="lg" /></div>
{:else}
  <div class="fade-in mx-auto max-w-3xl space-y-6">
    <div>
      <p class="micro-label text-gold-deep">/// SWAP ENGINE</p>
      <h1 class="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">DUMP IT. PUMP IT.</h1>
      <p class="mt-1 font-mono text-xs text-ink/60">BACKEND-QUOTED · LEDGER-SETTLED · 0.35% FLAT</p>
    </div>

    <section class="brut-card bg-white p-5 sm:p-7">
      <!-- PAY -->
      <div class="border-2 border-ink bg-ink p-4 text-white">
        <div class="flex items-center justify-between">
          <span class="micro-label text-gold">YOU DUMP</span>
          <span class="font-mono text-xs text-white/50">SPENDABLE {walletOf(fromAsset) ? formatCrypto(walletOf(fromAsset)!.available_balance ?? walletOf(fromAsset)!.balance, fromAsset) : '—'}</span>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <input type="number" min="0" step="any" bind:value={amount} oninput={() => (quote = null)} class="w-full bg-transparent font-display text-4xl font-bold text-white outline-none placeholder:text-white/20" placeholder="0.00" />
          <select bind:value={fromAsset} onchange={() => (quote = null)} class="border-2 border-gold bg-ink px-3 py-2 font-display text-sm font-bold text-gold">
            {#each symbols() as s}<option value={s}>{s}</option>{/each}
          </select>
        </div>
        <p class="mt-2 font-mono text-xs text-white/50">≈ {formatUsd(amount * priceOf(fromAsset))}</p>
      </div>

      <div class="flex justify-center py-1">
        <button class="border-2 border-ink bg-acid px-4 py-1 font-display text-lg font-bold hover:bg-gold" onclick={flip} title="Flip pair">⇅</button>
      </div>

      <!-- RECEIVE -->
      <div class="border-2 border-ink bg-paper p-4">
        <div class="flex items-center justify-between">
          <span class="micro-label">YOU PUMP</span>
          <span class="font-mono text-xs font-bold {quote ? 'text-blood' : 'text-ink/40'}">{quote ? `⏳ ${expiresIn}S` : 'AWAITING QUOTE'}</span>
        </div>
        <div class="mt-3 flex items-center justify-between gap-3">
          <span class="font-display text-4xl font-bold">{quote ? Number(quote.to_amount).toLocaleString('en-US', { maximumFractionDigits: 6 }) : '—'}</span>
          <select bind:value={toAsset} onchange={() => (quote = null)} class="border-2 border-ink bg-white px-3 py-2 font-display text-sm font-bold">
            {#each symbols() as s}<option value={s}>{s}</option>{/each}
          </select>
        </div>
        <p class="mt-2 font-mono text-xs text-ink/50">≈ {quote ? formatUsd(Number(quote.to_amount) * priceOf(toAsset)) : '—'}</p>
      </div>

      {#if quote}
        <div class="my-5 space-y-2 border-2 border-ink bg-white p-4 font-mono text-xs">
          <div class="flex justify-between"><span class="text-ink/50">RATE</span><span class="font-bold">1 {fromAsset} ≈ {Number(quote.rate).toLocaleString(undefined, { maximumFractionDigits: 6 })} {toAsset}</span></div>
          <div class="flex justify-between"><span class="text-ink/50">FEE (0.35%)</span><span class="font-bold">{formatUsd(quote.network_fee_usd ?? quote.fee_usd ?? 0)}</span></div>
          {#if quote.from_network || quote.to_network}
            <div class="flex justify-between"><span class="text-ink/50">ROUTE</span><span class="font-bold">{quote.from_network ?? ''} → {quote.to_network ?? ''}</span></div>
          {/if}
          <div class="flex justify-between"><span class="text-ink/50">MIN. RECEIVE</span><span class="font-bold">{Number(quote.to_amount).toLocaleString('en-US', { maximumFractionDigits: 6 })} {toAsset}</span></div>
          <div class="flex justify-between"><span class="text-ink/50">PRICE FEED</span><span class="font-bold">{quote.price_meta?.mode === 'live' ? '● COINGECKO LIVE' : 'CACHED'}</span></div>
        </div>
      {/if}

      {#if quoteError}
        <div class="brut-flat my-4 border-blood bg-white p-3 text-sm font-bold text-blood">REKT: {quoteError}</div>
      {/if}
      {#if result}
        <div class="brut-flat my-4 border-ink bg-acid p-3 text-sm font-bold">
          SETTLED: {formatCrypto(result.from_amount, fromAsset)} → {formatCrypto(result.to_amount, toAsset)}. Bags updated. <a href="/dashboard/transactions" class="underline">VIEW ONCHAIN →</a>
        </div>
      {/if}
      {#if resultError}
        <div class="brut-flat my-4 border-blood bg-white p-3 text-sm font-bold text-blood">REKT: {resultError}</div>
      {/if}

      <div class="flex gap-3">
        <button class="btn-secondary flex-1" onclick={getQuote} disabled={quoting || confirming || amount <= 0}>{quoting ? 'QUOTING…' : 'GET QUOTE'}</button>
        <button class="btn-acid flex-1" onclick={confirmSwap} disabled={!quote || confirming || quoting}>{confirming ? 'SETTLING…' : '⚡ CONFIRM SWAP'}</button>
      </div>
      {#if confirming}<p class="mt-2 text-center font-mono text-xs text-ink/50">SETTLING ON THE QGR LEDGER — DON'T CLOSE THIS TAB.</p>{/if}
    </section>
  </div>
{/if}
