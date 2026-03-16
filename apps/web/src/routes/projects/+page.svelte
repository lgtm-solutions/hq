<script lang="ts">
  let { data } = $props();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Projects</h2>
      <p class="mt-1 text-sm text-text-secondary">{data.projects.length} project{data.projects.length !== 1 ? 's' : ''}</p>
    </div>
    <a
      href="/projects/new"
      class="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      New Project
    </a>
  </div>

  {#if data.projects.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-1 py-16">
      <svg class="h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <p class="mt-3 text-sm text-text-muted">No projects yet</p>
      <a
        href="/projects/new"
        class="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Create your first project
      </a>
    </div>
  {:else}
    <div class="grid gap-3">
      {#each data.projects as project}
        <a href="/companies/{project.companySlug}" class="card-hover group block rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3 text-sm font-semibold text-text-secondary group-hover:bg-accent-muted group-hover:text-accent-hover transition-colors">
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="font-medium group-hover:text-accent-hover transition-colors">{project.name}</div>
                <div class="mt-0.5 text-xs text-text-muted">{project.companyName}</div>
                {#if project.description}
                  <div class="mt-0.5 text-sm text-text-muted line-clamp-1">{project.description}</div>
                {/if}
              </div>
            </div>
            <svg class="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          {#if project.git}
            <div class="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
              </svg>
              <span class="font-mono">{project.git}</span>
            </div>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
