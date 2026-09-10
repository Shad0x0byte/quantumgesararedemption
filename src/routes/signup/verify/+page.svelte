<script lang="ts">
  import { goto } from '$app/navigation';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let verificationCode = ['', '', '', '', '', ''];
  let isLoading = false;
  let isResending = false;
  let countdown = 30;

  function handleInput(e: Event, index: number) {
    const target = e.target as HTMLInputElement;
    if (target.value.length === 1 && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const digits = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    for (let i = 0; i < digits.length && i < 6; i++) verificationCode[i] = digits[i];
    document.getElementById(`code-${Math.min(digits.length, 5)}`)?.focus();
  }

  async function handleVerify() {
    if (verificationCode.join('').length !== 6) {
      toast.error('Full 6-digit code, degen');
      return;
    }
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
      toast.success('Identity verified. Clean.');
      goto('/signup/complete');
    }, 1500);
  }

  async function handleResend() {
    isResending = true;
    countdown = 30;
    toast.info('Fresh code beamed to your inbox');
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        isResending = false;
      }
    }, 1000);
  }
</script>

<svelte:head>
  <title>Verify Humanity — QGR Exchange</title>
</svelte:head>

<div class="paper-grain flex min-h-screen items-center justify-center bg-paper px-4 py-12 text-ink">
  <div class="w-full max-w-md">
    <div class="brut-card bg-white p-8">
      <div class="mb-8 text-center">
        <span class="sticker">PROOF-OF-HUMAN</span>
        <h1 class="font-display mt-3 text-2xl font-bold tracking-tight">ENTER THE CODE</h1>
        <p class="mt-2 font-mono text-xs text-ink/60">6 DIGITS BEAMED TO YOUR EMAIL.<br />BOTS GET REKT HERE.</p>
      </div>

      <div class="mb-6">
        <div class="flex justify-center gap-2">
          {#each verificationCode as digit, i}
            <input
              id="code-{i}"
              type="text"
              maxlength="1"
              bind:value={verificationCode[i]}
              oninput={(e) => handleInput(e, i)}
              onkeydown={(e) => handleKeydown(e, i)}
              onpaste={handlePaste}
              class="h-14 w-12 border-2 border-ink bg-paper text-center font-display text-2xl font-bold outline-none focus:bg-acid"
            />
          {/each}
        </div>
      </div>

      <button onclick={handleVerify} disabled={isLoading || verificationCode.join('').length !== 6} class="btn-primary w-full">
        {#if isLoading}
          <LoadingSpinner size="sm" />
        {:else}
          VERIFY HUMANITY
        {/if}
      </button>

      <div class="mt-4 text-center font-mono text-xs">
        {#if isResending}
          <p>RESEND IN <span class="font-bold text-gold-deep">{countdown}</span>S</p>
        {:else}
          <p>NO CODE? <button onclick={handleResend} class="font-bold underline decoration-gold decoration-2 underline-offset-4 hover:bg-acid">RESEND →</button></p>
        {/if}
      </div>

      <div class="brut-flat mt-6 bg-paper p-4">
        <p class="font-display text-xs font-bold tracking-widest">WHY THE CODE?</p>
        <p class="mt-1 font-mono text-[11px] text-ink/60">KEEPS BOTS OUT OF THE VAULT. WE NEVER ASK FOR IT ANYWHERE ELSE.</p>
      </div>
    </div>

    <p class="mt-6 text-center">
      <a href="/signup/address" class="font-display text-sm font-bold underline decoration-gold decoration-2 underline-offset-4 hover:bg-acid">← BACK TO BASE</a>
    </p>
  </div>
</div>
