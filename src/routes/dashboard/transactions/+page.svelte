<script lang="ts">
  import { onMount } from 'svelte';
  import { getCryptoTransactions } from '$lib/api/client';
  import { cryptoTransactions, formatCrypto, formatUsd } from '$lib/crypto/demo';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { CryptoTransaction } from '$lib/types';

  let loading = true;
  let loadError = '';
  let transactions: CryptoTransaction[] = cryptoTransactions;
  let filter = 'all';

  onMount(async () => {
    const res = await getCryptoTransactions(50);
    const d = res.data as any;
    if (res.success && d?.transactions?.length) transactions = d.transactions;
    else if (!transactions.length) loadError = res.error ?? 'Feed down.';
    loading = false;
  });

  $: filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

  const glyph = (t: CryptoTransaction) =>
    t.type === 'received' ? '↓' : t.type === 'sent' ? '↑' : t.type === 'swap' ? '⇄' : t.type === 'buy' ? '+' : t.type === 'sell' ? '−' : '•';
</script>

<svelte:head><title>Onchain Feed — QGR Exchange</title></svelte:head>

{#if loading}
  <div class="flex items-center justify-center py-32"><LoadingSpinner size="lg" /></div>
{:else if loadError && !transactions.length}
  <div class="brut-flat border-blood bg-white p-8 text-center font-bold text-blood">{loadError}</div>
{:else}
  <div class="fade-in space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="micro-label text-gold-deep">/// ONCHAIN FEED</p>
        <h1 class="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">RECEIPTS OR IT DIDN'T HAPPEN</h1>
        <p class="mt-1 font-mono text-xs text-ink/60">EVERY SETTLEMENT, HASHED + STAMPED IN THE QGR LEDGER</p>
      </div>
      <select bind:value={filter} class="input-base max-w-[200px] font-mono text-xs font-bold">
        <option value="all">ALL SIGNALS</option>
        <option value="received">INFLOWS ↓</option>
        <option value="sent">OUTFLOWS ↑</option>
        <option value="swap">SWAPS ⇄</option>
        <option value="buy">APES +</option>
        <option value="sell">DUMPS −</option>
        <option value="fee">GAS •</option>
        <option value="adjustment">OPS •</option>
      </select>
    </div>

    {#if !filtered.length}
      <div class="brut-card bg-white p-10 text-center">
        <p class="font-display text-xl font-bold">NOTHING ONCHAIN YET.</p>
        <p class="mt-1 font-mono text-xs text-ink/50">WAGMI starts with a first transaction. Go ape something.</p>
      </div>
    {/if}

    <div class="brut-card overflow-hidden bg-white">
      <div class="divide-y divide-ink/10">
        {#each filtered as tx}
          <div class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper sm:px-6">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ink bg-paper font-display text-base font-bold">{glyph(tx)}</div>
              <div class="min-w-0">
                <p class="truncate font-display text-sm font-bold">{tx.description}</p>
                <p class="truncate font-mono text-xs text-ink/50">
                  {tx.network} · {new Date(tx.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}{#if tx.tx_hash} · <span class="text-gold-deep">{tx.tx_hash.slice(0, 10)}…</span>{/if}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-mono text-sm font-bold {tx.amount >= 0 ? 'text-up' : 'text-ink'}">{tx.amount >= 0 ? '+' : ''}{formatCrypto(tx.amount, tx.symbol)}</p>
              <p class="font-mono text-xs text-ink/50">{formatUsd(tx.value_usd)}{#if tx.fee_usd} · GAS {formatUsd(tx.fee_usd)}{/if}</p>
              <span
                class="mt-1 inline-block border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase {tx.status === 'completed'
                  ? 'border-ink bg-acid text-ink'
                  : tx.status === 'pending' || tx.status === 'processing'
                    ? 'border-ink bg-gold text-ink'
                    : tx.status === 'cancelled'
                      ? 'border-ink bg-paper text-ink/60'
                      : 'border-ink bg-blood text-white'}">{tx.status}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
