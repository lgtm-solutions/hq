import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'hq_active_company';

function createActiveCompanyStore() {
  const initial = browser ? localStorage.getItem(STORAGE_KEY) ?? '' : '';
  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    update,
    set(slug: string) {
      set(slug);
      if (browser) {
        localStorage.setItem(STORAGE_KEY, slug);
      }
    },
    init(companies: { slug: string }[]) {
      // Set default to first company if not already set
      if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && companies.some((c) => c.slug === stored)) {
          set(stored);
          return;
        }
      }
      const fallback = companies[0]?.slug ?? '';
      set(fallback);
      if (browser) {
        localStorage.setItem(STORAGE_KEY, fallback);
      }
    },
  };
}

export const activeCompany = createActiveCompanyStore();
