import * as React from "react"
import { createElement, cloneElement, useEffect, useRef } from "react"
import {
    Frame,
    addPropertyControls,
    ControlType,
    AnimatePresence,
    RenderTarget,
} from "framer"
import { useStore } from "./globalStore"
import { placeholderState } from "./placeholderState"
import { sanitizePropName } from "./sanitizePropName"
import { TRANSITIONS, DEFAULT_TWEEN, DEFAULT_SPRING } from "./transitions"
import { omit } from "./omit"
import { colors as thumbnailColors } from "./thumbnailStyles"
import { eventTriggerProps, eventTriggerPropertyControls } from "./controls"
import { extractEventHandlersFromProps } from "./extractEventHandlersFromProps"

// ------------------- Switch Component -------------------

export function Switch(props) {
    const {
        children,
        identifier = "",
        transition = "instant",
        overflow = true,
        initialState = 0,
        isInteractive,
        onSwitch,
        ...rest
    } = props

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return <SwitchThumbnail />
    }

    const [store, setStore] = useStore()
    const states = React.Children.toArray(children).map(c => c.props.name)
    const sanitizedIdentifier = sanitizePropName(identifier)
    const current =
        typeof store[sanitizedIdentifier] === "undefined"
            ? initialState
            : store[sanitizedIdentifier]

    // the current index ref will be used to calculate direction
    const currentIndexRef = useRef(current)
    const previous = currentIndexRef.current
    const atWrapBoundary =
        (previous === states.length - 1 && current === 0) ||
        (previous === 0 && current === states.length - 1)
    let direction = previous <= current ? 1 : -1

    // at the wrap boundary directions are intentionally reversed,
    // so that going from 0 to the last state looks like going back,
    // instead of going forward
    if (atWrapBoundary) {
        direction = -direction
    }
    currentIndexRef.current = current

    if (current !== previous && typeof onSwitch !== "undefined") {
        onSwitch(current, previous, sanitizedIdentifier)
    }

    const child = children[current]

    // update the state for this element if the user manually
    // changes the initial state from the property controls
    useEffect(() => {
        store[sanitizedIdentifier] = initialState
        setStore(store)
    }, [initialState])

    // store a registry of available states, so the SwitchToStateAction
    // instances can figure out what the next/previous state is
    useEffect(() => {
        store.__registry = {
            ...store.__registry,
            [identifier]: states,
        }
        setStore(store)
    }, [children])

    // if not connected to anything, show placeholder
    if (!child) {
        return createElement(placeholderState, {
            title: "No states",
            label: "Add views for each state by connecting them on the Canvas",
        })
    }

    // Extract event handlers from props
    let eventHandlers = {}
    if (isInteractive) {
        eventHandlers = extractEventHandlersFromProps(
            props,
            store,
            setStore,
            sanitizedIdentifier
        )
    }

    return (
        <Frame
            {...eventHandlers}
            {...omit(rest, eventTriggerProps)}
            background="transparent"
            size="100%"
            overflow={overflow ? "visible" : "hidden"}
        >
            {RenderTarget.current() === RenderTarget.preview && (
                <AnimatePresence initial={false} custom={direction}>
                    <Frame
                        key={child.key}
                        background={null}
                        size="100%"
                        {...TRANSITIONS[transition](
                            child.props,
                            props,
                            direction
                        )}
                    >
                        {child}
                    </Frame>
                </AnimatePresence>
            )}
            {RenderTarget.current() !== RenderTarget.preview && child}
        </Frame>
    )
}

Switch.defaultProps = {
    height: 240,
    width: 240,
}

// ------------------- Property Controls ------------------

