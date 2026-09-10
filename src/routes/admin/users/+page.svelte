<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from '$lib/stores/toast';
  import { formatUsd } from '$lib/crypto/demo';
  import { formatDate } from '$lib/utils/formatters';
  import { apiRequest, adminCryptoCreditUsd } from '$lib/api/client';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let loading = true;
  let saving = false;
  let users: any[] = [];
  let searchQuery = '';
  let statusFilter = 'all';
  let priceMeta: any = null;

  let showCreate = false;
  let newUser = { first_name: '', last_name: '', email: '', password: '', phone: '', role: 'user', status: 'active', initial_balance: '' };
  let createErrors: string[] = [];

  onMount(loadUsers);

  async function loadUsers() {
    loading = true;
    const res = await apiRequest<any>('/admin/users.php');
    loading = false;
    if (res.success && res.data) {
      users = res.data.users;
      priceMeta = res.data.price_meta ?? null;
    } else toast.error(res.error || 'Failed to load holders');
  }

  async function handleCreate() {
    createErrors = [];
    if (!newUser.first_name.trim()) createErrors.push('First name required');
    if (!newUser.last_name.trim()) createErrors.push('Last name required');
    if (!newUser.email.trim()) createErrors.push('Email required');
    if (newUser.password.length < 8) createErrors.push('Password must be at least 8 characters');
    if (createErrors.length) return;

    saving = true;
    const res = await apiRequest<any>('/admin/create_user.php', {
      method: 'POST',
      body: JSON.stringify({ ...newUser, initial_balance: 0 }),
    });

    if (res.success && res.data?.user_id) {
      const uid = res.data.user_id;
      const funding = parseFloat(newUser.initial_balance) || 0;
      if (funding > 0) {
        const c = await adminCryptoCreditUsd({ user_id: uid, asset: 'USDC', usd_amount: funding, note: 'Opening credit' });
        if (!c.success) {
          saving = false;
          toast.error(`Holder created but funding failed: ${c.error}`);
          await loadUsers();
          goto(`/admin/users/${uid}`);
          return;
        }
      }
      saving = false;
      toast.success(funding > 0 ? `Holder created + funded $${funding} USDC` : 'Holder created');
      showCreate = false;
      newUser = { first_name: '', last_name: '', email: '', password: '', phone: '', role: 'user', status: 'active', initial_balance: '' };
      await loadUsers();
      goto(`/admin/users/${uid}`);
    } else {
      saving = false;
      createErrors = res.errors || [res.error || 'Failed to create holder'];
    }
  }

  async function handleToggleStatus(user: any) {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const res = await apiRequest('/admin/user_update.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, status: newStatus }),
    });
    if (res.success) {
      user.status = newStatus;
      users = [...users];
      toast.success(`Holder ${newStatus} — trading ${newStatus === 'suspended' ? 'blocked' : 'restored'}`);
    } else toast.error('Failed to update status');
  }

  async function handleDelete(user: any) {
    if (!confirm(`Nuke ${user.first_name} ${user.last_name}? Wallets, ledger and audit stay; the login dies. This cannot be undone.`)) return;
    const res = await apiRequest('/admin/user_delete.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id }),
    });
    if (res.success) {
      toast.success('Holder deleted');
      users = users.filter((u) => u.id !== user.id);
    } else toast.error(res.error || 'Failed to delete holder');
  }

  $: filtered = users.filter((u) => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.email?.toLowerCase().includes(q) || `${u.first_name} ${u.last_name}`.toLowerCase().includes(q);
    }
    return true;
  });

  function statusTag(s: string) {
    return s === 'active'
      ? 'border-ink bg-acid text-ink'
      : s === 'suspended'
        ? 'border-ink bg-blood text-white'
        : s === 'pending'
          ? 'border-ink bg-gold text-ink'
          : 'border-ink bg-paper text-ink/60';
  }
</script>

<svelte:head><title>Holders — QGR Control Room</title></svelte:head>

