<script lang="ts">
  let { data } = $props();

  const categories = [
    { id: 'provider', label: 'LLM Providers' },
    { id: 'communication', label: 'Communication' },
    { id: 'runtime', label: 'Agent Runtimes' },
    { id: 'source_control', label: 'Source Control' },
    { id: 'database', label: 'Database' },
  ];

  function borderClass(status: string): string {
    if (status === 'connected') return 'border-success/50';
    if (status === 'error') return 'border-danger/50';
    return 'border-border-subtle';
  }

  function dotClass(status: string): string {
    if (status === 'connected') return 'bg-success';
    if (status === 'error') return 'bg-danger';
    return 'bg-text-muted/40';
  }

  function statusLabel(status: string): string {
    if (status === 'connected') return 'Connected';
    if (status === 'error') return 'Error';
    return 'Not configured';
  }

  function statusTextClass(status: string): string {
    if (status === 'connected') return 'text-success';
    if (status === 'error') return 'text-danger';
    return 'text-text-muted';
  }

  const connectedCount = $derived(data.integrations.filter((i) => i.status === 'connected').length);
</script>

<div class="space-y-8">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Integrations</h2>
      <p class="mt-1 text-sm text-text-secondary">
        {connectedCount} of {data.integrations.length} integrations connected
      </p>
    </div>
  </div>

  {#each categories as category}
    {@const items = data.integrations.filter((i) => i.category === category.id)}
    {#if items.length > 0}
      <div class="space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">{category.label}</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each items as integration}
            <div class="rounded-xl border-2 {borderClass(integration.status)} bg-surface-1 p-5 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-xs font-bold text-text-secondary">
                    {integration.icon}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium">{integration.name}</span>
                      {#if integration.soon}
                        <span class="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">Soon</span>
                      {/if}
                    </div>
                    <div class="text-xs text-text-muted mt-0.5">{integration.description}</div>
                  </div>
                </div>
              </div>

              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full {dotClass(integration.status)}"></div>
                  <span class="text-xs font-medium {statusTextClass(integration.status)}">
                    {statusLabel(integration.status)}
                  </span>
                </div>
                {#if integration.statusMessage}
                  <span class="text-xs text-text-muted">{integration.statusMessage}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>
