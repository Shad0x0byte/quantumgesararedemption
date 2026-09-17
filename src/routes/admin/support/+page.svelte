<script lang="ts">
  import { onMount } from 'svelte';
  import { getAdminSupportThreads, getAdminSupportThread, replyAdminSupport, setAdminSupportStatus } from '$lib/api/client';
  import { toast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let qLoading = true;
  let threads: any[] = [];
  let qStatus = 'open';
  let activeId = 0;
  let active: any = null;
  let messages: any[] = [];
  let reply = '';
  let busy = false;

  async function loadThreads() {
    qLoading = true;
    const res = await getAdminSupportThreads(qStatus);
    qLoading = false;
    if (res.success) threads = (res.data as any)?.threads ?? [];
    else toast.error(res.error ?? 'Threads failed');
  }
  async function openThread(id: number) {
    activeId = id;
    const res = await getAdminSupportThread(id);
    if (res.success) {
      active = (res.data as any)?.thread;
      messages = (res.data as any)?.messages ?? [];
    } else toast.error(res.error ?? 'Thread failed');
  }
  async function sendReply() {
    const text = reply.trim();
    if (!text || !activeId) return;
    busy = true;
    const res = await replyAdminSupport(activeId, text);
    busy = false;
    if (res.success) {
      reply = '';
      toast.success('Reply sent');
      await openThread(activeId);
      await loadThreads();
    } else toast.error(res.error ?? 'Reply failed');
  }
  async function setStatus(action: 'close' | 'reopen') {
    if (!activeId) return;
    const res = await setAdminSupportStatus(activeId, action);
    if (res.success) {
      toast.success(action === 'close' ? 'Thread closed' : 'Thread reopened');
      await openThread(activeId);
      await loadThreads();
    } else toast.error(res.error ?? 'Status failed');
  }
  onMount(loadThreads);
</script>

<svelte:head><title>Help Desk — QGR Ops</title></svelte:head>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <span class="sticker-blood">OPS</span>
      <h1 class="font-display mt-2 text-3xl font-bold tracking-tight">HELP DESK</h1>
      <p class="mt-1 font-mono text-xs text-white/60">LIVE INVESTOR CONVERSATIONS — REPLIES APPEAR IN THEIR MESSAGE THREAD.</p>
    </div>
    <select bind:value={qStatus} onchange={() => { loadThreads(); activeId = 0; active = null; }} class="input-base max-w-40 font-mono text-ink">
      <option value="open">OPEN</option>
      <option value="closed">CLOSED</option>
      <option value="all">ALL</option>
    </select>
  </div>

  <div class="grid gap-5 lg:grid-cols-3">
    <div class="brut-card bg-white p-4 text-ink lg:col-span-1">
      <h2 class="font-display text-sm font-bold tracking-widest">THREADS</h2>
      {#if qLoading}
        <div class="flex justify-center py-8"><LoadingSpinner /></div>
      {:else if !threads.length}
        <p class="mt-3 font-mono text-xs">No threads.</p>
      {:else}
        <div class="mt-3 max-h-[60vh] space-y-2 overflow-y-auto">
          {#each threads as t}
            <button onclick={() => openThread(t.id)} class="w-full border-2 p-3 text-left font-mono text-xs {t.id === activeId ? 'border-gold bg-paper' : 'border-ink/20 hover:border-ink'}">
              <p class="font-bold">{t.email}</p>
              <p class="truncate text-ink/60">{t.last_message ?? '—'}</p>
              <p class="mt-1 text-[10px] text-ink/40">{t.status.toUpperCase()} · {t.updated_at}</p>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="brut-card flex min-h-[50vh] flex-col bg-white p-4 text-ink lg:col-span-2">
      {#if !active}
        <p class="m-auto font-mono text-sm text-ink/50">Pick a thread to start helping.</p>
      {:else}
        <div class="flex items-center justify-between border-b-2 border-ink pb-3">
          <p class="font-display text-sm font-bold">{active.email} <span class="tag-mono ml-2">{active.status.toUpperCase()}</span></p>
          {#if active.status === 'open'}
            <button onclick={() => setStatus('close')} class="btn-secondary !px-3 !py-1 !text-xs">CLOSE</button>
          {:else}
            <button onclick={() => setStatus('reopen')} class="btn-secondary !px-3 !py-1 !text-xs">REOPEN</button>
          {/if}
        </div>
        <div class="max-h-[50vh] flex-1 space-y-3 overflow-y-auto bg-paper p-4">
          {#each messages as m}
            <div class="max-w-[85%] border-2 border-ink p-2.5 {m.sender === 'admin' ? 'ml-auto bg-gold' : 'bg-white'}">
              <p class="text-sm">{m.body}</p>
              <p class="mt-1 font-mono text-[10px] text-ink/50">{m.sender === 'admin' ? 'YOU (OPS)' : 'INVESTOR'} · {m.created_at}</p>
            </div>
          {/each}
        </div>
        <form onsubmit={(e) => { e.preventDefault(); sendReply(); }} class="flex flex-wrap gap-2 pt-3">
          <input bind:value={reply} maxlength="2000" placeholder="Reply as help desk…" class="input-base flex-1 font-mono text-sm" />
          <button type="submit" disabled={busy} class="btn-acid !px-5 !py-2 !text-xs">{busy ? '…' : 'REPLY'}</button>
        </form>
      {/if}
    </div>
  </div>
</div>
