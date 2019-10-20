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

// ------------------- Switch Component -------------------

export function Switch(props) {
    const {
        children,
        identifier = "",
        transition = "instant",
        overflow = true,
        initialState = 0,
        ...rest
    } = props
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

    // decorate the desired state with additional transition props
    // that will tell it how to animate its entry/exit
    const childWithPresenceProps = cloneElement(child, {
        ...child.props,
        key: child.props.id,
        ...TRANSITIONS[transition](child.props, props, direction),
    })

    return (
        <Frame
            {...rest}
            background="transparent"
            size="100%"
            overflow={overflow ? "visible" : "hidden"}
        >
            {RenderTarget.current() === RenderTarget.preview && (
                <AnimatePresence initial={false} custom={direction}>
                    {childWithPresenceProps}
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
