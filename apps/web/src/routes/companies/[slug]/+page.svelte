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
  <!-- Company header -->
  <div class="flex items-start gap-4">
    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted text-lg font-semibold text-accent-hover">
      {data.company.name.charAt(0).toUpperCase()}
    </div>
    <div>
      <h2 class="text-xl font-semibold">{data.company.name}</h2>
      {#if data.company.description}
        <p class="mt-0.5 text-sm text-text-secondary">{data.company.description}</p>
      {/if}
    </div>
  </div>

  {#if data.company.mission}
    <div class="rounded-xl border border-border-subtle bg-surface-1 p-5">
      <h3 class="text-xs font-medium uppercase tracking-wider text-text-muted">Mission</h3>
      <p class="mt-2 text-sm text-text-secondary">{data.company.mission}</p>
    </div>
  {/if}

  <!-- Agents -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Agents</h3>
      <span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-text-muted">
        {data.company.agents.length}
      </span>
    </div>

    {#if data.company.agents.length === 0}
      <p class="text-center text-sm text-text-muted py-6">No agents configured</p>
    {:else}
      <div class="grid gap-3 sm:grid-cols-2">
        {#each data.company.agents as agent}
          <a
            href="/companies/{data.company.slug}/agents/{agent.name}"
            class="card-hover group block rounded-xl border border-border-subtle bg-surface-1 p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3 text-xs font-bold text-text-secondary group-hover:bg-accent-muted group-hover:text-accent-hover transition-colors">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="text-sm font-medium group-hover:text-accent-hover transition-colors">{agent.name}</div>
                  <div class="text-xs text-text-muted">{agent.role}</div>
                </div>
              </div>
              <svg class="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div class="mt-3 flex items-center gap-3 text-xs text-text-muted">
              <span class="rounded bg-surface-3 px-1.5 py-0.5 font-mono">{agent.provider}</span>
              <span class="font-mono">{agent.model}</span>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Projects -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Projects</h3>
      <span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-text-muted">
        {data.company.projects.length}
      </span>
    </div>

    {#if data.company.projects.length === 0}
      <p class="text-center text-sm text-text-muted py-6">No projects configured</p>
    {:else}
      <div class="grid gap-3">
        {#each data.company.projects as project}
          <div class="rounded-xl border border-border-subtle bg-surface-1 p-4">
            <div class="font-medium text-sm">{project.name}</div>
            {#if project.description}
              <div class="mt-0.5 text-xs text-text-muted line-clamp-2">{project.description}</div>
            {/if}
            {#if project.git}
              <div class="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                </svg>
                <span class="font-mono">{project.git}</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Recent Tasks -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Recent Tasks</h3>
      <a href="/tasks?company={data.company.slug}" class="text-xs text-accent-hover hover:underline">View all</a>
    </div>

    {#if data.recentTasks.length === 0}
      <div class="rounded-xl border border-border-subtle bg-surface-1 py-8 text-center">
        <p class="text-sm text-text-muted">No tasks yet</p>
        <a href="/tasks/new" class="mt-2 inline-block text-xs text-accent-hover hover:underline">Create one</a>
      </div>
    {:else}
      <div class="rounded-xl border border-border-subtle bg-surface-1 divide-y divide-border-subtle">
        {#each data.recentTasks as task}
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
