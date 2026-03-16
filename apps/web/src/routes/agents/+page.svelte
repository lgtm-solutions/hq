<script lang="ts">
  let { data } = $props();

  let view = $state<'list' | 'orgchart'>('orgchart');

  // Build org tree: group by company, then hierarchy via reportsTo
  type Agent = (typeof data.agents)[number];

  function getDirectReports(agents: Agent[], managerName: string): Agent[] {
    return agents.filter((a) => a.reportsTo === managerName);
  }

  function getRoots(agents: Agent[]): Agent[] {
    return agents.filter((a) => !a.reportsTo || !agents.some((o) => o.name === a.reportsTo));
  }

  // Group agents by company for orgchart
  let companiesMap = $derived(() => {
    const map = new Map<string, { name: string; slug: string; agents: Agent[] }>();
    for (const agent of data.agents) {
      if (!map.has(agent.companySlug)) {
        map.set(agent.companySlug, { name: agent.companyName, slug: agent.companySlug, agents: [] });
      }
      map.get(agent.companySlug)!.agents.push(agent);
    }
    return [...map.values()];
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Agents</h2>
      <p class="mt-1 text-sm text-text-secondary">
        {data.agents.length} agent{data.agents.length !== 1 ? 's' : ''} across all companies
      </p>
    </div>

    <!-- View toggle -->
    <div class="flex items-center rounded-lg border border-border-subtle bg-surface-1 p-0.5">
      <button
        onclick={() => view = 'orgchart'}
        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer {view === 'orgchart' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}"
      >
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
        </svg>
        Orgchart
      </button>
      <button
        onclick={() => view = 'list'}
        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer {view === 'list' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}"
      >
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        List
      </button>
    </div>
  </div>

  {#if data.agents.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-1 py-16">
      <svg class="h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
      <p class="mt-3 text-sm text-text-muted">No agents configured</p>
      <p class="mt-1 text-xs text-text-muted">Add agents to your HQ config file to get started.</p>
    </div>
  {:else if view === 'list'}
    <!-- List view -->
    <div class="rounded-xl border border-border-subtle bg-surface-1 divide-y divide-border-subtle">
      {#each data.agents as agent}
        <a
          href="/companies/{agent.companySlug}/agents/{agent.name}"
          class="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors first:rounded-t-xl last:rounded-b-xl"
        >
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-xs font-semibold text-text-secondary">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div class="flex flex-1 items-center gap-3 min-w-0">
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium truncate">{agent.name}</div>
              <div class="text-xs text-text-muted truncate">{agent.role}</div>
            </div>
          </div>
          <div class="hidden items-center gap-3 sm:flex">
            <span class="rounded bg-surface-3 px-1.5 py-0.5 text-xs font-mono text-text-muted">{agent.provider}</span>
            <span class="text-xs font-mono text-text-muted">{agent.model}</span>
          </div>
          <div class="hidden items-center gap-3 md:flex">
            <span class="text-xs text-text-muted">{agent.companyName}</span>
            {#if agent.openTasks > 0}
              <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-success">
                {agent.openTasks}
              </span>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <!-- Orgchart view -->
    <div class="space-y-8">
      {#each companiesMap() as company}
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded bg-accent/20 text-[10px] font-bold text-accent">
              {company.name.charAt(0).toUpperCase()}
            </div>
            <h3 class="text-sm font-semibold">{company.name}</h3>
            <span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-text-muted">
              {company.agents.length}
            </span>
          </div>

          <!-- Org tree -->
          <div class="flex flex-col items-center">
            {#each getRoots(company.agents) as root}
              {@render orgNode(root, company.agents, company.slug, 0)}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#snippet orgNode(agent: Agent, allAgents: Agent[], companySlug: string, depth: number)}
  {@const reports = getDirectReports(allAgents, agent.name)}
  <div class="flex flex-col items-center">
    <!-- Node -->
    <a
      href="/companies/{companySlug}/agents/{agent.name}"
      class="card-hover group block rounded-xl border border-border-subtle bg-surface-1 px-5 py-3 text-center min-w-[160px]"
    >
      <div class="flex items-center justify-center gap-2">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-xs font-semibold text-text-secondary group-hover:bg-accent-muted group-hover:text-accent-hover transition-colors">
          {agent.name.charAt(0).toUpperCase()}
        </div>
        <div class="text-left">
          <div class="text-sm font-medium group-hover:text-accent-hover transition-colors">{agent.name}</div>
          <div class="text-xs text-text-muted">{agent.role}</div>
        </div>
      </div>
      <div class="mt-2 flex items-center justify-center gap-2 text-xs text-text-muted">
        <span class="rounded bg-surface-3 px-1.5 py-0.5 font-mono">{agent.provider}</span>
        <span class="font-mono">{agent.model}</span>
      </div>
      {#if agent.openTasks > 0}
        <div class="mt-1.5">
          <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-success">
            {agent.openTasks} open task{agent.openTasks !== 1 ? 's' : ''}
          </span>
        </div>
      {/if}
    </a>

    <!-- Connector line down -->
    {#if reports.length > 0}
      <div class="w-px h-6 bg-border-subtle"></div>

      <!-- Horizontal connector + children -->
      {#if reports.length === 1}
        {@render orgNode(reports[0], allAgents, companySlug, depth + 1)}
      {:else}
        <div class="relative flex items-start gap-6">
          <!-- Horizontal line spanning children -->
          <div class="absolute top-0 left-[calc(50%-50%+40px)] right-[calc(50%-50%+40px)] h-px bg-border-subtle" style="left: calc(50% - {(reports.length - 1) * 52}px); right: calc(50% - {(reports.length - 1) * 52}px);"></div>

          {#each reports as report}
            <div class="flex flex-col items-center">
              <div class="w-px h-6 bg-border-subtle"></div>
              {@render orgNode(report, allAgents, companySlug, depth + 1)}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
{/snippet}
