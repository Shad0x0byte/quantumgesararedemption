<script lang="ts">
  import { onMount } from 'svelte';
  import { getDepositAddresses, declareDeposit } from '$lib/api/client';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = true;
  let addresses: { asset: string; network: string; address: string }[] = [];
  let copied = '';
  let asset = 'ETH';
  let network = 'ETH';
  let amount = 0;
  let txRef = '';
  let busy = false;
  let formError = '';

  async function refresh() {
    loading = true;
    const res = await getDepositAddresses();
    loading = false;
    if (res.success) addresses = (res.data as any)?.addresses ?? [];
    else toast.error(res.error ?? 'Could not load deposit addresses');
  }
  onMount(refresh);

  async function copy(addr: string) {
    try {
      await navigator.clipboard.writeText(addr);
      copied = addr;
      setTimeout(() => (copied = ''), 2000);
      toast.success('Address copied');
    } catch {
      toast.error('Copy failed — select manually');
    }
  }

  async function submit() {
    formError = '';
    if (!asset || amount <= 0) {
      formError = 'Pick an asset and a positive amount.';
      return;
    }
    busy = true;
    const res = await declareDeposit({ asset, network, amount, tx_ref: txRef });
    busy = false;
    if (res.success) {
      toast.success('Deposit declared — admin will credit your portfolio');
      amount = 0;
      txRef = '';
    } else formError = res.error ?? 'Declaration failed';
  }
</script>

<svelte:head><title>Deposit — QGR Investment</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
  <div>
    <span class="sticker-gold">FUND</span>
    <h1 class="font-display mt-2 text-3xl font-bold tracking-tight">DEPOSIT CRYPTO</h1>
    <p class="mt-1 font-mono text-xs text-ink/60">SEND TO THE COMPANY ADDRESS BELOW, THEN DECLARE — ADMIN APPROVES AND YOUR PORTFOLIO IS CREDITED.</p>
  </div>

  {#if loading}
    <div class="flex justify-center py-16"><LoadingSpinner /></div>
  {:else if !addresses.length}
    <div class="brut-card bg-white p-8 text-center font-mono text-sm">No deposit addresses published yet. Check back soon.</div>
  {:else}
    <div class="space-y-3">
      {#each addresses as a}
        <div class="brut-card flex flex-wrap items-center gap-3 bg-white p-4">
          <span class="sticker">{a.asset}</span>
          <div class="min-w-0 flex-1">
            <p class="font-mono text-[11px] text-ink/50">{a.network} NETWORK</p>
            <p class="truncate font-mono text-sm font-bold">{a.address}</p>
          </div>
          <button onclick={() => copy(a.address)} class="btn-secondary !px-4 !py-2 !text-xs">{copied === a.address ? 'COPIED ✓' : 'COPY'}</button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="brut-card bg-white p-6">
    <h2 class="font-display font-bold tracking-widest">I SENT FUNDS — DECLARE</h2>
    {#if formError}<p class="mt-3 font-mono text-xs font-bold text-blood">!! {formError}</p>{/if}
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <label class="micro-label" for="dep-asset">ASSET</label>
        <select id="dep-asset" bind:value={asset} class="input-base mt-1 font-mono">
          {#each addresses.length ? [...new Set(addresses.map((a) => a.asset))] : ['BTC', 'ETH', 'USDC', 'SOL', 'USDT'] as s}<option value={s}>{s}</option>{/each}
        </select>
      </div>
      <div>
        <label class="micro-label" for="dep-net">NETWORK</label>
        <input id="dep-net" bind:value={network} class="input-base mt-1 font-mono" placeholder="ETH" />
      </div>
      <div>
        <label class="micro-label" for="dep-amt">AMOUNT SENT</label>
        <input id="dep-amt" type="number" min="0" step="any" bind:value={amount} class="input-base mt-1 font-mono" />
      </div>
      <div>
        <label class="micro-label" for="dep-tx">TX HASH / REF (OPTIONAL)</label>
        <input id="dep-tx" bind:value={txRef} class="input-base mt-1 font-mono" placeholder="0x…" />
      </div>
    </div>
    <button onclick={submit} disabled={busy} class="btn-acid mt-5 w-full !py-3">{busy ? 'SENDING…' : 'DECLARE DEPOSIT →'}</button>
  </div>
</div>
