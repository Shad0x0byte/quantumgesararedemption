<script lang="ts">
  import { onMount } from 'svelte';
  import { getAdminCryptoWallets, adminCryptoBalance, adminCryptoTxUpdate, getAdminCryptoTransactions } from '$lib/api/client';
  import { formatUsd, formatCrypto } from '$lib/crypto/demo';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = true;
  let wallets: any[] = [];
  let search = '';
  let busy = false;
  let msg = '';
  let msgErr = '';

  let fUserId = '';
  let fAsset = 'BTC';
  let fMode: 'set' | 'add' | 'remove' = 'add';
  let fAmount = 0;
  let fNote = '';

  let pending: any[] = [];

  async function loadWallets() {
    const res = await getAdminCryptoWallets(search || undefined);
    const d = res.data as any;
    if (res.success && d) wallets = d.wallets ?? [];
  }

  async function loadPending() {
    const res = await getAdminCryptoTransactions({ status: 'pending', limit: 50 });
    const d = res.data as any;
    if (res.success && d) pending = d.transactions ?? [];
  }

  async function reviewTx(tx: any, action: 'approve' | 'fail' | 'cancel') {
    const note = prompt(`Ops note for ${action} on ${tx.id} (optional):`) ?? '';
    busy = true;
    const res = await adminCryptoTxUpdate(tx.db_id, action, note || undefined);
    const d = res.data as any;
    busy = false;
    if (res.success) {
      toast.success(`TX ${d.new_status}. Ledger updated.`);
      await loadPending();
      await loadWallets();
    } else {
      toast.error(res.error ?? 'Update failed');
    }
  }

  async function refresh() {
    loading = true;
    await loadWallets();
    await loadPending();
    loading = false;
  }

  async function adjust() {
    msg = '';
    msgErr = '';
    if (!fUserId || fAmount < 0 || !fNote.trim()) {
      msgErr = 'User, non-negative amount and an audit note are required. Paper trails or it didn\'t happen.';
      return;
    }
    if (fMode !== 'set' && fAmount <= 0) {
      msgErr = 'Add/remove need a positive amount.';
      return;
    }
    busy = true;
    const res = await adminCryptoBalance({
      user_id: Number(fUserId),
      asset: fAsset,
      mode: fMode,
      amount: Number(fAmount),
      note: fNote.trim()
    });
    const d = res.data as any;
    busy = false;
    if (res.success) {
      msg = `${fAsset}: ${d.old_balance} → ${d.new_balance} (TX #${d.tx_id}). Audited.`;
      toast.success('Bags adjusted. Audit trail written.');
      await loadWallets();
    } else {
      msgErr = res.error ?? 'Adjustment failed.';
    }
  }

  onMount(refresh);
</script>

<svelte:head><title>Ops Desk — Admin</title></svelte:head>

