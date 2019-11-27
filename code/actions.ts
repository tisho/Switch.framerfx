export function handleTrigger(
    { getSwitchStateIndex, getAllSwitchStates, setSwitchStateIndex },
    target,
    action,
    targetState
) {
    if (target === "") return

    const current = getSwitchStateIndex(target)
    const states = getAllSwitchStates(target)

    if (action === "specific") {
        setSwitchStateIndex(target, targetState)
    }

    if (action === "next") {
        setSwitchStateIndex(
            target,
            current + 1 >= states.length ? 0 : current + 1
        )
    }

    if (action === "previous") {
        setSwitchStateIndex(
            target,
            current - 1 < 0 ? states.length - 1 : current - 1
        )
    }
}
