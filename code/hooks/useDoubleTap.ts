// code from https://github.com/framer/snippets/blob/master/gestures/Double%20tap.md
import { useRef } from "react"

export function useDoubleTap(
    callback: (e: MouseEvent | TouchEvent) => void,
    timeout: number = 300 // ms
) {
    // Maintain the previous timestamp in a ref so it persists between renders
    const prevTapTimestamp = useRef(0)

    // Returns a function that will only fire the provided `callback` if it's
    // fired twice within the defined `timeout`.
    return (e: MouseEvent | TouchEvent) => {
        // performance.now() is a browser-specific function that returns the
        // current timestamp in milliseconds
        const tapTimestamp = performance.now()

        // We can get the time since the previous click by subtracting it from
        // the current timestamp. If that duration is than `timeout`, fire our callback
        if (tapTimestamp - prevTapTimestamp.current <= timeout) {
            callback(e)

            // Reset the previous timestamp to `0` to prevent users triggering
            // further double taps by tapping in rapid succession
            prevTapTimestamp.current = 0
        } else {
            // Otherwise update the previous timestamp to the latest timestamp.
            prevTapTimestamp.current = tapTimestamp
        }
    }
}
