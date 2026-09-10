<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { toast } from '$lib/stores/toast';
  import { formatUsd, formatCrypto } from '$lib/crypto/demo';
  import { formatDate } from '$lib/utils/formatters';
  import {
    getAdminUserDetail,
    updateUser,
    deleteUser,
    getAdminCryptoAssets,
    getAdminCryptoTransactions,
    adminCryptoCreditUsd,
    adminCryptoBalance,
    adminCryptoTxUpdate,
  } from '$lib/api/client';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  $: userId = $page.params.id ? parseInt($page.params.id) : 0;

  let loading = true;
  let user: any = null;
  let wallets: any[] = [];
  let transactions: any[] = [];
  let portfolioTotal = 0;
  let change24h = 0;
  let priceMeta: any = null;
  let assetPrices: Record<string, number> = {};
  let assetNetworks: Record<string, string> = {};

  // FUND by USD panel
  let showFund = false;
  let fAsset = 'BTC';
  let fUsd: number = 100;
  let fNote = '';
  let funding = false;

  // ADJUST by crypto panel
  let showAdjust = false;
  let aWalletId = '';
  let aMode: 'set' | 'add' | 'remove' = 'add';
  let aAmount: number = 0;
  let aNote = '';
  let adjusting = false;

  // Edit profile
  let showEdit = false;
  let eStatus = 'active';
  let eRole = 'user';
  let eVerified = true;
  let savingEdit = false;

  async function loadAll() {
    loading = true;
    const [detail, assets] = await Promise.all([getAdminUserDetail(userId), getAdminCryptoAssets()]);
    loading = false;
    const d = detail.data as any;
    if (!detail.success || !d) {
      toast.error(detail.error || 'Failed to load holder');
      return;
    }
    user = d.user;
    wallets = d.wallets ?? [];
    transactions = d.crypto_transactions ?? [];
    portfolioTotal = Number(d.portfolio_total_usd ?? 0);
    change24h = Number(d.change_24h_pct ?? 0);
    priceMeta = d.price_meta ?? null;
    eStatus = user.status;
    eRole = user.role;
    eVerified = !!user.verified;
    const ad = assets.data as any;
    if (assets.success && ad?.assets) {
      for (const a of ad.assets) {
        if (a.status !== 'active') continue;
        const key = assetPrices[a.symbol] === undefined ? a.symbol : `${a.symbol}@${a.network_symbol}`;
        assetPrices[key] = Number(a.price_usd);
        assetNetworks[key] = a.network_symbol;
      }
      if (!assetPrices[fAsset] && Object.keys(assetPrices).length) fAsset = Object.keys(assetPrices)[0];
    }
  }

  onMount(loadAll);

  $: fundPrice = assetPrices[fAsset] ?? 0;
  $: fundCrypto = fundPrice > 0 && fUsd > 0 ? fUsd / fundPrice : 0;
  $: activeWallet = wallets.find((w) => String(w.id) === aWalletId);
  $: pendingTx = transactions.filter((t) => t.status === 'pending' || t.status === 'processing');

  async function doFund() {
    if (!fUsd || fUsd <= 0) {
      toast.error('Enter a positive USD amount');
      return;
    }
    if (!fNote.trim()) {
      toast.error('An ops note is required for audit');
      return;
    }
    funding = true;
    const res = await adminCryptoCreditUsd({ user_id: userId, asset: fAsset.split('@')[0], usd_amount: fUsd, note: fNote.trim() });
    const d = res.data as any;
    funding = false;
    if (res.success) {
      toast.success(`Funded ${formatCrypto(d.crypto_amount, d.symbol)} ($${d.usd_amount})`);
      showFund = false;
      fUsd = 100;
      fNote = '';
      await loadAll();
    } else toast.error(res.error || 'Funding failed');
  }

  async function doAdjust() {
    if (!activeWallet) {
      toast.error('Pick a vault first');
      return;
    }
    if (aMode !== 'set' && (!aAmount || aAmount <= 0)) {
      toast.error('Enter a positive amount');
      return;
    }
    if (aMode === 'set' && (aAmount === null || aAmount === undefined || aAmount < 0)) {
      toast.error('Enter the target balance');
      return;
    }
    if (!aNote.trim()) {
      toast.error('An ops note is required for audit');
      return;
    }
    adjusting = true;
    const res = await adminCryptoBalance({
      user_id: userId,
      asset: activeWallet.symbol,
      network: activeWallet.network_symbol,
      mode: aMode,
      amount: Number(aAmount),
      note: aNote.trim(),
    });
    const d = res.data as any;
    adjusting = false;
    if (res.success) {
      toast.success(`${d.symbol}: ${d.old_balance} → ${d.new_balance}`);
      showAdjust = false;
      aAmount = 0;
      aNote = '';
      await loadAll();
    } else toast.error(res.error || 'Adjustment failed');
  }

  async function reviewTx(tx: any, action: 'approve' | 'fail' | 'cancel') {
    const res = await adminCryptoTxUpdate(tx.db_id, action, `ops review on holder page`);
    const d = res.data as any;
    if (res.success) {
      toast.success(`TX ${d.new_status}`);
      await loadAll();
    } else toast.error(res.error || 'Update failed');
  }

  async function toggleStatus() {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'SUSPEND — trading blocked server-side' : 'UNSUSPEND — trading restored';
    if (newStatus === 'suspended' && !confirm(`${user.email} will be locked out of sends, swaps, buys and sells. Continue?`)) return;
    const res = await updateUser(userId, { status: newStatus });
    if (res.success) {
      user.status = newStatus;
      toast.success(action);
    } else toast.error('Failed to update status');
  }

  async function saveEdit() {
    savingEdit = true;
    const res = await updateUser(userId, { status: eStatus, role: eRole, verified: eVerified });
    savingEdit = false;
    if (res.success) {
      user.status = eStatus;
      user.role = eRole;
      user.verified = eVerified;
      showEdit = false;
      toast.success('Holder updated');
    } else toast.error('Update failed');
  }

  async function removeUser() {
    if (!confirm(`Nuke ${user.email}? Wallets, ledger and audit stay; the login dies. Irreversible.`)) return;
    const res = await deleteUser(userId);
    if (res.success) {
      toast.success('Holder deleted');
      goto('/admin/users');
    } else toast.error(res.error || 'Delete failed');
  }

  function statusTag(s: string) {
    return s === 'active'
      ? 'border-ink bg-acid text-ink'
      : s === 'suspended'
        ? 'border-ink bg-blood text-white'
        : 'border-ink bg-gold text-ink';
  }

  const glyph = (t: any) =>
    t.type === 'received' ? '↓' : t.type === 'sent' ? '↑' : t.type === 'swap' ? '⇄' : t.type === 'buy' ? '+' : t.type === 'sell' ? '−' : '•';
