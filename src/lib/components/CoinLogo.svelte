<script lang="ts">
  export let logo: string | null = null;
  export let symbol = '';
  export let size = 'h-11 w-11';
  let failed = false;
  $: initial = (symbol || '?').slice(0, 1).toUpperCase();
</script>

{#if logo && !failed}
  <img
    src={logo}
    alt={symbol}
    loading="lazy"
    class="{size} shrink-0 border-2 border-ink bg-white object-contain p-0.5"
    on:error={() => (failed = true)}
  />
{:else}
  <div class="{size} flex shrink-0 items-center justify-center border-2 border-ink bg-gold font-display font-bold">{initial}</div>
{/if}
