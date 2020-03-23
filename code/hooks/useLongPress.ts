import { useCallback, useRef } from "react"

export function useLongPress(
    callback: (e: MouseEvent | TouchEvent) => void,
    duration: number = 500
) {
    // This will be a reference to our `setTimeout` counter, so we can clear it
    // if the user moves or releases their pointer.
    const timeout = useRef(null)

    // Create an event handler for mouse down and touch start events. We wrap the
    // handler in the `useCallback` hook and pass `callback` and `duration` as
    // dependencies so it only creates a new callback if either of these changes.
    const onPressStart = useCallback(
        (event: MouseEvent | TouchEvent) => {
            // Prevent the browser's default response to this event. On mobile browsers
            // long presses are used . This will also block touch scrolling - a more
            // robust implementation will take this into account, but this is fine
            // for prototyping.
            event.preventDefault()

            // Start a timeout that, after the provided `duration`, will fire the
            // supplied callbacl.
            timeout.current = setTimeout(() => callback(event), duration)
        },
        [callback, duration]
    )

    // This function, when called, will cancel the timeout and thus end the
    // gesture. We provide an empty dependency array as we never want this
    // function to change for the lifecycle of the component.
    const cancelTimeout = useCallback(() => clearTimeout(timeout.current), [])

    return {
        // Initiate the gesture on mouse down or touch start
        onMouseDown: onPressStart,
        onTouchStart: onPressStart,

        // Cancel the gesture if the pointer is moved. This is quite an aggressive
        // approach so you might want to make an alternative function here that
        // detects how far the pointer has moved from its origin using `e.pageX`
        // for `MouseEvent`s or `e.touches[0].pageX` for `TouchEvent`s.
        onMouseMove: cancelTimeout,
        onTouchMove: cancelTimeout,

        // Cancel the timeout when the pointer session is ended.
        onMouseUp: cancelTimeout,
        onTouchEnd: cancelTimeout,
    }
}
