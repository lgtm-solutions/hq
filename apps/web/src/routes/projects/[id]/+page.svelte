<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
</script>

<div class="space-y-6">
  <!-- Project header -->
  <div class="flex items-start justify-between">
    <div class="flex items-center gap-4">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-muted text-lg font-semibold text-accent-hover">
        {data.project.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h2 class="text-xl font-semibold">{data.project.name}</h2>
        {#if data.project.description}
          <p class="mt-0.5 text-sm text-text-secondary">{data.project.description}</p>
        {/if}
      </div>
    </div>
  </div>

  {#if data.project.git}
    <div class="flex items-center gap-2 text-sm text-text-muted">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
      </svg>
      <span class="font-mono">{data.project.git}</span>
    </div>
  {/if}

  <!-- Channels section -->
  <div class="rounded-xl border border-border-subtle bg-surface-1 p-5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Channels</h3>
      <span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-text-muted">
        {data.channels.length}
      </span>
    </div>

    {#if form?.error}
      <div class="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-danger">
        {form.error}
      </div>
    {/if}

    <form method="POST" action="?/addChannel" use:enhance class="mt-4 flex gap-2">
      <input
        name="channel_id"
        placeholder="Enter channel ID..."
        required
        class="flex-1 rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <button
        type="submit"
        class="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    </form>

    {#if data.channels.length === 0}
      <p class="mt-4 text-center text-sm text-text-muted py-6">No channels linked yet</p>
    {:else}
      <ul class="mt-4 space-y-2">
        {#each data.channels as channel}
          <li class="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-0 px-4 py-2.5">
            <div class="flex items-center gap-2.5">
              <div class="h-2 w-2 rounded-full bg-success pulse-dot"></div>
              <span class="text-sm font-mono text-text-primary">{channel.channelId}</span>
            </div>
            <form method="POST" action="?/removeChannel" use:enhance>
              <input type="hidden" name="id" value={channel.id} />
              <button type="submit" class="rounded px-2 py-1 text-xs text-text-muted transition-colors hover:bg-red-500/10 hover:text-danger">
                Remove
              </button>
            </form>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
