<script>
  import '../app.css';
  let { children } = $props();
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
  <nav class="border-b border-zinc-800 px-6 py-4">
    <div class="flex items-center gap-6">
      <a href="/" class="text-lg font-bold">HQ</a>
      <a href="/projects" class="text-sm text-zinc-400 hover:text-zinc-100">Projects</a>
    </div>
  </nav>
  <main class="mx-auto max-w-4xl px-6 py-8">
    {@render children()}
  </main>
</div>
