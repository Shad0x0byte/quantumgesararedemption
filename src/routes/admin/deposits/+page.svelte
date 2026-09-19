<script lang="ts">
  import { onMount } from 'svelte';
  import { getAdminDeposits, reviewAdminDeposit, getAdminDepositAddresses, saveAdminDepositAddress, deleteAdminDepositAddress } from '$lib/api/client';
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
      toast.success(editing ? 'Deposit address updated' : 'Deposit address saved');
      resetAddrForm();
      await loadAddrs();
    } else toast.error((res.errors?.join(', ') ?? res.error) || 'Save failed');
  }

  let editing: { asset: string; network: string } | null = null;

  function resetAddrForm() {
    aAsset = 'ETH';
    aNetwork = 'ETH';
    aAddress = '';
    aActive = true;
    editing = null;
  }

  function editAddr(a: any) {
    editing = { asset: a.asset, network: a.network };
    aAsset = a.asset;
    aNetwork = a.network;
    aAddress = a.address;
    aActive = !!a.active;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeAddr(a: any) {
    if (!confirm(`Delete the ${a.asset}/${a.network} company address? Users will no longer see it.`)) return;
    const res = await deleteAdminDepositAddress(a.asset, a.network);
    if (res.success) {
      toast.success('Address deleted');
      if (editing?.asset === a.asset && editing?.network === a.network) resetAddrForm();
      await loadAddrs();
    } else toast.error(res.error ?? 'Delete failed');
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
            <span class="border border-ink bg-gold px-1.5 py-0.5 font-bold">{a.asset}</span>
            <span class="border border-ink/40 bg-white px-1.5 py-0.5 text-ink/70">NET: {a.network}</span>
            <span class="min-w-0 flex-1 break-all">{a.address}</span>
            <span class={a.active ? 'font-bold text-up' : 'font-bold text-blood'}>{a.active ? 'LIVE' : 'OFF'}</span>
            <button onclick={() => editAddr(a)} class="border border-ink bg-white px-2 py-0.5 font-bold hover:bg-gold">EDIT</button>
            <button onclick={() => removeAddr(a)} class="border border-blood px-2 py-0.5 font-bold text-blood hover:bg-blood hover:text-white">DELETE</button>
          </div>
        {/each}
      </div>
    {/if}
    {#if editing}
      <p class="mt-3 font-mono text-xs font-bold text-gold-deep">EDITING {editing.asset}/{editing.network} — <button onclick={resetAddrForm} class="underline">cancel</button></p>
    {/if}
    <div class="mt-4 grid gap-3 md:grid-cols-4">
      <input bind:value={aAsset} list="qgr-assets" class="input-base font-mono" placeholder="ASSET e.g. ETH" />
      <input bind:value={aNetwork} list="qgr-networks" class="input-base font-mono" placeholder="NETWORK e.g. ETH" />
      <datalist id="qgr-assets">
        {#each ['BTC','ETH','USDT','USDC','SOL','BNB','XRP','DOGE','ADA','TRX','AVAX','LINK','DOT','LTC','BCH','NEAR','UNI','ATOM','XLM','ETC','POL'] as s}<option value={s}></option>{/each}
      </datalist>
      <datalist id="qgr-networks">
        {#each ['BTC','ETH','SOL','BNB','XRP','DOGE','ADA','TRX','AVAX','POL','BASE','DOT','LTC','BCH','NEAR','ATOM','XLM','ETC'] as n}<option value={n}></option>{/each}
      </datalist>
      <input bind:value={aAddress} class="input-base font-mono md:col-span-1" placeholder="Wallet address: 0x… / bc1…" />
      <label class="flex items-center gap-2 font-mono text-xs font-bold"><input type="checkbox" bind:checked={aActive} class="h-4 w-4 border-2 border-ink" /> ACTIVE</label>
    </div>
    <button onclick={saveAddr} disabled={aBusy} class="btn-primary mt-4">{aBusy ? 'SAVING…' : editing ? 'UPDATE ADDRESS →' : 'SAVE ADDRESS →'}</button>
  </div>

  <div class="brut-card bg-white p-6 text-ink">
    <div class="flex flex-wrap items-center justify-between gap-3">
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
                <input bind:value={note[d.id]} placeholder="admin note (optional)" class="input-base w-full flex-1 font-mono" />
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
