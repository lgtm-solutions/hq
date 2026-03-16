<script lang="ts">
  let { data } = $props();

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
  <!-- Agent header -->
  <div class="flex items-start gap-4">
    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted text-lg font-semibold text-accent-hover">
      {data.agent.name.charAt(0).toUpperCase()}
    </div>
    <div>
      <h2 class="text-xl font-semibold">{data.agent.name}</h2>
      <p class="mt-0.5 text-sm text-text-secondary">{data.agent.role}</p>
      <p class="mt-0.5 text-xs text-text-muted">
        <a href="/companies/{data.company.slug}" class="hover:text-accent-hover transition-colors">{data.company.name}</a>
      </p>
    </div>
  </div>

  {#if data.agent.description}
    <p class="text-sm text-text-secondary">{data.agent.description}</p>
  {/if}

  <!-- Configuration -->
  <div class="rounded-xl border border-border-subtle bg-surface-1 p-5 space-y-4">
    <h3 class="text-sm font-semibold">Configuration</h3>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Provider</div>
        <div class="mt-1 text-sm font-mono">{data.agent.provider}</div>
      </div>
      <div>
        <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Model</div>
        <div class="mt-1 text-sm font-mono">{data.agent.model}</div>
      </div>
      {#if data.agent.budget}
        <div>
          <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Budget</div>
          <div class="mt-1 text-sm">
            {data.agent.budget.monthly} {data.agent.budget.currency}/month
          </div>
        </div>
      {/if}
      <div>
        <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Reports To</div>
        <div class="mt-1 text-sm">{data.agent.reportsTo || 'Nobody'}</div>
      </div>
    </div>

    {#if data.agent.manages && data.agent.manages.length > 0}
      <div>
        <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Manages</div>
        <div class="mt-1.5 flex flex-wrap gap-1.5">
          {#each data.agent.manages as managed}
            <span class="rounded bg-surface-3 px-2 py-0.5 text-xs text-text-secondary">{managed}</span>
          {/each}
        </div>
      </div>
    {/if}

    {#if data.agent.channels && data.agent.channels.length > 0}
      <div>
        <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Channels</div>
        <div class="mt-1.5 flex flex-wrap gap-1.5">
          {#each data.agent.channels as channel}
            <span class="rounded bg-surface-3 px-2 py-0.5 text-xs font-mono text-text-secondary">{channel}</span>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Assigned Tasks -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Assigned Tasks</h3>
      <span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-text-muted">
        {data.assignedTasks.length}
      </span>
    </div>

    {#if data.assignedTasks.length === 0}
      <div class="rounded-xl border border-border-subtle bg-surface-1 py-8 text-center">
        <p class="text-sm text-text-muted">No tasks assigned to this agent</p>
      </div>
    {:else}
      <div class="rounded-xl border border-border-subtle bg-surface-1 divide-y divide-border-subtle">
        {#each data.assignedTasks as task}
          <a href="/tasks/{task.id}" class="flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors first:rounded-t-xl last:rounded-b-xl">
            <div class="flex items-center gap-3 min-w-0">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColor[task.status] || 'bg-zinc-500/10 text-text-muted'}">
                {task.status}
              </span>
              <span class="text-sm truncate">{task.title}</span>
            </div>
            <span class="ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {priorityColor[task.priority] || 'bg-zinc-500/10 text-text-muted'}">
              {task.priority}
            </span>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
