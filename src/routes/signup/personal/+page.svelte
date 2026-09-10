<script lang="ts">
  import { goto } from '$app/navigation';
  import { toast } from '$lib/stores/toast';
  import { signup } from '$lib/stores/signup';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { validateEmail, validatePassword, validateDateOfBirth, validatePhone, validateSSN } from '$lib/utils/validators';

  let formData = { email: '', confirmEmail: '', password: '', confirmPassword: '', firstName: '', lastName: '', dateOfBirth: '', ssn: '', phone: '' };
  let errors: Record<string, string> = {};
  let showPassword = false;
  let showConfirmPassword = false;
  let showSSN = false;

  function formatSSN(v: string) {
    const c = v.replace(/\D/g, '').slice(0, 9);
    if (c.length <= 3) return c;
    if (c.length <= 5) return `${c.slice(0, 3)}-${c.slice(3)}`;
    return `${c.slice(0, 3)}-${c.slice(3, 5)}-${c.slice(5)}`;
  }
  function formatPhone(v: string) {
    const c = v.replace(/\D/g, '').slice(0, 10);
    if (c.length <= 3) return c;
    if (c.length <= 6) return `(${c.slice(0, 3)}) ${c.slice(3)}`;
    return `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}`;
  }
  function handleSSNInput(e: Event) {
    formData.ssn = formatSSN((e.target as HTMLInputElement).value);
  }
  function handlePhoneInput(e: Event) {
    formData.phone = formatPhone((e.target as HTMLInputElement).value);
  }

  function validateStep(): boolean {
    errors = {};
    let ok = true;
    const er = validateEmail(formData.email);
    if (!er.valid) {
      errors.email = er.error ?? 'Invalid email';
      ok = false;
    }
    if (formData.email !== formData.confirmEmail) {
      errors.confirmEmail = 'Emails do not match';
      ok = false;
    }
    const pr = validatePassword(formData.password);
    if (!pr.valid) {
      errors.password = pr.error ?? 'Invalid password';
      ok = false;
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      ok = false;
    }
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      ok = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      ok = false;
    }
    const dr = validateDateOfBirth(formData.dateOfBirth);
    if (!dr.valid) {
      errors.dateOfBirth = dr.error ?? 'Invalid DOB';
      ok = false;
    }
    const sr = validateSSN(formData.ssn);
    if (!sr.valid) {
      errors.ssn = sr.error ?? 'Invalid SSN';
      ok = false;
    }
    const phr = validatePhone(formData.phone);
    if (!phr.valid) {
      errors.phone = phr.error ?? 'Invalid phone';
      ok = false;
    }
    return ok;
  }

  function handleContinue() {
    if (!validateStep()) {
      toast.error('Fix the highlighted fields, degen');
      return;
    }
    signup.save({ email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName, dateOfBirth: formData.dateOfBirth, ssn: formData.ssn, phone: formData.phone });
    goto('/signup/address');
  }

  const field = (hasErr: boolean) => `input-base mt-1 font-mono ${hasErr ? '!border-blood' : ''}`;
</script>

