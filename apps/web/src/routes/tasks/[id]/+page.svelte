<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();

  const statusColor: Record<string, string> = {
    open: 'bg-emerald-500/10 text-success',
    in_progress: 'bg-yellow-500/10 text-yellow-400',
    review: 'bg-blue-500/10 text-blue-400',
    done: 'bg-zinc-500/10 text-text-muted',
    closed: 'bg-zinc-500/10 text-text-muted',
  };

  const priorityColor: Record<string, string> = {
    critical: 'bg-red-500/10 text-danger',
    high: 'bg-orange-500/10 text-orange-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    low: 'bg-zinc-500/10 text-text-muted',
  };

  const statuses = ['open', 'in_progress', 'review', 'done', 'closed'];

  function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<div class="space-y-6">
  <!-- Task header -->
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <span class="rounded-full px-2.5 py-0.5 text-xs font-medium {statusColor[data.task.status] || 'bg-zinc-500/10 text-text-muted'}">
        {data.task.status}
      </span>
      <span class="rounded-full px-2.5 py-0.5 text-xs font-medium {priorityColor[data.task.priority] || 'bg-zinc-500/10 text-text-muted'}">
        {data.task.priority}
      </span>
      {#if data.company}
        <a href="/companies/{data.company.slug}" class="text-xs text-text-muted hover:text-accent-hover transition-colors">
          {data.company.name}
        </a>
      {/if}
    </div>
    <h2 class="text-xl font-semibold">{data.task.title}</h2>
    {#if data.task.description}
      <p class="text-sm text-text-secondary whitespace-pre-wrap">{data.task.description}</p>
    {/if}
    <div class="flex flex-wrap items-center gap-4 text-xs text-text-muted">
      {#if data.task.assignee}
        <span>Assigned to <strong class="text-text-secondary">{data.task.assignee}</strong></span>
      {:else}
        <span>Unassigned</span>
      {/if}
      <span>Created {formatDate(data.task.createdAt)}</span>
    </div>
  </div>

  <!-- Status update -->
  <div class="rounded-xl border border-border-subtle bg-surface-1 p-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-medium uppercase tracking-wider text-text-muted">Update Status</h3>
    </div>
    <div class="mt-3 flex flex-wrap gap-2">
      {#each statuses as status}
        <form method="POST" action="?/updateStatus" use:enhance>
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors {data.task.status === status
              ? 'bg-accent text-white'
              : 'border border-border-subtle bg-surface-0 text-text-secondary hover:bg-surface-2 hover:text-text-primary'}"
          >
            {status.replace('_', ' ')}
          </button>
        </form>
      {/each}
    </div>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-danger">
      {form.error}
    </div>
  {/if}

  <!-- Subtasks -->
  <div class="rounded-xl border border-border-subtle bg-surface-1 p-5 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Subtasks</h3>
      <span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-text-muted">
        {data.subtasks.filter((t) => t.status === 'done').length}/{data.subtasks.length}
      </span>
    </div>

    {#if data.subtasks.length > 0}
      <ul class="space-y-1">
        {#each data.subtasks as subtask}
          <li class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors">
            <form method="POST" action="?/toggleSubtask" use:enhance class="flex items-center">
              <input type="hidden" name="subtask_id" value={subtask.id} />
              <button
                type="submit"
                class="flex h-5 w-5 items-center justify-center rounded border transition-colors {subtask.status === 'done'
                  ? 'border-accent bg-accent text-white'
                  : 'border-border-default bg-surface-0 hover:border-accent'}"
              >
                {#if subtask.status === 'done'}
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </button>
            </form>
            <span class="text-sm {subtask.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'}">{subtask.title}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-center text-sm text-text-muted py-3">No subtasks yet</p>
    {/if}

    <!-- Add subtask form -->
    <form method="POST" action="?/addSubtask" use:enhance class="flex gap-2">
      <input
        name="title"
        required
        placeholder="Add a subtask..."
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
  </div>

  <!-- Comments -->
  <div class="rounded-xl border border-border-subtle bg-surface-1 p-5 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Comments</h3>
      <span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-text-muted">
        {data.comments.length}
      </span>
    </div>

    {#if data.comments.length > 0}
      <div class="space-y-4">
        {#each data.comments as comment}
          <div class="rounded-lg border border-border-subtle bg-surface-0 p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-text-primary">{comment.author}</span>
              <span class="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
            </div>
            <p class="mt-2 text-sm text-text-secondary whitespace-pre-wrap">{comment.body}</p>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-center text-sm text-text-muted py-3">No comments yet</p>
    {/if}

    <!-- Add comment form -->
    <form method="POST" action="?/addComment" use:enhance class="space-y-3">
      <input
        name="author"
        placeholder="Your name (optional)"
        class="w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <textarea
        name="body"
        required
        rows="3"
        placeholder="Write a comment..."
        class="w-full rounded-lg border border-border-subtle bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
      ></textarea>
      <button
        type="submit"
        class="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Add Comment
      </button>
    </form>
  </div>
</div>
