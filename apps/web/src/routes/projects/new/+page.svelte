<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>

<div class="mx-auto max-w-xl space-y-6">
  <div>
    <h2 class="text-xl font-semibold">Create Project</h2>
    <p class="mt-1 text-sm text-text-secondary">Set up a new project for your agents to work on.</p>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-danger">
      {form.error}
    </div>
  {/if}

  <form method="POST" use:enhance class="space-y-5">
    <div class="rounded-xl border border-border-subtle bg-surface-1 p-5 space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-text-secondary">Name</label>
        <input
          id="name"
          name="name"
          required
          class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="My Project"
        />
      </div>
      <div>
        <label for="git" class="block text-sm font-medium text-text-secondary">Git URL</label>
        <input
          id="git"
          name="git"
          class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="https://github.com/org/repo"
        />
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-text-secondary">Description</label>
        <textarea
          id="description"
          name="description"
          rows="3"
          class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          placeholder="Brief description of what this project does..."
        ></textarea>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="submit"
        class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Create Project
      </button>
      <a href="/projects" class="text-sm text-text-muted transition-colors hover:text-text-secondary">
        Cancel
      </a>
    </div>
  </form>
</div>
