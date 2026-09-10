<script lang="ts">
  import { goto } from '$app/navigation';
  import { toast } from '$lib/stores/toast';
  import { signup } from '$lib/stores/signup';
  import { auth } from '$lib/stores/auth';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let formData = { street: '', apartment: '', city: '', state: '', zip: '' };
  let errors: Record<string, string> = {};
  let isLoading = false;
  let photoFile: File | null = null;
  let photoPreview: string | null = null;

  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  function handlePhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 3 * 1024 * 1024) {
        toast.error('PFP must be under 3MB');
        return;
      }
      photoFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoPreview = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function validateStep(): boolean {
    errors = {};
    let ok = true;
    if (!formData.street.trim()) {
      errors.street = 'Street address is required';
      ok = false;
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
      ok = false;
    }
    if (!formData.state) {
      errors.state = 'State is required';
      ok = false;
    }
    if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      errors.zip = 'Valid ZIP code required';
      ok = false;
    }
    return ok;
  }

  async function handleSubmit() {
    if (!validateStep()) {
      toast.error('Fix the highlighted fields, degen');
      return;
    }
    isLoading = true;

    let sd: any;
    const unsub = signup.subscribe((s) => {
      sd = s;
    });
    unsub();

    if (!sd.email || !sd.password) {
      toast.error('Missing identity — back to step 2');
      isLoading = false;
      return;
    }

    const formPayload = new FormData();
    formPayload.append('email', sd.email);
    formPayload.append('password', sd.password);
    formPayload.append('first_name', sd.firstName);
    formPayload.append('last_name', sd.lastName);
    formPayload.append('phone', sd.phone || '');
    formPayload.append('date_of_birth', sd.dateOfBirth || '');
    formPayload.append('address_street', formData.street + (formData.apartment ? ' ' + formData.apartment : ''));
    formPayload.append('address_city', formData.city);
    formPayload.append('address_state', formData.state);
    formPayload.append('address_zip', formData.zip);
    if (photoFile) formPayload.append('picture', photoFile);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch(`${API_BASE}/auth/register.php`, { method: 'POST', headers, body: formPayload });
      const data = await resp.json();

      isLoading = false;
      if (data.success && data.data) {
        auth.setAuth(data.data.user, data.data.token);
        signup.reset();
        toast.success('Vault minted. Welcome to QGR.');
        goto('/signup/complete');
      } else {
        toast.error(data.errors?.join(', ') || data.error || 'Mint failed');
      }
    } catch {
      isLoading = false;
      toast.error('Network error. Try again.');
    }
  }

  const field = (hasErr: boolean) => `input-base mt-1 font-mono ${hasErr ? '!border-blood' : ''}`;
</script>

<svelte:head><title>Base Location — QGR Exchange</title></svelte:head>

<div class="paper-grain min-h-screen bg-paper text-ink">
  <header class="border-b-2 border-ink bg-paper">
    <div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <a href="/" class="mb-4 flex items-center gap-2">
        <img src="/qgr-mark.svg" alt="QGR" class="h-8 w-8 border-2 border-ink bg-gold" />
        <span class="font-display text-lg font-bold">QGR/EXCHANGE</span>
      </a>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2"><div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-acid font-display text-sm font-bold">✓</div><span class="font-mono text-xs text-ink/50">STACK</span></div>
        <div class="mx-3 h-0.5 flex-1 bg-ink"></div>
        <div class="flex items-center gap-2"><div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-acid font-display text-sm font-bold">✓</div><span class="font-mono text-xs text-ink/50">IDENTITY</span></div>
        <div class="mx-3 h-0.5 flex-1 bg-ink"></div>
        <div class="flex items-center gap-2"><div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-gold font-display text-sm font-bold">3</div><span class="font-display text-sm font-bold">BASE</span></div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="brut-card bg-white p-6 sm:p-8">
      <div class="mb-8 text-center">
        <span class="sticker-gold">STEP 03</span>
        <h1 class="font-display mt-3 text-3xl font-bold tracking-tight">BASE LOCATION + PFP</h1>
        <p class="mt-1 font-mono text-xs text-ink/60">DEMO-GRADE KYC. ADDRESS FOR COMPLIANCE COSPLAY.</p>
      </div>

      <div class="space-y-4">
        <div class="brut-flat bg-paper p-5">
          <h3 class="font-display font-bold tracking-widest">PFP <span class="font-mono text-xs font-normal text-ink/50">(OPTIONAL FLEX)</span></h3>
          <div class="mt-3 flex items-center gap-5">
            <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-2 border-ink bg-white">
              {#if photoPreview}
                <img src={photoPreview} alt="Preview" class="h-full w-full object-cover" />
              {:else}
                <span class="font-display text-2xl font-bold text-ink/30">?</span>
              {/if}
            </div>
            <div>
              <label class="btn-secondary cursor-pointer !px-4 !py-2 !text-xs">
                <span>UPLOAD PFP</span>
                <input type="file" accept="image/*" onchange={handlePhotoChange} class="hidden" />
              </label>
              {#if photoFile}
                <p class="mt-2 font-mono text-xs font-bold text-up">■ {photoFile.name}</p>
              {:else}
                <p class="mt-2 font-mono text-[11px] text-ink/50">JPG/PNG · MAX 3MB</p>
              {/if}
            </div>
          </div>
        </div>

        <div>
          <label class="micro-label" for="ad-street">STREET *</label>
          <input id="ad-street" type="text" bind:value={formData.street} class={field(!!errors.street)} placeholder="123 Satoshi St" />
          {#if errors.street}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.street}</p>{/if}
        </div>
        <div>
          <label class="micro-label" for="ad-apt">APT / SUITE (OPTIONAL)</label>
          <input id="ad-apt" type="text" bind:value={formData.apartment} class="input-base mt-1 font-mono" placeholder="Apt 4B" />
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="micro-label" for="ad-city">CITY *</label>
            <input id="ad-city" type="text" bind:value={formData.city} class={field(!!errors.city)} />
            {#if errors.city}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.city}</p>{/if}
          </div>
          <div>
            <label class="micro-label" for="ad-state">STATE *</label>
            <select id="ad-state" bind:value={formData.state} class={field(!!errors.state)}><option value="">--</option>{#each states as s}<option value={s}>{s}</option>{/each}</select>
            {#if errors.state}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.state}</p>{/if}
          </div>
          <div>
            <label class="micro-label" for="ad-zip">ZIP *</label>
            <input id="ad-zip" type="text" bind:value={formData.zip} class={field(!!errors.zip)} placeholder="10001" maxlength="10" />
            {#if errors.zip}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.zip}</p>{/if}
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-between">
        <a href="/signup/personal" class="btn-secondary">← BACK</a>
        <button onclick={handleSubmit} disabled={isLoading} class="btn-acid">
          {#if isLoading}<LoadingSpinner size="sm" />{/if}
          {isLoading ? 'MINTING…' : 'MINT VAULT →'}
        </button>
      </div>
    </div>
  </main>
</div>
