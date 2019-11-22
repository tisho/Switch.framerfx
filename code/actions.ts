export function handleTrigger(store, setStore, target, action, targetState) {
    if (target === "") return

    const current = store[target]
    const states =
        store.__registry && store.__registry[target]
            ? store.__registry[target]
            : []

    if (action === "specific") {
        store[target] = targetState
    }

    if (action === "next") {
        store[target] = current + 1 >= states.length ? 0 : current + 1
    }

    if (action === "previous") {
        store[target] = current - 1 < 0 ? states.length - 1 : current - 1
    }

    setStore(store)
}
