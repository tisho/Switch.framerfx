import { eventTriggerNames } from "./controls"
import { handleTrigger } from "./actions"

export function extractEventHandlersFromProps(
    props,
    switchControls,
    sanitizedIdentifier
) {
    return eventTriggerNames.reduce((handlers, event) => {
        const action = props[`${event}Action`]
        if (action !== "unset") {
            handlers[event] = (...args) => {
                // execute any existing handlers
                if (props[event] && typeof props[event] === "function") {
                    props[event](...args)
                }

                // check if a trigger condition has been passed in
                if (
                    "shouldTrigger" in props &&
                    typeof props.shouldTrigger === "function" &&
                    !props.shouldTrigger(...args)
                ) {
                    // block trigger, because shouldTrigger returned a falsy value
                    return
                }

                handleTrigger(
                    switchControls,
                    sanitizedIdentifier,
                    action,
                    props[`${event}SpecificIndex`]
                )
            }
        }
        return handlers
    }, {})
}