addPropertyControls(Switch, {
    overflow: {
        type: ControlType.Boolean,
        title: "Overflow",
        defaultValue: true,
        enabledTitle: "Visible",
        disabledTitle: "Hidden",
    },

    children: {
        title: "States",
        type: ControlType.Array,
        propertyControl: {
            type: ControlType.ComponentInstance,
        },
    },

    identifier: {
        title: "Name",
        type: ControlType.String,
        defaultValue: "sharedSwitch",
    },

    initialState: {
        title: "Initial State",
        type: ControlType.Number,
        displayStepper: true,
        defaultValue: 0,
    },

    // Event Handling

    isInteractive: {
        title: "Interactive",
        type: ControlType.Boolean,
        enabledTitle: "Yes",
        disabledTitle: "No",
        defaultValue: false,
    },

    ...eventTriggerPropertyControls,

    // Transition Options

    transition: {
        title: "Transition",
        type: ControlType.Enum,
        options: [
            "instant",
            "dissolve",
            "zoom",
            "zoomout",
            "zoomin",
            "swapup",
            "swapdown",
            "swapleft",
            "swapright",
            "slidehorizontal",
            "slidevertical",
            "slideup",
            "slidedown",
            "slideleft",
            "slideright",
            "pushhorizontal",
            "pushvertical",
            "pushup",
            "pushdown",
            "pushleft",
            "pushright",
        ],
        optionTitles: [
            "Instant",
            "Dissolve",
            "Zoom (Direction-aware)",
            "Zoom Out",
            "Zoom In",
            "Swap ↑",
            "Swap ↓",
            "Swap ←",
            "Swap →",
            "Slide ←→ (Direction-aware)",
            "Slide ↑↓ (Direction-aware)",
            "Slide ↑",
            "Slide ↓",
            "Slide ←",
            "Slide →",
            "Push ←→ (Direction-aware)",
            "Push ↑↓ (Direction-aware)",
            "Push ↑",
            "Push ↓",
            "Push ←",
            "Push →",
        ],
        defaultValue: "instant",
    },

    transitionConfigType: {
        title: " ",
        type: ControlType.SegmentedEnum,
        options: ["default", "custom"],
        optionTitles: ["Default", "Custom"],
        defaultValue: "default",
        hidden: props => props.transition === "instant",
    },

    transitionType: {
        title: "Type",
        type: ControlType.Enum,
        options: ["spring", "tween"],
        optionTitles: ["Spring", "Tween"],
        defaultValue: "spring",
        hidden: props =>
            props.transition === "instant" ||
            props.transitionConfigType === "default",
    },

    damping: {
        title: "Damping",
        type: ControlType.Number,
        min: 0,
        max: 50,
        hidden: props =>
            props.transition === "instant" ||
            props.transitionType !== "spring" ||
            props.transitionConfigType === "default",
        defaultValue: DEFAULT_SPRING.damping,
    },

    mass: {
        title: "Mass",
        type: ControlType.Number,
        step: 0.1,
        min: 0,
        max: 5,
        hidden: props =>
            props.transition === "instant" ||
            props.transitionType !== "spring" ||
            props.transitionConfigType === "default",
        defaultValue: DEFAULT_SPRING.mass,
    },

    stiffness: {
        title: "Stiffness",
        type: ControlType.Number,
        min: 0,
        max: 1000,
        hidden: props =>
            props.transition === "instant" ||
            props.transitionType !== "spring" ||
            props.transitionConfigType === "default",
        defaultValue: DEFAULT_SPRING.stiffness,
    },

    duration: {
        title: "Duration",
        type: ControlType.Number,
        step: 0.1,
        min: 0,
        displayStepper: true,
        hidden: props =>
            props.transition === "instant" ||
            props.transitionType !== "tween" ||
            props.transitionConfigType === "default",
        defaultValue: DEFAULT_TWEEN.duration,
    },

    ease: {
        title: "Easing",
        type: ControlType.Enum,
        options: [
            "custom",
            "linear",
            "easeIn",
            "easeOut",
            "easeInOut",
            "circIn",
            "circOut",
            "circInOut",
            "backIn",
            "backOut",
            "backInOut",
            "anticipate",
        ],
        optionTitles: [
            "Custom",
            "linear",
            "easeIn",
            "easeOut",
            "easeInOut",
            "circIn",
            "circOut",
            "circInOut",
            "backIn",
            "backOut",
            "backInOut",
            "anticipate",
        ],
        hidden: props =>
            props.transition === "instant" ||
            props.transitionType !== "tween" ||
            props.transitionConfigType === "default",
        defaultValue: "easeOut",
    },

    customEase: {
        title: " ",
        type: ControlType.String,
        hidden: props =>
            props.transition === "instant" ||
            props.transitionType !== "tween" ||
            props.transitionConfigType === "default" ||
            props.ease !== "custom",
        defaultValue: "0.25, 0.1, 0.25, 1",
    },
})

// ---------------------- Thumbnail -----------------------

function SwitchThumbnail() {
    return (
        <Frame
            size="100%"
            borderRadius={32}
            border={`10px solid ${thumbnailColors.primary}`}
            background={thumbnailColors.background}
        >
            <Frame size={60} center scale={8} background="transparent">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
                    <path
                        d="M 20.593 28.22 C 20.593 27.799 20.935 27.458 21.356 27.458 L 24.915 27.458 C 25.336 27.458 25.678 27.799 25.678 28.22 L 25.678 31.78 C 25.678 32.201 25.336 32.542 24.915 32.542 L 21.356 32.542 C 20.935 32.542 20.593 32.201 20.593 31.78 Z"
                        fill="rgba(237, 123, 182, 1.00)"
                        stroke="rgba(237, 123, 182, 1.00)"
                    ></path>
                    <path
                        d="M 33.305 21.862 C 33.305 21.442 33.645 21.102 34.065 21.102 L 37.63 21.102 C 38.05 21.102 38.39 21.442 38.39 21.862 L 38.39 25.426 C 38.39 25.846 38.05 26.186 37.63 26.186 L 34.065 26.186 C 33.645 26.186 33.305 25.846 33.305 25.426 Z"
                        fill="rgba(237, 123, 182, 1.00)"
                        stroke="rgba(237, 123, 182, 1.00)"
                    ></path>
                    <path
                        d="M 33.305 36.61 C 33.305 35.066 34.557 33.814 36.102 33.814 L 36.102 33.814 C 37.646 33.814 38.898 35.066 38.898 36.61 L 38.898 36.61 C 38.898 38.155 37.646 39.407 36.102 39.407 L 36.102 39.407 C 34.557 39.407 33.305 38.155 33.305 36.61 Z"
                        fill="rgba(237, 123, 182, 1.00)"
                        stroke="rgba(237, 123, 182, 1.00)"
                    ></path>
                    <path
                        d="M 26.695 30 C 26.695 30 29.492 30.064 29.492 27.203 C 29.492 24.343 31.78 23.771 31.78 23.771"
                        fill="transparent"
                        stroke-width="0.76"
                        stroke="rgba(237, 123, 182, 1.00)"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    ></path>
                    <path
                        d="M 26.695 30.127 C 26.695 30.127 29.492 30.064 29.492 32.924 C 29.492 35.784 31.78 36.356 31.78 36.356"
                        fill="transparent"
                        stroke-width="0.76"
                        stroke="rgba(237, 123, 182, 1.00)"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    ></path>
                </svg>
            </Frame>
        </Frame>
    )
}