<svelte:head><title>Mint Identity — QGR Exchange</title></svelte:head>

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
        <div class="flex items-center gap-2"><div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-gold font-display text-sm font-bold">2</div><span class="font-display text-sm font-bold">IDENTITY</span></div>
        <div class="mx-3 h-0.5 flex-1 bg-ink/20"></div>
        <div class="flex items-center gap-2"><div class="flex h-8 w-8 items-center justify-center border-2 border-ink bg-white font-display text-sm font-bold text-ink/40">3</div><span class="font-mono text-xs text-ink/40">VERIFY</span></div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="brut-card bg-white p-6 sm:p-8">
      <div class="mb-8 text-center">
        <span class="sticker-gold">STEP 02</span>
        <h1 class="font-display mt-3 text-3xl font-bold tracking-tight">MINT YOUR IDENTITY</h1>
        <p class="mt-1 font-mono text-xs text-ink/60">PROOF-OF-HUMAN (DEMO GRADE). WE NEVER SELL YOUR DATA.</p>
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <h3 class="border-b-2 border-ink pb-2 font-display font-bold tracking-widest">COMMS</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="micro-label" for="su-email">EMAIL *</label>
              <input id="su-email" type="email" bind:value={formData.email} class={field(!!errors.email)} placeholder="degen@qgr.exchange" />
              {#if errors.email}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.email}</p>{/if}
            </div>
            <div>
              <label class="micro-label" for="su-email2">CONFIRM EMAIL *</label>
              <input id="su-email2" type="email" bind:value={formData.confirmEmail} class={field(!!errors.confirmEmail)} placeholder="degen@qgr.exchange" />
              {#if errors.confirmEmail}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.confirmEmail}</p>{/if}
            </div>
          </div>
          <div>
            <label class="micro-label" for="su-phone">PHONE *</label>
            <input id="su-phone" type="tel" value={formData.phone} oninput={handlePhoneInput} class={field(!!errors.phone)} placeholder="(555) 123-4567" />
            {#if errors.phone}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.phone}</p>{/if}
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="border-b-2 border-ink pb-2 font-display font-bold tracking-widest">HUMAN DETAILS</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="micro-label" for="su-fn">FIRST NAME *</label>
              <input id="su-fn" type="text" bind:value={formData.firstName} class={field(!!errors.firstName)} placeholder="Satoshi" />
              {#if errors.firstName}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.firstName}</p>{/if}
            </div>
            <div>
              <label class="micro-label" for="su-ln">LAST NAME *</label>
              <input id="su-ln" type="text" bind:value={formData.lastName} class={field(!!errors.lastName)} placeholder="Nakamoto" />
              {#if errors.lastName}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.lastName}</p>{/if}
            </div>
          </div>
          <div>
            <label class="micro-label" for="su-dob">DATE OF BIRTH *</label>
            <input id="su-dob" type="date" bind:value={formData.dateOfBirth} class={field(!!errors.dateOfBirth)} />
            {#if errors.dateOfBirth}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.dateOfBirth}</p>{/if}
          </div>
          <div>
            <label class="micro-label" for="su-ssn">SSN *</label>
            <div class="relative">
              <input id="su-ssn" type={showSSN ? 'text' : 'password'} value={formData.ssn} oninput={handleSSNInput} class={field(!!errors.ssn) + ' pr-16'} placeholder="XXX-XX-XXXX" />
              <button type="button" onclick={() => (showSSN = !showSSN)} class="absolute top-1/2 right-3 -translate-y-1/2 border border-ink bg-paper px-1.5 font-mono text-[11px] font-bold">{showSSN ? 'HIDE' : 'SHOW'}</button>
            </div>
            {#if errors.ssn}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.ssn}</p>{/if}
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="border-b-2 border-ink pb-2 font-display font-bold tracking-widest">VAULT KEY (PASSWORD)</h3>
          <div>
            <label class="micro-label" for="su-pw">PASSWORD *</label>
            <div class="relative">
              <input id="su-pw" type={showPassword ? 'text' : 'password'} bind:value={formData.password} class={field(!!errors.password) + ' pr-16'} placeholder="••••••••" />
              <button type="button" onclick={() => (showPassword = !showPassword)} class="absolute top-1/2 right-3 -translate-y-1/2 border border-ink bg-paper px-1.5 font-mono text-[11px] font-bold">{showPassword ? 'HIDE' : 'SHOW'}</button>
            </div>
            {#if errors.password}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.password}</p>{:else}<p class="mt-1 font-mono text-[11px] text-ink/50">MIN 8 CHARS · UPPER + LOWER + NUMBER + SPECIAL (!@#$%^&*)</p>{/if}
          </div>
          <div>
            <label class="micro-label" for="su-pw2">CONFIRM PASSWORD *</label>
            <div class="relative">
              <input id="su-pw2" type={showConfirmPassword ? 'text' : 'password'} bind:value={formData.confirmPassword} class={field(!!errors.confirmPassword) + ' pr-16'} placeholder="••••••••" />
              <button type="button" onclick={() => (showConfirmPassword = !showConfirmPassword)} class="absolute top-1/2 right-3 -translate-y-1/2 border border-ink bg-paper px-1.5 font-mono text-[11px] font-bold">{showConfirmPassword ? 'HIDE' : 'SHOW'}</button>
            </div>
            {#if errors.confirmPassword}<p class="mt-1 font-mono text-xs font-bold text-blood">!! {errors.confirmPassword}</p>{/if}
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-between">
        <a href="/signup" class="btn-secondary">← BACK</a>
        <button onclick={handleContinue} class="btn-primary">CONTINUE →</button>
      </div>
    </div>
  </main>
</div>
