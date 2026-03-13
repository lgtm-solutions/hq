<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
</script>

<div class="flex items-center justify-between">
  <h1 class="text-2xl font-bold">{data.project.name}</h1>
  <a href="/projects" class="text-sm text-zinc-400 hover:text-zinc-100">&larr; Back</a>
</div>

{#if data.project.description}
  <p class="mt-2 text-zinc-400">{data.project.description}</p>
{/if}

{#if data.project.git}
  <p class="mt-1 text-sm text-zinc-500">{data.project.git}</p>
{/if}

<hr class="my-6 border-zinc-800" />

<h2 class="text-lg font-semibold">Channels</h2>

{#if form?.error}
  <p class="mt-2 text-sm text-red-400">{form.error}</p>
{/if}

<form method="POST" action="?/addChannel" use:enhance class="mt-4 flex gap-2">
  <input name="channel_id" placeholder="channel-id" required class="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
  <button type="submit" class="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200">
    Add
  </button>
</form>

{#if data.channels.length === 0}
  <p class="mt-4 text-sm text-zinc-500">No channels linked.</p>
{:else}
  <ul class="mt-4 space-y-2">
    {#each data.channels as channel}
      <li class="flex items-center justify-between rounded border border-zinc-800 px-4 py-2">
        <span class="text-sm font-mono">{channel.channelId}</span>
        <form method="POST" action="?/removeChannel" use:enhance>
          <input type="hidden" name="id" value={channel.id} />
          <button type="submit" class="text-xs text-red-400 hover:text-red-300">Remove</button>
        </form>
      </li>
    {/each}
  </ul>
{/if}
