import { eventTriggerNames } from "./controls"
import { handleTrigger } from "./actions"

export function extractEventHandlersFromProps(
    props,
    store,
    setStore,
    sanitizedIdentifier
) {
    return eventTriggerNames.reduce((handlers, event) => {
        const action = props[event]
        if (action !== "unset") {
            handlers[event] = () =>
                handleTrigger(
                    store,
                    setStore,
                    sanitizedIdentifier,
                    action,
                    props[`${event}SpecificIndex`]
                )
        }
        return handlers
    }, {})
}