<div class="space-y-6">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="micro-label text-gold-deep">/// HOLDERS</p>
      <h1 class="font-display mt-1 text-3xl font-bold tracking-tight">EVERY DEGEN, EVERY BAG</h1>
      <p class="mt-1 font-mono text-xs text-ink/60">
        {users.length} HOLDERS ON THE BOOKS
        {#if priceMeta} · {priceMeta.mode === 'live' ? '● LIVE PRICES' : `CACHED ${priceMeta.age_seconds ?? '?'}S`}{/if}
      </p>
    </div>
    <button onclick={() => (showCreate = true)} class="btn-primary">+ MINT HOLDER</button>
  </div>

  <div class="brut-card flex flex-col gap-3 bg-white p-4 sm:flex-row">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Hunt by name or email…"
      class="input-base flex-1 font-mono text-xs"
    />
    <select bind:value={statusFilter} class="input-base font-mono text-xs font-bold sm:max-w-[180px]">
      <option value="all">ALL STATUS</option>
      <option value="active">ACTIVE</option>
      <option value="pending">PENDING</option>
      <option value="suspended">SUSPENDED</option>
    </select>
    <button onclick={loadUsers} class="btn-secondary !px-4">↻</button>
  </div>

  <div class="brut-card overflow-hidden bg-white">
    {#if loading}
      <div class="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
    {:else if filtered.length === 0}
      <div class="py-20 text-center">
        <p class="font-display text-2xl font-bold">NGMI — NO HOLDERS FOUND.</p>
        <p class="mt-1 font-mono text-xs text-ink/50">Loosen the filters or mint one.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="brut-table w-full min-w-[820px]">
          <thead>
            <tr><th>HOLDER</th><th>EMAIL</th><th class="text-right">PORTFOLIO</th><th>VAULTS</th><th>ROLE</th><th>STATUS</th><th>JOINED</th><th></th></tr>
          </thead>
          <tbody class="font-mono text-xs">
            {#each filtered as user}
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink bg-gold font-display text-xs font-bold">
                      {user.first_name?.[0] ?? ''}{user.last_name?.[0] ?? ''}
                    </div>
                    <div>
                      <p class="font-display text-sm font-bold">{user.first_name} {user.last_name}</p>
                      <p class="text-ink/50">#{user.id}</p>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td class="text-right font-display text-sm font-bold">{formatUsd(user.portfolio_total_usd ?? 0)}</td>
                <td><span class="tag-mono">{user.wallet_count ?? 0} VAULTS</span></td>
                <td><span class="tag-mono">{user.role.toUpperCase()}</span></td>
                <td><span class="border-2 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-widest uppercase {statusTag(user.status)}">{user.status}</span></td>
                <td class="text-ink/50">{formatDate(user.created_at)}</td>
                <td>
                  <div class="flex items-center gap-3 font-display text-[11px] font-bold">
                    <a href="/admin/users/{user.id}" class="underline decoration-gold decoration-2 underline-offset-4 hover:bg-acid">OPEN →</a>
                    <button onclick={() => handleToggleStatus(user)} class={user.status === 'active' ? 'text-blood hover:underline' : 'text-up hover:underline'}>
                      {user.status === 'active' ? 'SUSPEND' : 'UNSUSPEND'}
                    </button>
                    <button onclick={() => handleDelete(user)} class="text-ink/40 hover:text-blood hover:underline">NUKE</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <p class="text-center font-mono text-[11px] text-ink/50">OPEN a holder to fund vaults, adjust balances and review activity.</p>
</div>

{#if showCreate}
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center" role="dialog" aria-modal="true">
    <div class="brut-card w-full max-w-lg bg-white">
      <div class="flex items-center justify-between border-b-2 border-ink px-6 py-4">
        <h3 class="font-display text-lg font-bold">MINT NEW HOLDER</h3>
        <button
          onclick={() => {
            showCreate = false;
            createErrors = [];
          }}
          class="border-2 border-ink bg-paper px-2 font-bold hover:bg-blood hover:text-white">✕</button
        >
      </div>

      <div class="max-h-[70vh] space-y-4 overflow-y-auto p-6">
        {#if createErrors.length}
          <div class="brut-flat border-blood bg-white p-4">
            {#each createErrors as err}<p class="font-mono text-xs font-bold text-blood">!! {err}</p>{/each}
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="micro-label" for="nu-fn">FIRST NAME *</label>
            <input id="nu-fn" type="text" bind:value={newUser.first_name} class="input-base mt-1 font-mono" placeholder="Satoshi" />
          </div>
          <div>
            <label class="micro-label" for="nu-ln">LAST NAME *</label>
            <input id="nu-ln" type="text" bind:value={newUser.last_name} class="input-base mt-1 font-mono" placeholder="Nakamoto" />
          </div>
        </div>

        <div>
          <label class="micro-label" for="nu-email">EMAIL *</label>
          <input id="nu-email" type="email" bind:value={newUser.email} class="input-base mt-1 font-mono" placeholder="holder@qgr.exchange" />
        </div>

        <div>
          <label class="micro-label" for="nu-pw">PASSWORD * (MIN 8)</label>
          <input id="nu-pw" type="password" bind:value={newUser.password} class="input-base mt-1 font-mono" placeholder="••••••••" />
        </div>

        <div>
          <label class="micro-label" for="nu-phone">PHONE</label>
          <input id="nu-phone" type="tel" bind:value={newUser.phone} class="input-base mt-1 font-mono" placeholder="(555) 123-4567" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="micro-label" for="nu-role">ROLE</label>
            <select id="nu-role" bind:value={newUser.role} class="input-base mt-1 font-mono font-bold">
              <option value="user">HOLDER</option>
              <option value="admin">OPERATOR</option>
            </select>
          </div>
          <div>
            <label class="micro-label" for="nu-status">STATUS</label>
            <select id="nu-status" bind:value={newUser.status} class="input-base mt-1 font-mono font-bold">
              <option value="active">ACTIVE</option>
              <option value="pending">PENDING</option>
              <option value="suspended">SUSPENDED</option>
            </select>
          </div>
        </div>

        <div class="border-2 border-ink bg-paper p-4">
          <label class="micro-label" for="nu-fund">OPENING FUNDING (USD → USDC)</label>
          <input id="nu-fund" type="number" bind:value={newUser.initial_balance} step="any" min="0" class="input-base mt-2 font-mono" placeholder="0" />
          <p class="mt-2 font-mono text-[11px] text-ink/60">Auto-credited as USDC at the live price. Leave 0 to fund later from the holder page.</p>
        </div>
      </div>

      <div class="flex gap-3 border-t-2 border-ink px-6 py-4">
        <button
          onclick={() => {
            showCreate = false;
            createErrors = [];
          }}
          class="btn-secondary flex-1">CANCEL</button
        >
        <button onclick={handleCreate} disabled={saving} class="btn-primary flex-1">
          {#if saving}<LoadingSpinner size="sm" />{/if}
          {saving ? 'MINTING…' : 'MINT HOLDER'}
        </button>
      </div>
    </div>
  </div>
{/if}
