import {
    eventTriggerNames,
    keyEventTriggerNames,
    automaticEventTriggerNames,
    isCustomEvent,
} from "../controls"
import { handleTrigger } from "../actions"
import { useDoubleTap } from "../hooks/useDoubleTap"
import { useLongPress } from "../hooks/useLongPress"

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

    const eventHandlers = {}

    eventTriggerNames
        .reduce((handlers, event) => {
            const action = props[`${event}Action`]

            if (!isCustomEvent(event)) {
                const handlerFromProps = (...args) => {
                    // execute any existing handlers
                    if (props[event] && typeof props[event] === "function") {
                        props[event](...args)
                    }
                }

                mergeEvents(handlers, { [event]: handlerFromProps })
            }

            const handler = (...args) => {
                // execute any existing handlers if this is a custom event (like a gesture or delay)
                if (
                    isCustomEvent(event) &&
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
                if (action !== "unset") {
                    const hotkey = (props[`${event}Key`] || "").trim()
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
            } else if (event === "onDoubleTap") {
                const onTap = useDoubleTap(handler)

                mergeEvents(handlers, { onTap })
            } else if (event === "onLongPress") {
                const duration = props[`onLongPressDuration`] * 1000
                const gestures = useLongPress(handler, duration)

                mergeEvents(handlers, gestures)
            } else {
                mergeEvents(handlers, { [event]: handler })
            }

            return handlers
        }, new Map<string, Function[]>())
        .forEach((handlers, event) => {
            eventHandlers[event] = createEventHandlerSequence(...handlers)
        })

    return [eventHandlers, keyEvents, automaticEvents]
}

function mergeEvents(
    map: Map<string, Function[]>,
    events: { [key: string]: Function }
) {
    for (let e in events) {
        if (events.hasOwnProperty(e)) {
            map.set(e, [...(map.get(e) || []), events[e]])
        }
    }
}

function createEventHandlerSequence(...handlers) {
    return (...args) => {
        for (let handler of handlers) {
            if (typeof handler === "function") {
                handler(...args)
            }
        }
    }
}