<div class="space-y-6">
  <div>
    <p class="micro-label text-gold-deep">/// OPS DESK</p>
    <h1 class="font-display mt-1 text-3xl font-bold tracking-tight">GOD MODE (AUDITED)</h1>
    <p class="mt-1 font-mono text-xs text-ink/60">EVERY CLICK WRITES TO THE AUDIT TRAIL. GREAT POWER, GREAT LEDGERS.</p>
  </div>

  {#if msg}<div class="brut-flat border-ink bg-acid p-4 text-sm font-bold">WAGMI: {msg}</div>{/if}
  {#if msgErr}<div class="brut-flat border-blood bg-white p-4 text-sm font-bold text-blood">REKT: {msgErr}</div>{/if}

  <section class="brut-card bg-white p-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-display text-lg font-bold">INBOUND REVIEW QUEUE</h2>
        <p class="mt-0.5 font-mono text-xs text-ink/50">APPROVE SETTLES FUNDS · FAIL/CANCEL MOVE NOTHING</p>
      </div>
      <button class="btn-secondary !px-3 !py-2 !text-xs" onclick={loadPending}>↻</button>
    </div>
    {#if !pending.length}
      <p class="border-2 border-dashed border-ink/30 py-8 text-center font-mono text-sm text-ink/50">QUEUE CLEAR. NO APE LEFT BEHIND.</p>
    {:else}
      <div class="mt-4 space-y-2">
        {#each pending as tx}
          <div class="flex flex-col gap-3 border-2 border-ink bg-gold/20 p-4 sm:flex-row sm:items-center">
            <div class="min-w-0 flex-1">
              <p class="font-display text-sm font-bold">{tx.id} · {tx.type.toUpperCase()} {formatCrypto(tx.amount, tx.symbol)}</p>
              <p class="truncate font-mono text-xs text-ink/60">{tx.email} · {tx.network} · {tx.description}</p>
            </div>
            <div class="flex gap-2">
              <button class="border-2 border-ink bg-acid px-3 py-2 font-display text-xs font-bold hover:bg-gold" onclick={() => reviewTx(tx, 'approve')} disabled={busy}>APPROVE</button>
              <button class="border-2 border-ink bg-white px-3 py-2 font-display text-xs font-bold text-blood hover:bg-blood hover:text-white" onclick={() => reviewTx(tx, 'fail')} disabled={busy}>FAIL</button>
              <button class="border-2 border-ink bg-white px-3 py-2 font-display text-xs font-bold hover:bg-paper-dim" onclick={() => reviewTx(tx, 'cancel')} disabled={busy}>CANCEL</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="brut-card bg-white p-5">
    <h2 class="font-display text-lg font-bold">BAG ADJUSTMENT</h2>
    <p class="mt-0.5 font-mono text-xs text-ink/50">SET / ADD / REMOVE + MANDATORY NOTE. NEVER SILENT.</p>
    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label class="micro-label" for="f-user">USER ID</label>
        <input id="f-user" type="number" bind:value={fUserId} class="input-base mt-1 font-mono" placeholder="e.g. 2" />
      </div>
      <div>
        <label class="micro-label" for="f-asset">ASSET</label>
        <select id="f-asset" bind:value={fAsset} class="input-base mt-1 font-mono font-bold">
          {#each ['BTC', 'ETH', 'USDC', 'SOL', 'USDT', 'POL'] as s}<option value={s}>{s}</option>{/each}
        </select>
      </div>
      <div>
        <label class="micro-label" for="f-mode">MODE</label>
        <select id="f-mode" bind:value={fMode} class="input-base mt-1 font-mono font-bold">
          <option value="add">ADD (AIRDROP)</option>
          <option value="remove">REMOVE (REKT)</option>
          <option value="set">SET EXACT</option>
        </select>
      </div>
      <div>
        <label class="micro-label" for="f-amt">AMOUNT</label>
        <input id="f-amt" type="number" min="0" step="any" bind:value={fAmount} class="input-base mt-1 font-mono" />
      </div>
      <div class="sm:col-span-2">
        <label class="micro-label" for="f-note">OPS NOTE (AUDIT)</label>
        <input id="f-note" bind:value={fNote} class="input-base mt-1 font-mono" placeholder="e.g. correction per ticket #123" />
      </div>
    </div>
    <button class="btn-primary mt-4" onclick={adjust} disabled={busy}>{busy ? 'COMMITTING…' : '⚡ COMMIT ADJUSTMENT'}</button>
  </section>

  <section class="brut-card bg-white p-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-lg font-bold">VAULT REGISTRY</h2>
        <p class="mt-0.5 font-mono text-xs text-ink/50">EVERY WALLET, EVERY DEGEN</p>
      </div>
      <div class="flex gap-2">
        <input bind:value={search} placeholder="email / address / symbol…" class="input-base max-w-xs font-mono text-xs" />
        <button class="btn-secondary !px-3 !py-2 !text-xs" onclick={loadWallets}>HUNT</button>
      </div>
    </div>
    {#if loading}
      <div class="flex justify-center py-10"><LoadingSpinner /></div>
    {:else if !wallets.length}
      <p class="py-10 text-center font-mono text-sm text-ink/50">ZERO VAULTS. EITHER BAD SEARCH OR NGMI.</p>
    {:else}
      <div class="mt-4 overflow-x-auto">
        <table class="brut-table w-full min-w-[760px]">
          <thead>
            <tr><th>DEGEN</th><th>VAULT</th><th>ADDRESS</th><th class="text-right">STACK</th><th class="text-right">SPENDABLE</th><th class="text-right">VALUE</th><th>STATUS</th></tr>
          </thead>
          <tbody class="font-mono text-xs">
            {#each wallets as w}
              <tr>
                <td><p class="font-bold">{w.email}</p><p class="text-ink/50">#{w.user_id} · {w.user_status}</p></td>
                <td><p class="font-bold">{w.symbol}</p><p class="text-ink/50">{w.network_name}</p></td>
                <td>{w.address.slice(0, 12)}…{w.address.slice(-6)}</td>
                <td class="text-right font-bold">{formatCrypto(w.balance, w.symbol)}</td>
                <td class="text-right">{formatCrypto(w.available_balance, w.symbol)}</td>
                <td class="text-right font-bold">{formatUsd(w.value_usd)}</td>
                <td><span class="tag-mono">{w.status.toUpperCase()}</span></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>
