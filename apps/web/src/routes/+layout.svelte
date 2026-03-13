<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  let { children } = $props();

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
    }
  ];

  function isActive(href: string): boolean {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname.startsWith(href);
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
