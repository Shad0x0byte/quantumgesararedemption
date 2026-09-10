<script lang="ts">
  import { toast } from '$lib/stores/toast';
  import type { ToastMessage } from '$lib/types';

  let toasts: ToastMessage[] = [];

  toast.subscribe((value) => {
    toasts = value;
  });

  function getTag(type: string) {
    switch (type) {
      case 'success':
        return { label: 'WAGMI', cls: 'bg-acid text-ink' };
      case 'error':
        return { label: 'REKT', cls: 'bg-blood text-white' };
      case 'warning':
        return { label: 'HEADS UP', cls: 'bg-gold text-ink' };
      default:
        return { label: 'FYI', cls: 'bg-ink text-gold' };
    }
  }
</script>

<div class="fixed right-4 bottom-4 z-[100] max-w-sm space-y-3">
  {#each toasts as toastItem (toastItem.id)}
    {@const tag = getTag(toastItem.type)}
    <div class="brut-card flex items-start gap-3 bg-white p-4">
      <span class="border-2 border-ink px-1.5 py-0.5 font-display text-[10px] font-bold tracking-widest {tag.cls}">{tag.label}</span>
      <p class="flex-1 text-sm font-bold">{toastItem.message}</p>
      <button onclick={() => toast.remove(toastItem.id)} class="border border-ink bg-paper px-1 font-bold hover:bg-blood hover:text-white" aria-label="Dismiss">✕</button>
    </div>
  {/each}
</div>
