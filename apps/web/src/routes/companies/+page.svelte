<script lang="ts">
  let { data } = $props();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Companies</h2>
      <p class="mt-1 text-sm text-text-secondary">
        {data.companies.length} company{data.companies.length !== 1 ? 'ies' : ''}
      </p>
    </div>
  </div>

  {#if data.companies.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-1 py-16">
      <svg class="h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="mt-3 text-sm text-text-muted">No companies configured</p>
      <p class="mt-1 text-xs text-text-muted">Add companies to your HQ config file to get started.</p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2">
      {#each data.companies as company}
        <a href="/companies/{company.slug}" class="card-hover group block rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-3 text-sm font-semibold text-text-secondary group-hover:bg-accent-muted group-hover:text-accent-hover transition-colors">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="font-medium group-hover:text-accent-hover transition-colors">{company.name}</div>
                {#if company.description}
                  <div class="mt-0.5 text-sm text-text-muted line-clamp-1">{company.description}</div>
                {/if}
              </div>
            </div>
            <svg class="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div class="mt-4 flex items-center gap-4 text-xs text-text-muted">
            <span class="flex items-center gap-1.5">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {company.agents.length} agent{company.agents.length !== 1 ? 's' : ''}
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {company.projects.length} project{company.projects.length !== 1 ? 's' : ''}
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
