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

    if (action === "specific-name") {
        const index = states.indexOf(targetState)
        if (index !== -1) {
            setSwitchStateIndex(target, index)
        } else {
            console.warn(
                `<Switch> Requested state name "${targetState}" wasn't found in the list of available states for this instance: ${states.join(
                    ", "
                )}.\nMake sure the name matches the name of the state in the Layers panel exactly.`
            )
        }
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
