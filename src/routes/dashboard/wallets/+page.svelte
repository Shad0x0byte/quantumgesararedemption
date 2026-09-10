<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';
  import { getCryptoWallets, depositFunds, sendCrypto, transferCrypto } from '$lib/api/client';
  import { formatUsd, formatCrypto } from '$lib/crypto/demo';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { CryptoWallet } from '$lib/types';

  let loading = true;
  let loadError = '';
  let wallets: CryptoWallet[] = [];
  let selectedNetwork = 'ALL CHAINS';
  let priceMeta: any = null;

  let modal: null | 'receive' | 'send' | 'transfer' = null;
  let active: CryptoWallet | null = null;
  let qrSrc = '';
  let copied = false;

  let depositAmount = 100;
  let sendAddress = '';
  let sendAmount = 0;
  let sendReview: any = null;
  let transferEmail = '';
  let transferAmount = 0;
  let busy = false;
  let formError = '';
  let formOk = '';

  $: networks = ['ALL CHAINS', ...Array.from(new Set(wallets.map((w) => w.network)))];
  $: filtered = selectedNetwork === 'ALL CHAINS' ? wallets : wallets.filter((w) => w.network === selectedNetwork);

  const shorten = (a: string) => (a.length > 22 ? `${a.slice(0, 10)}...${a.slice(-8)}` : a);

  async function refresh() {
    const res = await getCryptoWallets();
    const d = res.data as any;
    if (res.success && d?.wallets?.length) {
      wallets = d.wallets;
      priceMeta = d.price_meta ?? null;
      loadError = '';
    } else if (!wallets.length) {
      loadError = res.error ?? 'Vault unreachable.';
    }
  }

  function open(kind: 'receive' | 'send' | 'transfer', w: CryptoWallet) {
    modal = kind;
    active = w;
    formError = '';
    formOk = '';
    sendReview = null;
    copied = false;
    if (kind === 'receive') makeQr(w.address);
  }

  function close() {
    modal = null;
    active = null;
    qrSrc = '';
    sendAddress = '';
    sendAmount = 0;
    transferEmail = '';
    transferAmount = 0;
    depositAmount = 100;
  }

  async function makeQr(text: string) {
    try {
      qrSrc = await QRCode.toDataURL(text, { margin: 1, width: 220 });
    } catch {
      qrSrc = '';
    }
  }

  async function copyAddress() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.address);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      formError = 'Copy failed — select the address manually.';
    }
  }

  async function doDeposit() {
    if (!active || depositAmount <= 0) {
      formError = 'Enter a positive amount.';
      return;
    }
    busy = true;
    formError = '';
    const res = await depositFunds(active.symbol, depositAmount);
    busy = false;
    if (res.success) {
      formOk = `Deposited ${formatCrypto(depositAmount, active.symbol)} into the vault.`;
      await refresh();
      active = wallets.find((w) => w.symbol === active!.symbol) ?? active;
      toast.success('Deposit confirmed');
    } else {
      formError = res.error ?? 'Deposit failed.';
    }
  }

  function reviewSend() {
    if (!active) return;
    if (sendAddress.trim().length < 10) {
      formError = 'Enter a valid destination address.';
      return;
    }
    if (sendAmount <= 0) {
      formError = 'Enter a positive amount.';
      return;
    }
    const avail = active.available_balance ?? active.balance;
    if (sendAmount > avail) {
      formError = `Amount exceeds available ${formatCrypto(avail, active.symbol)}. No leverage here.`;
      return;
    }
    formError = '';
    const feeUsd = sendAmount * (active.price_usd ?? 0) * 0.0035;
    const feeAsset = (active.price_usd ?? 0) > 0 ? feeUsd / (active.price_usd ?? 1) : 0;
    sendReview = { feeAsset, feeUsd, total: sendAmount + feeAsset };
  }

  async function doSend() {
    if (!active || !sendReview) return;
    busy = true;
    formError = '';
    const res = await sendCrypto(active.symbol, sendAddress.trim(), sendAmount);
    const d = res.data as any;
    busy = false;
    if (res.success) {
      formOk = `Yeeted ${formatCrypto(sendAmount, active.symbol)}. Fee ${formatCrypto(d.fee_amount ?? 0, active.symbol)} — total debit ${formatCrypto(d.total_debit ?? sendAmount, active.symbol)}.`;
      sendReview = null;
      await refresh();
      active = wallets.find((w) => w.symbol === active!.symbol) ?? active;
      toast.success('Send settled');
    } else {
      formError = res.error ?? 'Send failed.';
    }
  }

  async function doTransfer() {
    if (!active) return;
    if (!transferEmail.includes('@')) {
      formError = 'Enter a valid recipient email.';
      return;
    }
    if (transferAmount <= 0) {
      formError = 'Enter a positive amount.';
      return;
    }
    busy = true;
    formError = '';
    const res = await transferCrypto(active.symbol, transferEmail.trim(), transferAmount);
    busy = false;
    if (res.success) {
      formOk = `Beamed ${formatCrypto(transferAmount, active.symbol)} to ${transferEmail}. Both ledgers updated.`;
      await refresh();
      active = wallets.find((w) => w.symbol === active!.symbol) ?? active;
      toast.success('Transfer settled');
    } else {
      formError = res.error ?? 'Transfer failed.';
    }
  }

  onMount(async () => {
    await refresh();
    loading = false;
  });
