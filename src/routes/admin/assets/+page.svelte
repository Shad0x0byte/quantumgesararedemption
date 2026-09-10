<script lang="ts">
  import { onMount } from 'svelte';
  import { getAdminCryptoAssets, adminCryptoAssetUpdate } from '$lib/api/client';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = true;
  let networks: any[] = [];
  let assets: any[] = [];
  let busy = false;

  async function refresh() {
    loading = true;
    const res = await getAdminCryptoAssets();
    const d = res.data as any;
    if (res.success && d) {
      networks = d.networks ?? [];
      assets = d.assets ?? [];
    }
    loading = false;
  }

  async function saveAsset(a: any) {
    busy = true;
    const res = await adminCryptoAssetUpdate({
      asset_id: a.id,
      price_usd: Number(a.price_usd),
      change_24h: Number(a.change_24h),
      fee_bps: Number(a.fee_bps),
      status: a.status,
      price_source: a.price_source
    });
    busy = false;
    if (res.success) toast.success(`${a.symbol} tuned. Quotes updated.`);
    else toast.error(res.error ?? 'Update failed');
  }

  async function saveNetwork(n: any) {
    busy = true;
    const res = await adminCryptoAssetUpdate({ network_symbol: n.symbol, network_status: n.status });
    busy = false;
    if (res.success) toast.success(`${n.symbol} → ${n.status}`);
    else toast.error(res.error ?? 'Update failed');
  }

  async function refreshPrices() {
    busy = true;
    const res = await adminCryptoAssetUpdate({ refresh_prices: true });
    busy = false;
    if (res.success) {
      toast.success('Pulled fresh CoinGecko prices.');
      await refresh();
    } else toast.error(res.error ?? 'Refresh failed');
  }

  onMount(refresh);
</script>

<svelte:head><title>Assets + Fees — Admin</title></svelte:head>

<div class="space-y-6">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="micro-label text-gold-deep">/// TOKENOMICS DESK</p>
      <h1 class="font-display mt-1 text-3xl font-bold tracking-tight">GOD CONTROLS THE TICKER</h1>
      <p class="mt-1 font-mono text-xs text-ink/60">COINGECKO-FED BY DEFAULT · MANUAL OVERRIDE WHEN YOU PLAY MARKET MAKER</p>
    </div>
    <button class="btn-acid" onclick={refreshPrices} disabled={busy}>{busy ? 'PULLING…' : '↻ PULL COINGECKO'}</button>
  </div>

  {#if loading}
    <div class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  {:else}
    <section class="brut-card bg-white p-5">
      <h2 class="font-display text-lg font-bold">CHAINS</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each networks as n}
          <div class="brut-flat p-4">
            <p class="font-display text-sm font-bold">{n.name.toUpperCase()} <span class="font-mono text-xs text-ink/50">{n.symbol}</span></p>
            <div class="mt-2 flex gap-2">
              <select bind:value={n.status} class="input-base font-mono text-xs font-bold">
                <option value="active">ACTIVE</option>
                <option value="maintenance">MAINTENANCE</option>
                <option value="disabled">DISABLED</option>
              </select>
              <button class="btn-secondary !px-3 !py-2 !text-xs" onclick={() => saveNetwork(n)} disabled={busy}>SET</button>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="brut-card bg-white p-5">
      <h2 class="font-display text-lg font-bold">ASSETS + VIG</h2>
      <p class="mt-0.5 font-mono text-xs text-ink/50">FEE IN BPS · 35 = 0.35% · LIVE = COINGECKO · MANUAL = YOUR NUMBER</p>
      <div class="mt-4 overflow-x-auto">
        <table class="brut-table w-full min-w-[880px]">
          <thead>
            <tr><th>ASSET</th><th>SOURCE</th><th>PRICE USD</th><th>24H %</th><th>FEE BPS</th><th>STATUS</th><th></th></tr>
          </thead>
          <tbody class="font-mono text-xs">
            {#each assets as a}
              <tr>
                <td><p class="font-display font-bold">{a.symbol}</p><p class="text-ink/50">{a.name} · {a.network_symbol}</p></td>
                <td>
                  <select bind:value={a.price_source} class="input-base !w-auto font-mono text-xs font-bold">
                    <option value="live">LIVE</option>
                    <option value="manual">MANUAL</option>
                  </select>
                </td>
                <td><input type="number" min="0" step="any" bind:value={a.price_usd} class="input-base max-w-[140px] font-mono" /></td>
                <td><input type="number" step="any" bind:value={a.change_24h} class="input-base max-w-[100px] font-mono" /></td>
                <td><input type="number" min="0" max="10000" step="1" bind:value={a.fee_bps} class="input-base max-w-[100px] font-mono" /></td>
                <td>
                  <select bind:value={a.status} class="input-base !w-auto font-mono text-xs font-bold">
                    <option value="active">ACTIVE</option>
                    <option value="watch_only">WATCH</option>
                    <option value="disabled">OFF</option>
                  </select>
                </td>
                <td><button class="btn-secondary !px-3 !py-2 !text-xs" onclick={() => saveAsset(a)} disabled={busy}>TUNE</button></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}
</div>
