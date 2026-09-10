<script lang="ts">
  import { goto } from '$app/navigation';
  import { signup } from '$lib/stores/signup';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let selectedAccount = '';
  let isLoading = false;

  const accountTypes = [
    {
      id: 'checking',
      name: 'STARTER VAULT',
      icon: '⬢',
      description: 'Your first stack. Full wallet set, instant deposits, zero pressure.',
      features: ['All 5 chains on day one', 'Instant deposit rail', 'Swaps + buy/sell unlocked', 'Onchain history included'],
      tag: 'MOST APED',
      recommended: true
    },
    {
      id: 'savings',
      name: 'DEGEN PRO',
      description: 'For high-frequency apes. Bigger ambitions, same zero fees.',
      icon: '▲',
      features: ['Everything in Starter', 'Priority quote engine', 'Advanced order review', 'Early feature access'],
      tag: 'HIGH OCTANE',
      recommended: false
    },
    {
      id: 'both',
      name: 'WHALE DESK',
      icon: '◆',
      description: 'Full send. Every feature, every chain, white-glove ops support.',
      features: ['Everything in Degen Pro', 'Multi-wallet management', 'Direct ops line', 'Custom fee review'],
      tag: 'FULL SEND',
      recommended: false
    }
  ];

  function handleContinue() {
    if (!selectedAccount) return;
    signup.save({ accountType: selectedAccount });
    isLoading = true;
    setTimeout(() => goto('/signup/personal'), 300);
  }
</script>

<svelte:head>
  <title>Mint Account — QGR Exchange</title>
</svelte:head>

<div class="paper-grain min-h-screen bg-paper text-ink">
  <header class="border-b-2 border-ink bg-paper">
    <div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <a href="/" class="mb-6 flex items-center gap-2">
        <img src="/qgr-mark.svg" alt="QGR" class="h-8 w-8 border-2 border-ink bg-gold" />
        <span class="font-display text-lg font-bold">QGR/EXCHANGE</span>
      </a>
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-gold font-display text-sm font-bold">1</div>
          <span class="font-display text-sm font-bold">CHOOSE STACK</span>
        </div>
        <div class="mx-4 h-0.5 flex-1 bg-ink/20"></div>
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-white font-display text-sm font-bold text-ink/40">2</div>
          <span class="font-mono text-xs text-ink/40">IDENTITY</span>
        </div>
        <div class="mx-4 h-0.5 flex-1 bg-ink/20"></div>
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-white font-display text-sm font-bold text-ink/40">3</div>
          <span class="font-mono text-xs text-ink/40">VERIFY</span>
        </div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8 text-center">
      <span class="sticker">STEP 01</span>
      <h1 class="font-display mt-3 text-4xl font-bold tracking-tight">PICK YOUR STACK</h1>
      <p class="mt-2 font-mono text-xs text-ink/60">ALL TIERS FREE IN THE DEMO. NO GAS, NO CAP.</p>
    </div>

    <div class="space-y-4">
      {#each accountTypes as account}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="brut-flat relative cursor-pointer bg-white p-6 transition-transform {selectedAccount === account.id ? '!bg-gold/20' : 'hover:-translate-y-0.5'}"
          onclick={() => (selectedAccount = account.id)}
        >
          {#if account.recommended}
            <div class="absolute -top-3 left-6"><span class="sticker !text-[9px]">{account.tag}</span></div>
          {/if}
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink bg-ink font-display text-xl font-bold text-gold">{account.icon}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-display text-lg font-bold">{account.name}</h3>
                <span class="tag-mono">{account.tag}</span>
              </div>
              <p class="mt-1 text-sm text-ink/70">{account.description}</p>
              <ul class="mt-3 space-y-1">
                {#each account.features as feature}
                  <li class="flex items-center gap-2 font-mono text-xs"><span class="font-bold text-gold-deep">■</span> {feature}</li>
                {/each}
              </ul>
            </div>
            <div class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-ink {selectedAccount === account.id ? 'bg-acid' : 'bg-white'}">
              {#if selectedAccount === account.id}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-8 flex justify-between">
      <a href="/" class="btn-secondary">← HOME</a>
      <button onclick={handleContinue} disabled={!selectedAccount || isLoading} class="btn-primary">
        {#if isLoading}
          <LoadingSpinner size="sm" />
        {:else}
          CONTINUE →
        {/if}
      </button>
    </div>

    <div class="brut-flat mt-8 bg-white p-4">
      <p class="text-center font-mono text-xs text-ink/60">BCRYPT-HASHED · JWT SESSIONS · SECURE LEDGER · MINTING TAKES ~2 MINUTES</p>
    </div>
  </main>
</div>
