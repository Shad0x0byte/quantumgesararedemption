<script lang="ts">
  import { onMount } from 'svelte';
  import { getLinkedWallets, linkExternalWallet, getExternalBalance } from '$lib/api/client';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  const LABELS = ['TrustWallet', 'MetaMask', 'Phantom', 'Coinbase', 'Exodus', 'Other'];
  const NETWORKS = ['ETH', 'BTC', 'SOL', 'POL', 'BASE', 'USDT', 'USDC'];

  let loading = true;
  let linked: { label: string; network: string; address: string }[] = [];
  let label = 'TrustWallet';
  let network = 'ETH';
  let address = '';
  let busy = false;
  let formError = '';
  let balances: Record<string, any> = {};
  let lookupBusy = '';

  async function refresh() {
    loading = true;
    const res = await getLinkedWallets();
    loading = false;
    if (res.success) linked = (res.data as any)?.wallets ?? [];
    else toast.error(res.error ?? 'Could not load linked wallets');
  }
  onMount(refresh);

  async function link() {
    formError = '';
    if (!address.trim()) {
      formError = 'Paste your public wallet ADDRESS.';
      return;
    }
    if (/\s/.test(address.trim()) && address.trim().split(/\s+/).length >= 6) {
      formError = 'Never enter seed phrases here — public ADDRESS only.';
      return;
    }
    busy = true;
    const res = await linkExternalWallet({ label, network, address: address.trim() });
    busy = false;
    if (res.success) {
      toast.success(`${label} linked (read-only)`);
      address = '';
      await refresh();
    } else formError = (res.errors?.join(', ') ?? res.error) || 'Link failed';
  }

  async function lookup(w: { address: string; network: string }) {
    const key = `${w.network}:${w.address}`;
    lookupBusy = key;
    const res = await getExternalBalance(w.address, w.network);
    lookupBusy = '';
    if (res.success) balances[key] = (res.data as any);
    else toast.error(res.error ?? 'Balance lookup failed');
  }
</script>

<svelte:head><title>Link Wallet — QGR Investment</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
  <div>
    <span class="sticker-gold">BRIDGE</span>
    <h1 class="font-display mt-2 text-3xl font-bold tracking-tight">LINK DECENTRALIZED WALLET</h1>
    <p class="mt-1 font-mono text-xs text-ink/60">CONNECT BY PUBLIC ADDRESS ONLY — WE NEVER ASK FOR SEED PHRASES. BALANCES ARE READ-ONLY.</p>
  </div>

  <div class="brut-card bg-blood/5 p-4 font-mono text-xs font-bold text-blood">⚠ NEVER ENTER YOUR TRUST WALLET / METAMASK SEED PHRASE ANYWHERE ON THIS SITE. ADDRESS ONLY.</div>

  <div class="brut-card bg-white p-6">
    <h2 class="font-display font-bold tracking-widest">LINK NEW WALLET</h2>
    {#if formError}<p class="mt-3 font-mono text-xs font-bold text-blood">!! {formError}</p>{/if}
    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label class="micro-label" for="lw-label">WALLET</label>
        <select id="lw-label" bind:value={label} class="input-base mt-1 font-mono">{#each LABELS as l}<option value={l}>{l}</option>{/each}</select>
      </div>
      <div>
        <label class="micro-label" for="lw-net">NETWORK</label>
        <select id="lw-net" bind:value={network} class="input-base mt-1 font-mono">{#each NETWORKS as n}<option value={n}>{n}</option>{/each}</select>
      </div>
      <div class="md:col-span-1">
        <label class="micro-label" for="lw-addr">PUBLIC ADDRESS</label>
        <input id="lw-addr" bind:value={address} class="input-base mt-1 font-mono" placeholder="0x… / bc1… " />
      </div>
    </div>
    <button onclick={link} disabled={busy} class="btn-acid mt-5 w-full !py-3">{busy ? 'LINKING…' : 'LINK WALLET (ADDRESS ONLY) →'}</button>
  </div>

  {#if loading}
    <div class="flex justify-center py-10"><LoadingSpinner /></div>
  {:else if !linked.length}
    <div class="brut-card bg-white p-8 text-center font-mono text-sm">No wallets linked yet.</div>
  {:else}
    <div class="space-y-3">
      {#each linked as w}
        {@const key = `${w.network}:${w.address}`}
        <div class="brut-card bg-white p-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="sticker">{w.label}</span>
            <div class="min-w-0 flex-1">
              <p class="font-mono text-[11px] text-ink/50">{w.network}</p>
              <p class="font-mono text-sm font-bold break-all">{w.address}</p>
            </div>
            <button onclick={() => lookup(w)} disabled={lookupBusy === key} class="btn-secondary !px-4 !py-2 !text-xs">{lookupBusy === key ? '…' : balances[key] ? 'REFRESH' : 'SHOW BALANCE'}</button>
          </div>
          {#if balances[key]}
            <p class="mt-2 overflow-x-auto font-mono text-sm">BALANCE <span class="font-bold">{balances[key].balance} {balances[key].symbol}</span> ≈ <span class="font-bold">${balances[key].value_usd}</span> <span class="text-ink/50">(simulated read-only)</span></p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
