<script lang="ts">
  import { goto } from '$app/navigation';
  let { data } = $props();

  let selectedCompany = $state(data.filters.company || '');
  let selectedStatus = $state(data.filters.status || '');

  function applyFilters() {
    const params = new URLSearchParams();
    if (selectedCompany) params.set('company', selectedCompany);
    if (selectedStatus) params.set('status', selectedStatus);
    const qs = params.toString();
    goto(`/tasks${qs ? `?${qs}` : ''}`, { replaceState: true });
  }

  const statusColor: Record<string, string> = {
    open: 'bg-emerald-500/10 text-success',
    in_progress: 'bg-yellow-500/10 text-yellow-400',
    review: 'bg-blue-500/10 text-blue-400',
    done: 'bg-zinc-500/10 text-text-muted',
    closed: 'bg-zinc-500/10 text-text-muted',
  };

  const priorityColor: Record<string, string> = {
    critical: 'bg-red-500/10 text-danger',
    high: 'bg-orange-500/10 text-orange-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    low: 'bg-zinc-500/10 text-text-muted',
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Tasks</h2>
      <p class="mt-1 text-sm text-text-secondary">
        {data.tasks.length} task{data.tasks.length !== 1 ? 's' : ''}
      </p>
    </div>
    <a
      href="/tasks/new"
      class="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      New Task
    </a>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap items-center gap-3">
    <select
      bind:value={selectedCompany}
      onchange={applyFilters}
      class="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
    >
      <option value="">All Companies</option>
      {#each data.companies as company}
        <option value={company.slug}>{company.name}</option>
      {/each}
    </select>
    <select
      bind:value={selectedStatus}
      onchange={applyFilters}
      class="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
    >
      <option value="">All Statuses</option>
      <option value="open">Open</option>
      <option value="in_progress">In Progress</option>
      <option value="review">Review</option>
      <option value="done">Done</option>
      <option value="closed">Closed</option>
    </select>
  </div>

  <!-- Tasks list -->
  {#if data.tasks.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-1 py-16">
      <svg class="h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="mt-3 text-sm text-text-muted">No tasks found</p>
      <a
        href="/tasks/new"
        class="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Create your first task
      </a>
    </div>
  {:else}
    <div class="rounded-xl border border-border-subtle bg-surface-1 divide-y divide-border-subtle">
      {#each data.tasks as task}
        <a href="/tasks/{task.id}" class="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors first:rounded-t-xl last:rounded-b-xl">
          <div class="flex flex-1 items-center gap-3 min-w-0">
            <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {statusColor[task.status] || 'bg-zinc-500/10 text-text-muted'}">
              {task.status}
            </span>
            <span class="text-sm truncate">{task.title}</span>
          </div>
          <div class="hidden items-center gap-3 sm:flex">
            <span class="text-xs text-text-muted">{task.companyId}</span>
            <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {priorityColor[task.priority] || 'bg-zinc-500/10 text-text-muted'}">
              {task.priority}
            </span>
            {#if task.assignee}
              <span class="text-xs text-text-muted">{task.assignee}</span>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
