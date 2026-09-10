<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="mt-16 border-t-2 border-ink bg-ink text-white/60">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div class="flex items-center gap-2.5">
        <img src="/qgr-mark.svg" alt="QGR" class="h-8 w-8 border-2 border-gold bg-gold" />
        <div>
          <p class="font-display text-sm font-bold text-white">QGR/EXCHANGE</p>
          <p class="font-mono text-[11px] text-gold">STACK · SWAP · HODL</p>
        </div>
      </div>
      <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2 font-display text-xs font-bold tracking-widest">
        {#each [['STACK', '/dashboard'], ['VAULT', '/dashboard/wallets'], ['SWAP', '/dashboard/swap'], ['TICKER', '/dashboard/markets'], ['ONCHAIN', '/dashboard/transactions']] as [label, href]}
          <a {href} class="hover:bg-acid hover:text-ink hover:px-1">{label}</a>
        {/each}
      </nav>
      <span class="sticker-gold !text-[9px]">SECURE LEDGER</span>
    </div>
    <div class="mt-6 flex flex-col items-center gap-2 border-t border-white/15 pt-6 font-mono text-[11px] sm:flex-row sm:justify-between">
      <p>© {year} QGR EXCHANGE. ALL RIGHTS RESERVED.</p>
      <p>LIVE MARKET DATA · SUPPORT: support@quantumgesararedemption.com</p>
    </div>
  </div>
</footer>
