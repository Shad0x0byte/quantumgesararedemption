<script lang="ts">
  import { onMount } from 'svelte';

  export let dark = false;
  export let items: Array<{ symbol: string; price_usd: number; change_24h: number }> = [];

  async function load() {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';
      const r = await fetch(`${base}/crypto/ticker.php`);
      const j = await r.json();
      if (j?.success && j?.data?.assets?.length) items = j.data.assets;
    } catch {
      /* marquee stays empty — never break the page for prices */
    }
  }

  const fmt = (p: number) =>
    p >= 1000
      ? p.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : p >= 10
        ? p.toLocaleString('en-US', { maximumFractionDigits: 2 })
        : p.toLocaleString('en-US', { maximumFractionDigits: 4 });

  onMount(load);
</script>

{#if items.length}
  <div class="w-full min-w-0 overflow-hidden border-y-2 {dark ? 'border-gold bg-ink text-white' : 'border-ink bg-ink text-white'}">
    <div class="ticker-track py-2">
      {#each [...items, ...items] as a}
        <span class="mx-5 flex items-center gap-2 font-mono text-xs font-bold whitespace-nowrap">
          <span class="text-gold">${a.symbol}</span>
          <span>${fmt(a.price_usd)}</span>
          <span class={a.change_24h >= 0 ? 'text-acid' : 'text-blood'}>
            {a.change_24h >= 0 ? '▲' : '▼'}{Math.abs(a.change_24h).toFixed(2)}%
          </span>
          <span class="ml-4 text-white/20">///</span>
        </span>
      {/each}
    </div>
  </div>
{/if}
