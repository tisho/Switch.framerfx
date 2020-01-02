import {
    eventTriggerNames,
    keyEventTriggerNames,
    automaticEventTriggerNames,
} from "../controls"
import { handleTrigger } from "../actions"
import { getGlobal } from "reactn"

type EventHandlers = {
    [key: string]: Function
}

type KeyEventOptions = { keyup?: boolean; keydown?: boolean }
type KeyEvent = {
    hotkey: string
    options: KeyEventOptions
    handler: Function
}

type AutomaticEvent = {
    delay: number
    handler: Function
}

export function extractEventHandlersFromProps(
    props,
    switchControls,
    sanitizedIdentifier
): [EventHandlers, KeyEvent[], AutomaticEvent[]] {
    const keyEvents = []
    const automaticEvents = []
    const eventHandlers = eventTriggerNames.reduce((handlers, event) => {
        const action = props[`${event}Action`]
        const handler = (...args) => {
            // execute any existing handlers
            // key events are excluded here, because they're handled in a
            // separate event handler
            if (
                keyEventTriggerNames.indexOf(event) === -1 &&
                props[event] &&
                typeof props[event] === "function"
            ) {
                props[event](...args)
            }

            if (action !== "unset") {
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
                    action === "specific-name"
                        ? props[`${event}SpecificName`]
                        : props[`${event}SpecificIndex`]
                )
            }
        }

        if (keyEventTriggerNames.indexOf(event) !== -1) {
            // preserve onKey* handler overrides
            handlers[event] = (...args) => {
                // execute any existing handlers
                if (props[event] && typeof props[event] === "function") {
                    props[event](...args)
                }
            }

            if (action !== "unset") {
                const hotkey = props[`${event}Key`].trim()
                if (hotkey !== "") {
                    const options: KeyEventOptions = {
                        keydown: true,
                        keyup: false,
                    }
                    if (event === "onKeyUp") {
                        options.keyup = true
                        options.keydown = false
                    }
                    if (event === "onKeyDown") {
                        options.keyup = false
                        options.keydown = true
                    }
                    keyEvents.push({ hotkey, options, handler })
                }
            }
        } else if (automaticEventTriggerNames.indexOf(event) !== -1) {
            if (action !== "unset") {
                const delay = props[`${event}Delay`]
                const delayedHandler = () => {
                    setTimeout(handler, delay * 1000)
                }
                automaticEvents.push({ delay, handler: delayedHandler })
            }
        } else {
            handlers[event] = handler
        }
        return handlers
    }, {})

    return [eventHandlers, keyEvents, automaticEvents]
}
