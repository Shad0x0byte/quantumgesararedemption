<script lang="ts">
  import { onMount } from 'svelte';

  // Custom-styled dropdown driving the Google Translate Element (hidden).
  // Persists choice in the googtrans cookie + localStorage. Client-side only.
  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'it', label: 'Italiano' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'ru', label: 'Русский' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'zh-CN', label: '中文' }
  ];

  let current = 'en';
  let open = false;
  let ready = false;

  function setCookie(code: string) {
    const val = code === 'en' ? '' : `/en/${code}`;
    document.cookie = `googtrans=${val}; path=/; max-age=31536000`;
    try {
      localStorage.setItem('qgr_lang', code);
    } catch { /* private mode */ }
  }

  function apply(code: string) {
    current = code;
    open = false;
    setCookie(code);
    // Google reads googtrans on load; re-apply live via the hidden select if present
    const sel = document.querySelector<HTMLSelectElement>('#google_translate_element select');
    if (sel) {
      sel.value = code;
      sel.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  }

  onMount(() => {
    try {
      current = localStorage.getItem('qgr_lang') ?? 'en';
    } catch { /* ignore */ }
    if (current !== 'en') setCookie(current);
    (window as any).googleTranslateElementInit = () => {
      // eslint-disable-next-line no-new
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element'
      );
      ready = true;
      if (current !== 'en') {
        const sel = document.querySelector<HTMLSelectElement>('#google_translate_element select');
        if (sel) {
          sel.value = current;
          sel.dispatchEvent(new Event('change'));
        }
      }
    };
    if (!document.querySelector('script[data-qgr-translate]')) {
      const s = document.createElement('script');
      s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      s.dataset.qgrTranslate = '1';
      document.head.appendChild(s);
    } else if ((window as any).google?.translate) {
      ready = true;
    }
  });

  $: currentLabel = LANGS.find((l) => l.code === current)?.label ?? 'English';
</script>

<div class="relative">
  <div id="google_translate_element" class="hidden-google" aria-hidden="true"></div>
  <button
    type="button"
    onclick={() => (open = !open)}
    class="flex items-center gap-2 border-2 border-ink bg-white px-3 py-1.5 font-display text-xs font-bold tracking-widest hover:bg-acid"
    aria-label="Change language"
  >
    <span>🌐</span> {currentLabel} <span class="text-[10px]">{open ? '▲' : '▼'}</span>
  </button>
  {#if open}
    <div class="absolute right-0 z-50 mt-2 max-h-72 w-44 overflow-y-auto border-2 border-ink bg-white shadow-[4px_4px_0_#0b132b]">
      {#each LANGS as l}
        <button
          type="button"
          onclick={() => apply(l.code)}
          class="block w-full px-4 py-2 text-left font-display text-xs font-bold tracking-widest hover:bg-gold {l.code === current ? 'bg-paper' : ''}"
        >
          {l.code === current ? '● ' : ''}{l.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(.hidden-google) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  /* Hide Google's injected top banner frame offset */
  :global(body) {
    top: 0 !important;
  }
  :global(.goog-te-banner-frame) {
    display: none !important;
  }
  :global(.goog-te-gadget) {
    font-size: 0 !important;
  }
</style>