</script>

<svelte:head><title>Vault — QGR Exchange</title></svelte:head>

{#if loading}
  <div class="flex items-center justify-center py-32"><LoadingSpinner size="lg" /></div>
{:else if loadError && !wallets.length}
  <div class="brut-flat border-blood bg-white p-8 text-center font-bold text-blood">{loadError}</div>
{:else}
  <div class="fade-in space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="micro-label text-gold-deep">/// VAULT</p>
        <h1 class="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">YOUR KEYS, YOUR COINS*</h1>
        <p class="mt-1 font-mono text-xs text-ink/60">*SELF-CUSTODY VIEW. {priceMeta ? (priceMeta.mode === 'live' ? '● LIVE PRICES' : `CACHED ${priceMeta.age_seconds ?? '?'}S`) : ''}</p>
      </div>
      <button class="btn-secondary" onclick={refresh}>↻ REFRESH</button>
    </div>

    <div class="flex flex-wrap gap-2">
      {#each networks as network}
        <button
          class="border-2 border-ink px-3 py-2 font-display text-xs font-bold tracking-widest {selectedNetwork === network ? 'bg-ink text-gold' : 'bg-white hover:bg-acid'}"
          onclick={() => (selectedNetwork = network)}>{network.toUpperCase()}</button>
      {/each}
    </div>

    {#if !filtered.length}
      <div class="brut-card bg-white p-10 text-center font-bold">No vaults on this chain. Touch grass, try another.</div>
    {/if}

    <div class="grid gap-5 md:grid-cols-2">
      {#each filtered as wallet}
        <article class="brut-card bg-white p-5 sm:p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center border-2 border-ink bg-gold font-display font-bold">{wallet.icon}</div>
              <div>
                <h2 class="font-display text-sm font-bold">{wallet.name.toUpperCase()}</h2>
                <p class="font-mono text-xs text-ink/50">{wallet.network}</p>
              </div>
            </div>
            <span class="tag-mono">{wallet.status.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="mt-5 border-2 border-ink bg-paper p-4">
            <p class="micro-label text-ink/50">STACK</p>
            <p class="font-display mt-1 text-2xl font-bold">{formatCrypto(wallet.balance, wallet.symbol)}</p>
            <p class="mt-1 font-mono text-sm font-bold">{formatUsd(wallet.value_usd)}</p>
            <p class="mt-1 font-mono text-[11px] text-ink/50">SPENDABLE {formatCrypto(wallet.available_balance ?? wallet.balance, wallet.symbol)}{#if (wallet.locked_balance ?? 0) > 0} · LOCKED {formatCrypto(wallet.locked_balance ?? 0, wallet.symbol)}{/if}</p>
          </div>
          <div class="mt-3 border border-ink/30 bg-white p-3">
            <p class="micro-label !text-[9px] text-ink/40">DEPOSIT ADDRESS</p>
            <p class="mt-1 font-mono text-xs break-all">{shorten(wallet.address)}</p>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="btn-secondary flex-1 !px-2" onclick={() => open('receive', wallet)}>↓ RECEIVE</button>
            <button class="btn-secondary flex-1 !px-2" onclick={() => open('send', wallet)}>↑ SEND</button>
            <button class="btn-primary flex-1 !px-2" onclick={() => open('transfer', wallet)}>⇄ BEAM</button>
          </div>
        </article>
      {/each}
    </div>
  </div>
{/if}

{#if modal && active}
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center" role="dialog" aria-modal="true">
    <div class="brut-card w-full max-w-md bg-white p-6">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-lg font-bold">
          {modal === 'receive' ? `RECEIVE ${active.symbol}` : modal === 'send' ? `SEND ${active.symbol}` : `BEAM ${active.symbol}`}
        </h2>
        <button class="border-2 border-ink bg-paper px-2 font-bold hover:bg-blood hover:text-white" onclick={close}>✕</button>
      </div>
      <p class="mt-1 font-mono text-xs text-ink/50">{active.network} · SPENDABLE {formatCrypto(active.available_balance ?? active.balance, active.symbol)}</p>

      {#if formError}<div class="brut-flat mt-4 border-blood bg-white p-3 text-sm font-bold text-blood">REKT: {formError}</div>{/if}
      {#if formOk}<div class="brut-flat mt-4 border-ink bg-acid p-3 text-sm font-bold">WAGMI: {formOk}</div>{/if}

      {#if modal === 'receive'}
        <div class="mt-4 flex flex-col items-center">
          {#if qrSrc}<img src={qrSrc} alt="Deposit address QR" class="h-44 w-44 border-2 border-ink" />{:else}<p class="font-mono text-xs">QR unavailable</p>{/if}
          <p class="mt-3 w-full border-2 border-ink bg-paper p-3 text-center font-mono text-xs break-all">{active.address}</p>
          <button class="btn-secondary mt-3 w-full" onclick={copyAddress}>{copied ? 'COPIED ✓' : 'COPY ADDRESS'}</button>
        </div>
        <div class="mt-5 border-t-2 border-ink pt-4">
          <p class="micro-label">DEPOSIT // INSTANT</p>
          <div class="mt-2 flex gap-2">
            <input type="number" min="0" step="any" bind:value={depositAmount} class="input-base flex-1 font-mono" placeholder="Amount" />
            <button class="btn-acid" onclick={doDeposit} disabled={busy}>{busy ? '…' : 'DEPOSIT'}</button>
          </div>
          <p class="mt-2 font-mono text-[11px] text-ink/50">Funds credit the moment you confirm.</p>
        </div>
      {/if}

      {#if modal === 'send'}
        {#if !sendReview}
          <div class="mt-4 space-y-3">
            <div>
              <label class="micro-label" for="send-addr">DESTINATION</label>
              <input id="send-addr" bind:value={sendAddress} class="input-base mt-1 font-mono" placeholder="0x… / bc1q… / …" />
            </div>
            <div>
              <label class="micro-label" for="send-amt">AMOUNT ({active.symbol})</label>
              <input id="send-amt" type="number" min="0" step="any" bind:value={sendAmount} class="input-base mt-1 font-mono" />
            </div>
            <button class="btn-primary w-full" onclick={reviewSend}>REVIEW YEET</button>
          </div>
        {:else}
          <div class="mt-4 space-y-2 border-2 border-ink bg-paper p-4 font-mono text-sm">
            <div class="flex justify-between gap-2"><span class="text-ink/50">TO</span><span class="max-w-[220px] truncate text-xs">{sendAddress}</span></div>
            <div class="flex justify-between"><span class="text-ink/50">AMOUNT</span><span class="font-bold">{formatCrypto(sendAmount, active.symbol)}</span></div>
            <div class="flex justify-between"><span class="text-ink/50">FEE ~</span><span class="font-bold">{formatCrypto(sendReview.feeAsset, active.symbol)} ({formatUsd(sendReview.feeUsd)})</span></div>
            <div class="flex justify-between border-t-2 border-ink pt-2"><span class="text-ink/50">TOTAL DEBIT</span><span class="font-bold">{formatCrypto(sendReview.total, active.symbol)}</span></div>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="btn-secondary flex-1" onclick={() => (sendReview = null)}>BACK</button>
            <button class="btn-acid flex-1" onclick={doSend} disabled={busy}>{busy ? 'YEETING…' : 'CONFIRM YEET'}</button>
          </div>
        {/if}
      {/if}

      {#if modal === 'transfer'}
        <div class="mt-4 space-y-3">
          <div>
            <label class="micro-label" for="xfer-email">RECIPIENT (LOCAL DEGEN EMAIL)</label>
            <input id="xfer-email" type="email" bind:value={transferEmail} class="input-base mt-1 font-mono" placeholder="fren@qgr.exchange" />
          </div>
          <div>
            <label class="micro-label" for="xfer-amt">AMOUNT ({active.symbol})</label>
            <input id="xfer-amt" type="number" min="0" step="any" bind:value={transferAmount} class="input-base mt-1 font-mono" />
          </div>
          <button class="btn-acid w-full" onclick={doTransfer} disabled={busy}>{busy ? 'BEAMING…' : 'CONFIRM BEAM'}</button>
          <p class="font-mono text-[11px] text-ink/50">Recipient credited instantly. Both histories updated. Friendship strengthened.</p>
        </div>
      {/if}
    </div>
  </div>
{/if}