</script>

<svelte:head><title>Holder #{userId} — QGR Control Room</title></svelte:head>

{#if loading}
  <div class="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>
{:else if !user}
  <div class="py-24 text-center">
    <p class="font-display text-xl font-bold">HOLDER NOT FOUND.</p>
    <a href="/admin/users" class="mt-4 inline-block font-display text-sm font-bold underline decoration-gold decoration-2 underline-offset-4">← BACK TO HOLDERS</a>
  </div>
{:else}
  <div class="space-y-6">
    <!-- HEADER -->
    <div>
      <a href="/admin/users" class="font-mono text-xs text-ink/50 hover:bg-acid">← ALL HOLDERS</a>
      <div class="mt-2 flex flex-wrap items-center gap-3">
        <h1 class="font-display text-3xl font-bold tracking-tight">{user.first_name} {user.last_name}</h1>
        <span class="border-2 px-2 py-1 font-display text-[11px] font-bold tracking-widest uppercase {statusTag(user.status)}">{user.status}</span>
        <span class="tag-mono">#{user.id} · {user.role.toUpperCase()}</span>
      </div>
      <p class="mt-1 font-mono text-xs text-ink/50">{user.email} · {user.phone || 'no phone'} · since {formatDate(user.created_at)}</p>
    </div>

    <!-- PORTFOLIO HERO -->
    <section class="brut-card-navy p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="micro-label text-gold">HOLDER STACK</p>
          <p class="font-display mt-2 text-4xl font-bold sm:text-5xl">{formatUsd(portfolioTotal)}</p>
          <p class="mt-1 font-mono text-sm font-bold {change24h >= 0 ? 'text-acid' : 'text-blood'}">
            {change24h >= 0 ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}% / 24H
            {#if priceMeta}<span class="ml-2 font-normal text-white/50">· {priceMeta.mode === 'live' ? '● LIVE' : `CACHED ${priceMeta.age_seconds ?? '?'}S`}</span>{/if}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <button class="btn-acid !px-4 !py-2 !text-xs" onclick={() => ((showFund = !showFund), (showAdjust = false))}>$ FUND BY USD</button>
          <button class="btn-primary !px-4 !py-2 !text-xs" onclick={() => ((showAdjust = !showAdjust), (showFund = false))}>⇄ ADJUST CRYPTO</button>
          <button class="btn-secondary !px-4 !py-2 !text-xs !border-gold !bg-transparent !text-gold" onclick={loadAll}>↻ REFRESH</button>
        </div>
      </div>
    </section>

    <!-- FUND BY USD -->
    {#if showFund}
      <section class="brut-card border-acid bg-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-display text-lg font-bold">FUND VAULT BY USD VALUE</h2>
            <p class="mt-0.5 font-mono text-xs text-ink/50">YOU TYPE DOLLARS · COINGECKO DOES THE MATH · NO FEE</p>
          </div>
          <button class="border-2 border-ink bg-paper px-2 font-bold hover:bg-blood hover:text-white" onclick={() => (showFund = false)}>✕</button>
        </div>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="micro-label" for="fund-asset">ASSET</label>
            <select id="fund-asset" bind:value={fAsset} class="input-base mt-1 font-mono font-bold">
              {#each Object.keys(assetPrices) as sym}<option value={sym}>{sym}{assetNetworks[sym] ? ` · ${assetNetworks[sym]}` : ''}</option>{/each}
            </select>
            <p class="mt-1 font-mono text-[11px] text-ink/50">LIVE @ {fundPrice ? formatUsd(fundPrice, fundPrice < 10 ? 4 : 2) : '—'}</p>
          </div>
          <div>
            <label class="micro-label" for="fund-usd">USD VALUE *</label>
            <input id="fund-usd" type="number" min="0" step="any" bind:value={fUsd} class="input-base mt-1 font-mono" placeholder="100.00" />
          </div>
        </div>
        <div class="mt-4 border-2 border-ink bg-paper p-4 font-mono text-sm">
          <div class="flex justify-between"><span class="text-ink/50">THEY RECEIVE ≈</span><span class="font-display text-xl font-bold">{fundCrypto ? formatCrypto(fundCrypto, fAsset.split('@')[0]) : '—'}</span></div>
          <div class="mt-1 flex justify-between text-xs"><span class="text-ink/50">RATE SOURCE</span><span class="font-bold">COINGECKO LIVE · FEE $0.00</span></div>
        </div>
        <div class="mt-4">
          <label class="micro-label" for="fund-note">OPS NOTE (AUDIT) *</label>
          <input id="fund-note" bind:value={fNote} class="input-base mt-1 font-mono" placeholder="e.g. manual top-up per ticket #123" />
        </div>
        <button class="btn-acid mt-4 w-full" onclick={doFund} disabled={funding}>{funding ? 'POSTING…' : `⚡ POST ${fundCrypto ? formatCrypto(fundCrypto, fAsset.split('@')[0]) : ''}`}</button>
      </section>
    {/if}

    <!-- ADJUST BY CRYPTO -->
    {#if showAdjust}
      <section class="brut-card bg-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-display text-lg font-bold">ADJUST VAULT (CRYPTO UNITS)</h2>
            <p class="mt-0.5 font-mono text-xs text-ink/50">SET EXACT / ADD / REMOVE · EVERYTHING AUDITED</p>
          </div>
          <button class="border-2 border-ink bg-paper px-2 font-bold hover:bg-blood hover:text-white" onclick={() => (showAdjust = false)}>✕</button>
        </div>
        {#if !wallets.length}
          <p class="mt-4 border-2 border-dashed border-ink/30 p-6 text-center font-mono text-xs text-ink/50">NO VAULTS YET — FUND BY USD ABOVE TO MINT THE FIRST ONE.</p>
        {:else}
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="micro-label" for="adj-wallet">VAULT</label>
              <select id="adj-wallet" bind:value={aWalletId} class="input-base mt-1 font-mono font-bold">
                <option value="">— pick —</option>
                {#each wallets as w}<option value={String(w.id)}>{w.symbol} · {formatCrypto(w.balance, w.symbol)} ({formatUsd(w.value_usd)})</option>{/each}
              </select>
              {#if activeWallet}<p class="mt-1 font-mono text-[11px] text-ink/50">CURRENT {formatCrypto(activeWallet.balance, activeWallet.symbol)} · {activeWallet.network}</p>{/if}
            </div>
            <div>
              <label class="micro-label" for="adj-mode">MODE</label>
              <select id="adj-mode" bind:value={aMode} class="input-base mt-1 font-mono font-bold">
                <option value="add">ADD</option>
                <option value="remove">REMOVE</option>
                <option value="set">SET EXACT</option>
              </select>
            </div>
            <div>
              <label class="micro-label" for="adj-amt">AMOUNT ({aMode === 'set' ? 'TARGET' : 'DELTA'}) *</label>
              <input id="adj-amt" type="number" min="0" step="any" bind:value={aAmount} class="input-base mt-1 font-mono" />
            </div>
            <div>
              <label class="micro-label" for="adj-note">OPS NOTE (AUDIT) *</label>
              <input id="adj-note" bind:value={aNote} class="input-base mt-1 font-mono" placeholder="e.g. correction" />
            </div>
          </div>
          <button class="btn-primary mt-4 w-full" onclick={doAdjust} disabled={adjusting}>{adjusting ? 'COMMITTING…' : '⚡ COMMIT ADJUSTMENT'}</button>
        {/if}
      </section>
    {/if}

    <!-- VAULTS -->
    <section class="brut-card bg-white p-5 sm:p-6">
      <h2 class="font-display text-lg font-bold">VAULTS <span class="font-mono text-xs font-normal text-ink/50">({wallets.length})</span></h2>
      {#if !wallets.length}
        <p class="mt-3 border-2 border-dashed border-ink/30 p-6 text-center font-mono text-xs text-ink/50">EMPTY — FUND THIS HOLDER TO OPEN VAULTS.</p>
      {:else}
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          {#each wallets as w}
            <div class="brut-flat p-4">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center border-2 border-ink bg-gold font-display font-bold">{w.icon}</div>
                  <div>
                    <p class="font-display text-sm font-bold">{w.symbol}</p>
                    <p class="font-mono text-[11px] text-ink/50">{w.network}</p>
                  </div>
                </div>
                <span class="tag-mono">{w.status.toUpperCase()}</span>
              </div>
              <p class="font-display mt-3 text-xl font-bold">{formatCrypto(w.balance, w.symbol)}</p>
              <p class="font-mono text-xs font-bold">{formatUsd(w.value_usd)} · SPENDABLE {formatCrypto(w.available_balance ?? w.balance, w.symbol)}</p>
              {#if (w.locked_balance ?? 0) > 0}<p class="font-mono text-[11px] text-blood">LOCKED {formatCrypto(w.locked_balance, w.symbol)}</p>{/if}
              <p class="mt-2 border border-ink/20 bg-paper p-2 font-mono text-[11px] break-all">{w.address}</p>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- PENDING REVIEW -->
    {#if pendingTx.length}
      <section class="brut-card border-blood bg-white p-5 sm:p-6">
        <h2 class="font-display text-lg font-bold">⚠ AWAITING OPS ({pendingTx.length})</h2>
        <div class="mt-4 space-y-2">
          {#each pendingTx as tx}
            <div class="flex flex-col gap-3 border-2 border-ink bg-gold/20 p-4 sm:flex-row sm:items-center">
              <div class="min-w-0 flex-1">
                <p class="font-display text-sm font-bold">{tx.id} · {tx.type.toUpperCase()} {formatCrypto(tx.amount, tx.symbol)}</p>
                <p class="truncate font-mono text-xs text-ink/60">{tx.network} · {tx.description}</p>
              </div>
              <div class="flex gap-2">
                <button class="border-2 border-ink bg-acid px-3 py-2 font-display text-xs font-bold hover:bg-gold" onclick={() => reviewTx(tx, 'approve')}>APPROVE</button>
                <button class="border-2 border-ink bg-white px-3 py-2 font-display text-xs font-bold text-blood hover:bg-blood hover:text-white" onclick={() => reviewTx(tx, 'fail')}>FAIL</button>
                <button class="border-2 border-ink bg-white px-3 py-2 font-display text-xs font-bold hover:bg-paper-dim" onclick={() => reviewTx(tx, 'cancel')}>CANCEL</button>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- ACTIVITY -->
    <section class="brut-card overflow-hidden bg-white">
      <div class="flex items-center justify-between border-b-2 border-ink px-5 py-4">
        <h2 class="font-display text-lg font-bold">ONCHAIN ACTIVITY</h2>
        <span class="font-mono text-xs text-ink/50">LAST {transactions.length}</span>
      </div>
      {#if !transactions.length}
        <p class="p-8 text-center font-mono text-xs text-ink/50">SILENT — NO MOVEMENTS YET.</p>
      {:else}
        <div class="overflow-x-auto">
          <table class="brut-table w-full min-w-[680px]">
            <thead><tr><th>MOVE</th><th>TYPE</th><th>WHEN</th><th class="text-right">AMOUNT</th><th class="text-right">VALUE</th><th>STATUS</th></tr></thead>
            <tbody class="font-mono text-xs">
              {#each transactions as tx}
                <tr>
                  <td><p class="font-display text-[13px] font-bold">{tx.description}</p><p class="text-ink/50">{tx.network}{tx.tx_hash ? ` · ${tx.tx_hash.slice(0, 10)}…` : ''}</p></td>
                  <td><span class="tag-mono">{tx.type.toUpperCase()}</span></td>
                  <td class="text-ink/50">{formatDate(tx.created_at)}</td>
                  <td class="text-right font-bold {tx.amount >= 0 ? 'text-up' : ''}">{tx.amount >= 0 ? '+' : ''}{formatCrypto(tx.amount, tx.symbol)}</td>
                  <td class="text-right">{formatUsd(tx.value_usd ?? 0)}</td>
                  <td><span class="tag-mono">{tx.status.toUpperCase()}</span></td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>

    <!-- ACCOUNT -->
    <section class="brut-card bg-white p-5 sm:p-6">
      <h2 class="font-display text-lg font-bold">HOLDER FILE</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="border-2 border-ink bg-paper p-3"><p class="micro-label !text-[9px] text-ink/50">EMAIL</p><p class="mt-1 truncate font-mono text-xs font-bold">{user.email}</p></div>
        <div class="border-2 border-ink bg-paper p-3"><p class="micro-label !text-[9px] text-ink/50">PHONE</p><p class="mt-1 font-mono text-xs font-bold">{user.phone || '—'}</p></div>
        <div class="border-2 border-ink bg-paper p-3"><p class="micro-label !text-[9px] text-ink/50">ROLE</p><p class="mt-1 font-mono text-xs font-bold">{user.role.toUpperCase()} · {user.verified ? 'VERIFIED' : 'UNVERIFIED'}</p></div>
        <div class="border-2 border-ink bg-paper p-3"><p class="micro-label !text-[9px] text-ink/50">LAST LOGIN</p><p class="mt-1 font-mono text-xs font-bold">{user.last_login ? formatDate(user.last_login) : 'NEVER'}</p></div>
      </div>

      {#if showEdit}
        <div class="mt-4 grid gap-3 border-2 border-ink bg-paper p-4 sm:grid-cols-3">
          <div>
            <label class="micro-label" for="e-status">STATUS</label>
            <select id="e-status" bind:value={eStatus} class="input-base mt-1 font-mono font-bold">
              <option value="active">ACTIVE</option>
              <option value="pending">PENDING</option>
              <option value="suspended">SUSPENDED</option>
            </select>
          </div>
          <div>
            <label class="micro-label" for="e-role">ROLE</label>
            <select id="e-role" bind:value={eRole} class="input-base mt-1 font-mono font-bold">
              <option value="user">HOLDER</option>
              <option value="admin">OPERATOR</option>
            </select>
          </div>
          <div>
            <label class="micro-label" for="e-ver">VERIFIED</label>
            <select id="e-ver" bind:value={eVerified} class="input-base mt-1 font-mono font-bold">
              <option value={true}>YES</option>
              <option value={false}>NO</option>
            </select>
          </div>
          <div class="flex gap-2 sm:col-span-3">
            <button class="btn-primary flex-1" onclick={saveEdit} disabled={savingEdit}>{savingEdit ? 'SAVING…' : 'SAVE FILE'}</button>
            <button class="btn-secondary flex-1" onclick={() => (showEdit = false)}>CANCEL</button>
          </div>
        </div>
      {/if}

      <div class="mt-4 flex flex-wrap gap-2">
        <button class="btn-secondary !px-4 !py-2 !text-xs" onclick={() => (showEdit = !showEdit)}>✎ EDIT FILE</button>
        <button
          class="border-2 border-ink px-4 py-2 font-display text-xs font-bold {user.status === 'active' ? 'bg-blood text-white' : 'bg-acid text-ink'}"
          style="box-shadow: 4px 4px 0 #0b132b;"
          onclick={toggleStatus}
        >
          {user.status === 'active' ? '⛔ SUSPEND (BLOCK TRADING)' : '✅ UNSUSPEND (RESTORE TRADING)'}
        </button>
        <button class="btn-secondary !px-4 !py-2 !text-xs hover:!bg-blood hover:!text-white" onclick={removeUser}>NUKE HOLDER</button>
      </div>
    </section>
  </div>
{/if}
