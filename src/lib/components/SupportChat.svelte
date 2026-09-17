<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { getSupportThread, sendSupportMessage } from '$lib/api/client';
  import { toast } from '$lib/stores/toast';

  let open = false;
  let authed = false;
  let loading = false;
  let messages: { sender: string; body: string; created_at: string }[] = [];
  let draft = '';
  let sending = false;
  let boxEl: HTMLDivElement | null = null;

  auth.subscribe((s) => {
    authed = s.isAuthenticated;
  });

  async function load() {
    if (!authed) return;
    loading = true;
    const res = await getSupportThread();
    loading = false;
    if (res.success) {
      messages = (res.data as any)?.messages ?? [];
      await tick();
      boxEl?.scrollTo({ top: boxEl.scrollHeight });
    }
  }

  async function toggle() {
    open = !open;
    if (open) await load();
  }

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    sending = true;
    const res = await sendSupportMessage(text);
    sending = false;
    if (res.success) {
      draft = '';
      await load();
    } else toast.error(res.error ?? 'Message failed to send');
  }

  // Poll for operator replies while open (10s)
  let poller: ReturnType<typeof setInterval> | null = null;
  $: if (open && authed) {
    poller ??= setInterval(load, 10000);
  } else if (poller) {
    clearInterval(poller);
    poller = null;
  }
  onMount(() => () => {
    if (poller) clearInterval(poller);
  });
</script>

<div class="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
  {#if open}
    <div class="flex h-96 max-h-[calc(100vh-6rem)] w-80 max-w-[calc(100vw-2rem)] flex-col border-2 border-ink bg-white shadow-[6px_6px_0_#0b132b] sm:w-96">
      <div class="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-3 text-white">
        <p class="font-display text-sm font-bold tracking-widest">HELP DESK <span class="font-mono text-[10px] text-acid">● ONLINE</span></p>
        <button onclick={toggle} class="font-bold" aria-label="Close chat">✕</button>
      </div>
      {#if !authed}
        <div class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p class="font-display font-bold">LOG IN TO CHAT</p>
          <p class="font-mono text-xs text-ink/60">Live help-desk chat is available to QGR Investment account holders.</p>
          <a href="/login" class="btn-primary !px-6 !py-2 !text-xs">LOG IN →</a>
        </div>
      {:else if loading && !messages.length}
        <p class="flex-1 p-6 font-mono text-xs">Connecting to help desk…</p>
      {:else}
        <div bind:this={boxEl} class="flex-1 space-y-3 overflow-y-auto bg-paper p-4">
          {#each messages as m}
            <div class="max-w-[85%] border-2 border-ink p-2.5 {m.sender === 'user' ? 'ml-auto bg-gold' : 'bg-white'}">
              <p class="text-sm break-words">{m.body}</p>
              <p class="mt-1 font-mono text-[10px] text-ink/50">{m.sender === 'user' ? 'YOU' : 'HELP DESK'}</p>
            </div>
          {/each}
        </div>
        <form onsubmit={(e) => { e.preventDefault(); send(); }} class="flex gap-2 border-t-2 border-ink p-3">
          <input bind:value={draft} maxlength="2000" placeholder="Ask the help desk…" class="input-base flex-1 font-mono !py-2 text-sm" />
          <button type="submit" disabled={sending} class="btn-acid !px-4 !py-2 !text-xs">{sending ? '…' : 'SEND'}</button>
        </form>
      {/if}
    </div>
  {/if}
  {#if !open}
    <button
      onclick={toggle}
      class="flex h-14 w-14 items-center justify-center border-2 border-ink bg-gold text-2xl shadow-[4px_4px_0_#0b132b] hover:bg-acid"
      aria-label="Open help desk chat"
    >💬</button>
  {/if}
</div>
