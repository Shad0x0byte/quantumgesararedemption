<script lang="ts">
  import { onMount } from 'svelte';
  import { getAdminDeposits, reviewAdminDeposit, getAdminDepositAddresses, saveAdminDepositAddress } from '$lib/api/client';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let qLoading = true;
  let queue: any[] = [];
  let qStatus = 'pending';
  let note: Record<number, string> = {};
  let busy = 0;

  let addrs: any[] = [];
  let aAsset = 'ETH';
  let aNetwork = 'ETH';
  let aAddress = '';
  let aActive = true;
  let aBusy = false;

  async function loadQueue() {
    qLoading = true;
    const res = await getAdminDeposits(qStatus);
    qLoading = false;
    if (res.success) queue = (res.data as any)?.deposits ?? [];
    else toast.error(res.error ?? 'Queue failed');
  }
  async function loadAddrs() {
    const res = await getAdminDepositAddresses();
    if (res.success) addrs = (res.data as any)?.addresses ?? [];
  }
  onMount(async () => {
    await Promise.all([loadQueue(), loadAddrs()]);
  });

  async function review(id: number, action: 'approve' | 'reject') {
    busy = id;
    const res = await reviewAdminDeposit(id, action, note[id] ?? '');
    busy = 0;
    if (res.success) {
      toast.success(action === 'approve' ? 'Approved + credited' : 'Rejected');
      await loadQueue();
    } else toast.error(res.error ?? 'Review failed');
  }

  async function saveAddr() {
    if (!aAsset || !aNetwork || (aActive && !aAddress.trim())) {
      toast.error('Asset + network + address required');
      return;
    }
    aBusy = true;
    const res = await saveAdminDepositAddress({ asset: aAsset, network: aNetwork, address: aAddress.trim(), active: aActive ? 1 : 0 });
    aBusy = false;
    if (res.success) {
      toast.success('Deposit address saved');
      aAddress = '';
      await loadAddrs();
    } else toast.error((res.errors?.join(', ') ?? res.error) || 'Save failed');
  }
</script>

<svelte:head><title>Deposits — QGR Ops</title></svelte:head>

<div class="space-y-8">
  <div>
    <span class="sticker-blood">OPS</span>
    <h1 class="font-display mt-2 text-3xl font-bold tracking-tight">DEPOSIT DESK</h1>
    <p class="mt-1 font-mono text-xs text-white/60">SET COMPANY ADDRESSES · REVIEW QUEUE · APPROVE = PORTFOLIO CREDITED VIA LEDGER.</p>
  </div>

  <div class="brut-card bg-white p-6 text-ink">
    <h2 class="font-display font-bold tracking-widest">COMPANY ADDRESSES (USERS COPY THESE)</h2>
    {#if addrs.length}
      <div class="mt-3 space-y-2">
        {#each addrs as a}
          <div class="flex flex-wrap items-center gap-2 border-2 border-ink bg-paper p-2 font-mono text-xs">
            <span class="font-bold">{a.asset}/{a.network}</span>
            <span class="min-w-0 flex-1 truncate">{a.address}</span>
            <span class={a.active ? 'font-bold text-up' : 'font-bold text-blood'}>{a.active ? 'LIVE' : 'OFF'}</span>
          </div>
        {/each}
      </div>
    {/if}
    <div class="mt-4 grid gap-3 md:grid-cols-4">
      <input bind:value={aAsset} class="input-base font-mono" placeholder="ASSET e.g. ETH" />
      <input bind:value={aNetwork} class="input-base font-mono" placeholder="NETWORK e.g. ETH" />
      <input bind:value={aAddress} class="input-base font-mono md:col-span-1" placeholder="0x… / bc1…" />
      <label class="flex items-center gap-2 font-mono text-xs font-bold"><input type="checkbox" bind:checked={aActive} class="h-4 w-4 border-2 border-ink" /> ACTIVE</label>
    </div>
    <button onclick={saveAddr} disabled={aBusy} class="btn-primary mt-4">{aBusy ? 'SAVING…' : 'SAVE ADDRESS →'}</button>
  </div>

  <div class="brut-card bg-white p-6 text-ink">
    <div class="flex items-center justify-between">
      <h2 class="font-display font-bold tracking-widest">REVIEW QUEUE</h2>
      <select bind:value={qStatus} onchange={loadQueue} class="input-base max-w-40 font-mono">
        <option value="pending">PENDING</option>
        <option value="completed">APPROVED</option>
        <option value="failed">REJECTED</option>
      </select>
    </div>
    {#if qLoading}
      <div class="flex justify-center py-10"><LoadingSpinner /></div>
    {:else if !queue.length}
      <p class="mt-4 font-mono text-sm">Queue empty.</p>
    {:else}
      <div class="mt-4 space-y-3">
        {#each queue as d}
          <div class="border-2 border-ink bg-paper p-3 font-mono text-xs">
            <p><span class="font-bold">#{d.id}</span> {d.email} — <span class="font-bold">{d.amount} {d.asset}</span> ({d.network || '—'}) · REF {d.tx_ref || '—'} · {d.created_at}</p>
            {#if d.status === 'pending'}
              <div class="mt-2 flex flex-wrap gap-2">
                <input bind:value={note[d.id]} placeholder="ops note (optional)" class="input-base flex-1 font-mono" />
                <button onclick={() => review(d.id, 'approve')} disabled={busy === d.id} class="btn-acid !px-4 !py-2 !text-xs">APPROVE + CREDIT</button>
                <button onclick={() => review(d.id, 'reject')} disabled={busy === d.id} class="btn-secondary !px-4 !py-2 !text-xs !border-blood !text-blood">REJECT</button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
