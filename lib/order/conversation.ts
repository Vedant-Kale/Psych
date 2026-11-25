const KEY = 'psych-conversation';

/** One random id per browser tab: kept in sessionStorage (gone when the tab closes), never in a cookie. */
export function conversationId(): string {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage blocked: the order still works, it just isn't remembered between orders.
    return crypto.randomUUID();
  }
}
