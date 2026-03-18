<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { activeCompany } from '$lib/stores/company';
  let { data, children } = $props();

  let companyOpen = $state(false);

  // Initialize store with companies from config
  $effect(() => {
    activeCompany.init(data.companies);
  });

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1'
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
    },
    {
      href: '/tasks',
      label: 'Tasks',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      href: '/agents',
      label: 'Agents',
      icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
    },
    {
      href: '/integrations',
      label: 'Integrations',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
    },
    {
      href: '/config',
      label: 'Config',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ];

  function isActive(href: string): boolean {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname.startsWith(href);
  }

  let activeCompanyName = $derived(
    data.companies.find((c: { slug: string }) => c.slug === $activeCompany)?.name ?? $activeCompany
  );

  function switchCompany(slug: string) {
    companyOpen = false;
    activeCompany.set(slug);
  }
</script>

<div class="flex h-screen bg-surface-0 text-text-primary">
  <!-- Sidebar -->
  <aside class="flex w-60 flex-col border-r border-border-subtle bg-surface-1">
    <!-- Logo -->
    <div class="flex h-14 items-center gap-2.5 border-b border-border-subtle px-5">
      <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
        H
      </div>
      <span class="text-sm font-semibold tracking-tight">HQ Mission Control</span>
    </div>

    <!-- Company selector -->
    <div class="relative border-b border-border-subtle px-3 py-2">
      <button
        onclick={() => companyOpen = !companyOpen}
        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <div class="flex items-center gap-2 min-w-0">
          <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/20 text-[10px] font-bold text-accent">
            {(activeCompanyName ?? '?').charAt(0).toUpperCase()}
          </div>
          <span class="truncate font-medium text-text-primary">{activeCompanyName}</span>
        </div>
        <svg class="h-4 w-4 shrink-0 text-text-muted transition-transform {companyOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {#if companyOpen}
        <div class="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-border-subtle bg-surface-2 py-1 shadow-lg">
          {#each data.companies as company}
            <button
              onclick={() => switchCompany(company.slug)}
              class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-3 transition-colors cursor-pointer {company.slug === $activeCompany ? 'text-accent' : 'text-text-secondary'}"
            >
              <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/20 text-[10px] font-bold {company.slug === $activeCompany ? 'text-accent' : 'text-text-muted'}">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <span class="truncate">{company.name}</span>
              {#if company.slug === $activeCompany}
                <svg class="ml-auto h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
      {#each navItems as item}
        <a
          href={item.href}
          class="nav-link flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium {isActive(item.href) ? 'active' : 'text-text-secondary hover:text-text-primary'}"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
          </svg>
          {item.label}
        </a>
      {/each}
    </nav>

    <!-- Bottom section -->
    <div class="border-t border-border-subtle px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-success pulse-dot"></div>
        <span class="text-xs text-text-muted">System Online</span>
      </div>
    </div>
  </aside>

  <!-- Main content area -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Top bar -->
    <header class="flex h-14 items-center border-b border-border-subtle px-6">
      <div class="flex items-center gap-3">
        {#if page.url.pathname === '/'}
          <h1 class="text-sm font-medium">Dashboard</h1>
        {:else if page.url.pathname === '/projects'}
          <h1 class="text-sm font-medium">Projects</h1>
        {:else if page.url.pathname === '/projects/new'}
          <h1 class="text-sm font-medium">
            <a href="/projects" class="text-text-muted hover:text-text-secondary">Projects</a>
            <span class="text-text-muted mx-1.5">/</span>
            New
          </h1>
        {:else if page.url.pathname.startsWith('/projects/')}
          <h1 class="text-sm font-medium">
            <a href="/projects" class="text-text-muted hover:text-text-secondary">Projects</a>
            <span class="text-text-muted mx-1.5">/</span>
            Details
          </h1>
        {:else if page.url.pathname === '/companies'}
          <h1 class="text-sm font-medium">Companies</h1>
        {:else if page.url.pathname.match(/^\/companies\/[^/]+\/agents\//)}
          <h1 class="text-sm font-medium">
            <a href="/companies" class="text-text-muted hover:text-text-secondary">Companies</a>
            <span class="text-text-muted mx-1.5">/</span>
            <a href="/companies/{page.url.pathname.split('/')[2]}" class="text-text-muted hover:text-text-secondary">Company</a>
            <span class="text-text-muted mx-1.5">/</span>
            Agent
          </h1>
        {:else if page.url.pathname.startsWith('/companies/')}
          <h1 class="text-sm font-medium">
            <a href="/companies" class="text-text-muted hover:text-text-secondary">Companies</a>
            <span class="text-text-muted mx-1.5">/</span>
            Details
          </h1>
        {:else if page.url.pathname === '/agents'}
          <h1 class="text-sm font-medium">Agents</h1>
        {:else if page.url.pathname === '/integrations/slack'}
          <h1 class="text-sm font-medium">
            <a href="/integrations" class="text-text-muted hover:text-text-secondary">Integrations</a>
            <span class="text-text-muted mx-1.5">/</span>
            Slack
          </h1>
        {:else if page.url.pathname === '/config'}
          <h1 class="text-sm font-medium">Config</h1>
        {:else if page.url.pathname === '/integrations'}
          <h1 class="text-sm font-medium">Integrations</h1>
        {:else if page.url.pathname === '/tasks'}
          <h1 class="text-sm font-medium">Tasks</h1>
        {:else if page.url.pathname === '/tasks/new'}
          <h1 class="text-sm font-medium">
            <a href="/tasks" class="text-text-muted hover:text-text-secondary">Tasks</a>
            <span class="text-text-muted mx-1.5">/</span>
            New
          </h1>
        {:else if page.url.pathname.startsWith('/tasks/')}
          <h1 class="text-sm font-medium">
            <a href="/tasks" class="text-text-muted hover:text-text-secondary">Tasks</a>
            <span class="text-text-muted mx-1.5">/</span>
            Details
          </h1>
        {/if}
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1 overflow-y-auto p-6">
      <div class="mx-auto max-w-5xl">
        {@render children()}
      </div>
    </main>
  </div>
</div>
