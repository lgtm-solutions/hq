<script lang="ts">
  let { data } = $props();
</script>

<div class="flex items-center justify-between">
  <h1 class="text-2xl font-bold">Projects</h1>
  <a href="/projects/new" class="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200">
    New Project
  </a>
</div>

{#if data.projects.length === 0}
  <p class="mt-6 text-zinc-500">No projects yet.</p>
{:else}
  <div class="mt-6 space-y-3">
    {#each data.projects as project}
      <a href="/projects/{project.id}" class="block rounded-lg border border-zinc-800 p-4 hover:border-zinc-600">
        <div class="font-medium">{project.name}</div>
        {#if project.description}
          <div class="mt-1 text-sm text-zinc-400">{project.description}</div>
        {/if}
        {#if project.git}
          <div class="mt-1 text-xs text-zinc-500">{project.git}</div>
        {/if}
      </a>
    {/each}
  </div>
{/if}
