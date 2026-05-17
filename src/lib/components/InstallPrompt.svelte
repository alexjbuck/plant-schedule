<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  type BeforeInstallEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };

  const DISMISSED_KEY = 'plant-schedule:install-dismissed';

  let event: BeforeInstallEvent | null = $state(null);
  let dismissed = $state(false);

  onMount(() => {
    if (!browser) return;
    if (localStorage.getItem(DISMISSED_KEY) === '1') {
      dismissed = true;
    }
    const onBefore = (e: Event) => {
      e.preventDefault();
      event = e as BeforeInstallEvent;
    };
    window.addEventListener('beforeinstallprompt', onBefore);
    return () => window.removeEventListener('beforeinstallprompt', onBefore);
  });

  async function install() {
    if (!event) return;
    await event.prompt();
    const result = await event.userChoice;
    event = null;
    if (result.outcome === 'dismissed') {
      localStorage.setItem(DISMISSED_KEY, '1');
      dismissed = true;
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    dismissed = true;
  }
</script>

{#if event && !dismissed}
  <aside
    class="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md flex-wrap items-center gap-3
      rounded-card border border-sage/30 bg-cream-soft p-3 shadow-lg
      dark:border-sage-dark/40 dark:bg-charcoal-soft"
  >
    <div class="flex-1 text-sm">
      <p class="font-medium text-moss dark:text-cream">Install Plant Schedule</p>
      <p class="text-xs text-moss-light dark:text-cream-soft">
        Add to home screen for offline garden notes.
      </p>
    </div>
    <button
      type="button"
      onclick={install}
      class="rounded-card bg-terracotta px-3 py-1.5 text-sm font-medium text-cream hover:bg-terracotta-soft"
    >
      Install
    </button>
    <button
      type="button"
      onclick={dismiss}
      aria-label="Dismiss install prompt"
      class="text-sm text-moss-light hover:text-moss dark:text-cream-soft"
    >
      Not now
    </button>
  </aside>
{/if}
