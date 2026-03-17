<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  // Config token form state
  let showConfigTokenForm = $state(false);
  let configToken = $state('');
  let refreshToken = $state('');

  // Track which agent has the token form expanded
  let expandedTokenAgent = $state<string | null>(null);

  // Token form state per agent (keyed by companySlug/agentName)
  let appTokenInput = $state('');
  let botTokenInput = $state('');


  function agentKey(companySlug: string, agentName: string): string {
    return `${companySlug}/${agentName}`;
  }

  function statusBadgeClasses(status: string): string {
    switch (status) {
      case 'not_created':
        return 'bg-surface-3 text-text-muted';
      case 'created':
        return 'bg-amber-500/15 text-amber-400';
      case 'installed':
        return 'bg-blue-500/15 text-blue-400';
      case 'connected':
        return 'bg-success/15 text-success';
      default:
        return 'bg-surface-3 text-text-muted';
    }
  }

  function statusLabel(status: string): string {
    switch (status) {
      case 'not_created':
        return 'Not Created';
      case 'created':
        return 'App Created';
      case 'installed':
        return 'Installed';
      case 'connected':
        return 'Connected';
      default:
        return status;
    }
  }

  function statusDotClass(status: string): string {
    switch (status) {
      case 'not_created':
        return 'bg-text-muted/40';
      case 'created':
        return 'bg-amber-400';
      case 'installed':
        return 'bg-blue-400';
      case 'connected':
        return 'bg-success';
      default:
        return 'bg-text-muted/40';
    }
  }

  function borderClass(status: string): string {
    switch (status) {
      case 'connected':
        return 'border-success/50';
      case 'installed':
        return 'border-blue-500/50';
      case 'created':
        return 'border-amber-500/50';
      default:
        return 'border-border-subtle';
    }
  }

  async function submitConfigToken() {
    await fetch('/api/integrations/slack/config-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configToken: configToken.trim(),
        refreshToken: refreshToken.trim() || undefined,
      }),
    });
    configToken = '';
    refreshToken = '';
    showConfigTokenForm = false;
    await invalidateAll();
  }

  async function rotateConfigToken() {
    await fetch('/api/integrations/slack/config-token/rotate', {
      method: 'POST',
    });
    await invalidateAll();
  }

  async function createApp(companySlug: string, agentName: string) {
    await fetch('/api/integrations/slack/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companySlug, agentName }),
    });
    await invalidateAll();
  }

  function toggleTokenForm(companySlug: string, agentName: string) {
    const key = agentKey(companySlug, agentName);
    if (expandedTokenAgent === key) {
      expandedTokenAgent = null;
      appTokenInput = '';
      botTokenInput = '';
    } else {
      expandedTokenAgent = key;
      appTokenInput = '';
      botTokenInput = '';
    }
  }

  async function submitTokens(companySlug: string, agentName: string) {
    await fetch(`/api/integrations/slack/apps/${companySlug}/${agentName}/tokens`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appToken: appTokenInput.trim() || undefined,
        botToken: botTokenInput.trim() || undefined,
      }),
    });
    expandedTokenAgent = null;
    appTokenInput = '';
    botTokenInput = '';
    await invalidateAll();
  }

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
        S
      </div>
      <div>
        <h2 class="text-xl font-semibold">Slack Integration</h2>
        <p class="mt-0.5 text-sm text-text-secondary">Manage Slack apps for your agents</p>
      </div>
    </div>
  </div>

  <!-- Config Token Banner -->
  {#if !data.hasConfigToken}
    <div class="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-amber-400">Config Token Required</p>
            <p class="mt-1 text-xs text-text-secondary">
              A Slack configuration token is needed to create and manage apps.
              Generate one at
              <a
                href="https://api.slack.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                class="text-accent underline underline-offset-2 hover:text-accent/80"
              >api.slack.com/apps</a>
              → App Configuration Tokens.
            </p>
          </div>
        </div>
        {#if !showConfigTokenForm}
          <button
            onclick={() => (showConfigTokenForm = true)}
            class="shrink-0 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            Add Token
          </button>
        {/if}
      </div>

      {#if showConfigTokenForm}
        <div class="mt-4 space-y-3">
          <div>
            <label for="config-token" class="block text-xs font-medium text-text-secondary mb-1">Config Token</label>
            <input
              id="config-token"
              type="password"
              bind:value={configToken}
              placeholder="xoxe.xoxp-..."
              class="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label for="refresh-token" class="block text-xs font-medium text-text-secondary mb-1">
              Refresh Token <span class="text-text-muted">(optional)</span>
            </label>
            <input
              id="refresh-token"
              type="password"
              bind:value={refreshToken}
              placeholder="xoxe-..."
              class="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div class="flex items-center gap-2">
            <button
              onclick={submitConfigToken}
              disabled={!configToken.trim()}
              class="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Token
            </button>
            <button
              onclick={() => {
                showConfigTokenForm = false;
                configToken = '';
                refreshToken = '';
              }}
              class="rounded-lg bg-surface-3 px-4 py-2 text-xs font-medium text-text-secondary hover:bg-surface-3/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="rounded-xl border-2 border-success/50 bg-success/5 p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-success">Config Token Active</p>
            <p class="mt-0.5 text-xs text-text-muted">Slack configuration token is configured and ready.</p>
          </div>
        </div>
        <button
          onclick={rotateConfigToken}
          class="shrink-0 rounded-lg bg-surface-3 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-3/80 transition-colors"
        >
          Rotate
        </button>
      </div>
    </div>
  {/if}

  <!-- Agents Section -->
  <div class="space-y-3">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Agents</h3>

    {#if data.agents.length === 0}
      <div class="rounded-xl border border-border-subtle bg-surface-1 p-8 text-center">
        <p class="text-sm text-text-muted">No agents configured</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each data.agents as agent}
          {@const key = agentKey(agent.companySlug, agent.name)}
          {@const isTokenFormOpen = expandedTokenAgent === key}

          <div class="rounded-xl border-2 {borderClass(agent.status)} bg-surface-1 p-5 transition-colors">
            <!-- Agent Header -->
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-xs font-bold text-accent">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold">{agent.name}</span>
                    <span class="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-text-muted">{agent.role}</span>
                  </div>
                  <p class="mt-0.5 text-xs text-text-muted">{agent.companyName}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full {statusDotClass(agent.status)}"></div>
                <span class="rounded-full px-2.5 py-0.5 text-[11px] font-medium {statusBadgeClasses(agent.status)}">
                  {statusLabel(agent.status)}
                </span>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {#if agent.workspace}
                <div class="rounded-lg bg-surface-2 px-4 py-3">
                  <div class="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Workspace</div>
                  <div class="mt-1 text-sm text-text-primary">{agent.workspace}</div>
                </div>
              {/if}
              {#if agent.defaultChannel}
                <div class="rounded-lg bg-surface-2 px-4 py-3">
                  <div class="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Default Channel</div>
                  <div class="mt-1 text-sm text-text-primary">#{agent.defaultChannel}</div>
                </div>
              {/if}
              <div class="rounded-lg bg-surface-2 px-4 py-3">
                <div class="text-[10px] font-semibold uppercase tracking-wider text-text-muted">App Token</div>
                <div class="mt-1 text-sm {agent.hasAppToken ? 'text-success' : 'text-text-muted'}">
                  {agent.hasAppToken ? 'Configured' : 'Missing'}
                </div>
              </div>
              <div class="rounded-lg bg-surface-2 px-4 py-3">
                <div class="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Bot Token</div>
                <div class="mt-1 text-sm {agent.hasBotToken ? 'text-success' : 'text-text-muted'}">
                  {agent.hasBotToken ? 'Configured' : 'Missing'}
                </div>
              </div>
            </div>

            <!-- Channels -->
            {#if agent.channels.length > 0}
              <div class="mt-3 rounded-lg bg-surface-2 px-4 py-3">
                <div class="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Channels</div>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  {#each agent.channels as channel}
                    <span class="rounded-md bg-surface-3 px-2 py-0.5 text-xs font-medium text-text-secondary">#{channel}</span>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Actions -->
            <div class="mt-4 flex flex-wrap items-center gap-2">
              {#if agent.status === 'not_created'}
                <button
                  onclick={() => createApp(agent.companySlug, agent.name)}
                  disabled={!data.hasConfigToken}
                  class="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={!data.hasConfigToken ? 'Add a config token first' : undefined}
                >
                  Create App
                </button>
              {/if}

              {#if agent.status === 'created' && agent.appId}
                <a
                  href="https://api.slack.com/apps/{agent.appId}/install-on-team"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-4 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  Install to Workspace
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              {/if}

              {#if agent.status === 'created' || agent.status === 'installed'}
                <button
                  onclick={() => toggleTokenForm(agent.companySlug, agent.name)}
                  class="rounded-lg bg-surface-3 px-4 py-2 text-xs font-medium text-text-secondary hover:bg-surface-3/80 transition-colors"
                >
                  {isTokenFormOpen ? 'Cancel' : 'Enter Tokens'}
                </button>
              {/if}

            </div>

            <!-- Inline Token Form -->
            {#if isTokenFormOpen}
              <div class="mt-4 rounded-lg border border-border-subtle bg-surface-2 p-4 space-y-3">
                <p class="text-xs font-medium text-text-secondary">Enter tokens for {agent.name}</p>
                <div>
                  <label for="app-token-{key}" class="block text-xs font-medium text-text-secondary mb-1">
                    App-Level Token
                    {#if agent.hasAppToken}
                      <span class="text-success">(configured)</span>
                    {/if}
                  </label>
                  <input
                    id="app-token-{key}"
                    type="password"
                    bind:value={appTokenInput}
                    placeholder="xapp-..."
                    class="w-full rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label for="bot-token-{key}" class="block text-xs font-medium text-text-secondary mb-1">
                    Bot Token
                    {#if agent.hasBotToken}
                      <span class="text-success">(configured)</span>
                    {/if}
                  </label>
                  <input
                    id="bot-token-{key}"
                    type="password"
                    bind:value={botTokenInput}
                    placeholder="xoxb-..."
                    class="w-full rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <button
                  onclick={() => submitTokens(agent.companySlug, agent.name)}
                  disabled={!appTokenInput.trim() && !botTokenInput.trim()}
                  class="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Tokens
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
