<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { prefs } from '$lib/prefs.svelte';
  import InstallPrompt from '$lib/components/InstallPrompt.svelte';

  let { children } = $props();

  const PREFS_KEY = 'plant-schedule:prefs:v1';

  $effect(() => {
    if (!browser) return;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs.toJSON()));
  });

  let resolvedTheme = $derived.by(() => {
    if (prefs.theme !== 'auto') return prefs.theme;
    if (!browser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  $effect(() => {
    if (!browser) return;
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.dataset.theme = resolvedTheme;
  });
</script>

<div class="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 sm:px-6">
  {@render children()}
</div>
<InstallPrompt />
