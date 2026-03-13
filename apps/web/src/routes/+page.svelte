<div class="space-y-6">
  <!-- Welcome section -->
  <div>
    <h2 class="text-xl font-semibold">Mission Control</h2>
    <p class="mt-1 text-sm text-text-secondary">Manage projects and channel mappings for your agents.</p>
  </div>

  <!-- Quick stats -->
  <div class="grid grid-cols-3 gap-4">
    <div class="rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Projects</div>
      <div class="mt-2 text-2xl font-semibold">&mdash;</div>
      <div class="mt-1 text-xs text-text-muted">Total active</div>
    </div>
    <div class="rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Channels</div>
      <div class="mt-2 text-2xl font-semibold">&mdash;</div>
      <div class="mt-1 text-xs text-text-muted">Connected</div>
    </div>
    <div class="rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div class="text-xs font-medium uppercase tracking-wider text-text-muted">Agents</div>
      <div class="mt-2 text-2xl font-semibold">&mdash;</div>
      <div class="mt-1 text-xs text-text-muted">Running</div>
    </div>
  </div>

  <!-- Quick actions -->
  <div class="rounded-xl border border-border-subtle bg-surface-1 p-5">
    <h3 class="text-sm font-medium">Quick Actions</h3>
    <div class="mt-3 flex gap-3">
      <a
        href="/projects/new"
        class="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        New Project
      </a>
      <a
        href="/projects"
        class="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
      >
        View All Projects
      </a>
    </div>
  </div>
</div>
