<script lang="ts">
  import { enhance } from '$app/forms';
  import { activeCompany } from '$lib/stores/company';
  let { data, form } = $props();

  let selectedCompany = $state($activeCompany);

  let companyConfig = $derived(
    data.companies.find((c) => c.slug === selectedCompany)
  );
</script>

<div class="mx-auto max-w-xl space-y-6">
  <div>
    <h2 class="text-xl font-semibold">Create Task</h2>
    <p class="mt-1 text-sm text-text-secondary">Create a new task for an agent to work on.</p>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-danger">
      {form.error}
    </div>
  {/if}

  <form method="POST" use:enhance class="space-y-5">
    <div class="rounded-xl border border-border-subtle bg-surface-1 p-5 space-y-4">
      <div>
        <label for="company_id" class="block text-sm font-medium text-text-secondary">Company</label>
        <select
          id="company_id"
          name="company_id"
          required
          bind:value={selectedCompany}
          class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="" disabled>Select a company</option>
          {#each data.companies as company}
            <option value={company.slug}>{company.name}</option>
          {/each}
        </select>
      </div>

      {#if companyConfig && companyConfig.projects.length > 0}
        <div>
          <label for="project_id" class="block text-sm font-medium text-text-secondary">Project (optional)</label>
          <select
            id="project_id"
            name="project_id"
            class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">No project</option>
            {#each companyConfig.projects as project}
              <option value={project.slug}>{project.name}</option>
            {/each}
          </select>
        </div>
      {/if}

      <div>
        <label for="title" class="block text-sm font-medium text-text-secondary">Title</label>
        <input
          id="title"
          name="title"
          required
          class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Brief summary of the task"
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-text-secondary">Description</label>
        <textarea
          id="description"
          name="description"
          rows="4"
          class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          placeholder="Detailed description of the task..."
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="priority" class="block text-sm font-medium text-text-secondary">Priority</label>
          <select
            id="priority"
            name="priority"
            class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label for="assignee" class="block text-sm font-medium text-text-secondary">Assignee</label>
          {#if companyConfig && companyConfig.agents.length > 0}
            <select
              id="assignee"
              name="assignee"
              class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Unassigned</option>
              {#each companyConfig.agents as agent}
                <option value={agent.name}>{agent.name} ({agent.role})</option>
              {/each}
            </select>
          {:else}
            <input
              id="assignee"
              name="assignee"
              class="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Select a company first"
              disabled
            />
          {/if}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="submit"
        class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Create Task
      </button>
      <a href="/tasks" class="text-sm text-text-muted transition-colors hover:text-text-secondary">
        Cancel
      </a>
    </div>
  </form>
</div>
