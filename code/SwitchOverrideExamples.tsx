import { Override, useAnimation } from "framer"
import { useSwitch } from "./"

export function UnlockSlider(): Override {
    const controls = useAnimation()
    const dragThreshold = 200

    return {
        animate: controls,
        drag: "x",
        dragElastic: false,
        dragMomentum: false,
        dragConstraints: { left: 0, right: 200 },
        onDragEnd: (e, { point }) => {
            // animate the slider to the start if it hasn't reached the
            // drag threshold
            if (point.x < dragThreshold) {
                controls.start({ x: 0 })
            }
        },

        // Only allow the SwitchToState action to trigger if the slider
        // has reached the drag threshold (200px to the right)
        shouldTrigger: (e, { point }) => point.x >= dragThreshold,
    }
}

export function ScaleDown(): Override {
    return {
        whileTap: { scale: 0.8 },
    }
}

export function ExternalSwitchControl(): Override {
    const controls = useSwitch()

    return {
        onTap: () => {
            controls.setSwitchState("sharedFancyTabNav", "Middle Focused")
        },
    }
}
