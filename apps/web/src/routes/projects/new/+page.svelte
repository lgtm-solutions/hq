<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>

<h1 class="text-2xl font-bold">New Project</h1>

{#if form?.error}
  <p class="mt-2 text-sm text-red-400">{form.error}</p>
{/if}

<form method="POST" use:enhance class="mt-6 space-y-4">
  <div>
    <label for="name" class="block text-sm text-zinc-400">Name</label>
    <input id="name" name="name" required class="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" />
  </div>
  <div>
    <label for="git" class="block text-sm text-zinc-400">Git URL</label>
    <input id="git" name="git" class="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" />
  </div>
  <div>
    <label for="description" class="block text-sm text-zinc-400">Description</label>
    <textarea id="description" name="description" rows="3" class="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"></textarea>
  </div>
  <button type="submit" class="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200">
    Create
  </button>
</form>
