<script lang="ts">
  let { data } = $props();
</script>

<div class="space-y-8">
  <!-- Header -->
  <div>
    <a
      href="/integrations"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors mb-4"
    >
      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Integrations
    </a>
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-xs font-bold text-text-secondary">
        PG
      </div>
      <div>
        <h2 class="text-xl font-semibold">PostgreSQL</h2>
        <p class="mt-0.5 text-sm text-text-secondary">Database connection status and details</p>
      </div>
    </div>
  </div>

  <!-- Status Card -->
  {#if data.status === 'connected'}
    <div class="rounded-xl border-2 border-success/50 bg-success/5 p-5">
      <div class="flex items-center gap-3">
        <svg class="h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-success">Connected</p>
          <p class="mt-0.5 text-xs text-text-muted">PostgreSQL database is reachable and accepting connections.</p>
        </div>
      </div>

      {#if data.url}
        <div class="mt-4">
          <code class="block rounded-lg bg-surface-2 px-4 py-3 text-xs font-mono text-text-secondary break-all">
            {data.url}
          </code>
        </div>
      {/if}
    </div>
  {:else if data.status === 'error'}
    <div class="rounded-xl border-2 border-danger/50 bg-danger/5 p-5">
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 shrink-0 text-danger mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-danger">Connection Error</p>
          <p class="mt-0.5 text-xs text-text-muted">Failed to connect to the PostgreSQL database.</p>
        </div>
      </div>

      {#if data.error}
        <pre class="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-xs font-mono text-danger whitespace-pre-wrap break-all">{data.error}</pre>
      {/if}

      {#if data.url}
        <div class="mt-3">
          <code class="block rounded-lg bg-surface-2 px-4 py-3 text-xs font-mono text-text-secondary break-all">
            {data.url}
          </code>
        </div>
      {/if}
    </div>
  {:else}
    <!-- not_configured -->
    <div class="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-5">
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-amber-400">Not Configured</p>
          <p class="mt-0.5 text-xs text-text-muted">No PostgreSQL connection has been configured.</p>
        </div>
      </div>

      {#if data.error}
        <p class="mt-3 text-xs text-text-secondary">{data.error}</p>
      {/if}

      <div class="mt-4 rounded-lg border border-border-subtle bg-surface-2 px-4 py-3">
        <p class="text-xs text-text-secondary">
          Set the <code class="rounded bg-surface-3 px-1.5 py-0.5 text-[11px] font-mono text-text-primary">DATABASE_URL</code>
          environment variable to connect to your PostgreSQL database.
        </p>
        <code class="mt-2 block text-[11px] font-mono text-text-muted">
          DATABASE_URL=postgresql://user:password@host:5432/dbname
        </code>
      </div>
    </div>
  {/if}

  <!-- Connection Details -->
  {#if data.url}
    <div class="space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Connection Details</h3>
      <div class="rounded-lg bg-surface-2 px-4 py-3">
        <div class="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Connection URL</div>
        <div class="mt-1 text-sm font-mono text-text-primary break-all">{data.url}</div>
      </div>
    </div>
  {/if}
</div>
