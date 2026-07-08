// A tiny in-memory collection for the BFF services. No real downstream exists yet
// (ARCHITECTURE.md: "build against the MSW mock harness / seed"), so Phase 3's build
// surfaces read — and lightly write — against a seed held in process. Each service owns
// one store; when a real backend arrives this becomes a downstream client and the router
// contract above it never changes.

export interface Store<T extends { id: string }> {
  list(): T[];
  get(id: string): T | undefined;
  create(entity: T): T;
  /** Merge a partial patch into an existing item; returns the updated item, or undefined if the id is unknown. */
  update(id: string, patch: Partial<T>): T | undefined;
  /** Restore the original seed — re-seeds dev data and isolates tests. */
  reset(): void;
}

export function createStore<T extends { id: string }>(seed: () => T[]): Store<T> {
  let items = seed();
  return {
    list: () => items,
    get: (id) => items.find((item) => item.id === id),
    create: (entity) => {
      items = [...items, entity];
      return entity;
    },
    update: (id, patch) => {
      const current = items.find((item) => item.id === id);
      if (!current) return undefined;
      const next = { ...current, ...patch };
      items = items.map((item) => (item.id === id ? next : item));
      return next;
    },
    reset: () => {
      items = seed();
    },
  };
}
