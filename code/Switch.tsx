import * as React from "react"
import {
    createElement,
    useEffect,
    useRef,
    useState,
    useMemo,
    memo,
} from "react"
import { addCallback } from "reactn"
import {
    Frame,
    addPropertyControls,
    ControlType,
    AnimatePresence,
    RenderTarget,
    Size,
    ControlDescription,
} from "framer"
import hotkeys, { KeyHandler } from "hotkeys-js"
import { actions } from "./store/globalStore"
import { placeholderState } from "./placeholderState"
import { TRANSITIONS, DEFAULT_TWEEN, DEFAULT_SPRING } from "./transitions"
import { omit } from "./utils/omit"
import { colors as thumbnailColors } from "./thumbnailStyles"
import {
    eventTriggerProps,
    keyEventTriggerProps,
    automaticEventTriggerProps,
    eventTriggerPropertyControls,
    transitionPropertyControls,
} from "./controls"
import { extractEventHandlersFromProps } from "./utils/extractEventHandlersFromProps"
import { AutoAnimatedState } from "./AutoAnimatedState"
import { sanitizePropName } from "./utils/propNameHelpers"
import { randomID } from "./utils/randomID"

// ------------------- Switch Component -------------------

function _Switch(props) {
    const {
        children,
        autoAssignIdentifier,
        identifier = "",
        transition = "instant",
        overflow = true,
        initialState = 0,
        isInteractive,
        onSwitch,
        morphCodeComponentPropsOnly,
        ...rest
    } = props

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return <SwitchThumbnail />
    }

    const [currentStateIndex, setCurrentStateIndex] = useState(initialState)

    const [id, setId] = useState(autoAssignIdentifier ? randomID() : identifier)

    useEffect(() => {
        setId(autoAssignIdentifier ? randomID() : identifier)
    }, [autoAssignIdentifier, identifier])

    const {
        getSwitchStateIndex,
        getAllSwitchStates,
        setSwitchStateIndex,
        registerSwitchStates,
    } = actions

    const states = React.Children.toArray(children).map(c => c.props.name || "")
    const sanitizedIdentifier = sanitizePropName(id)
    const current =
        typeof currentStateIndex === "undefined"
            ? initialState
            : currentStateIndex

    // the current index ref will be used to calculate direction
    const currentIndexRef = useRef(current)
    const previousIndexRef = useRef(current)

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

    if (children[current]) {
        currentIndexRef.current = current
    } else if (children[previous]) {
        currentIndexRef.current = previous
    } else {
        currentIndexRef.current = initialState
    }

    // ensure that previousIndexRef always points to the true previous index
    // i.e. even if you re-render the same state, previousIndexRef won't change
    // this is needed to pass the correct source/target for AutoAnimatedState
    if (currentIndexRef.current !== previous) {
        previousIndexRef.current = previous
    }

    if (
        currentIndexRef.current !== previous &&
        typeof onSwitch !== "undefined"
    ) {
        onSwitch(currentIndexRef.current, previous, sanitizedIdentifier)
    }

    const child = children[currentIndexRef.current]

    useEffect(() => {
        return addCallback(({ __switch }) => {
            const updatedIndex = __switch[sanitizedIdentifier]
            if (currentIndexRef.current !== updatedIndex) {
                setCurrentStateIndex(updatedIndex)
            }
        })
    }, [sanitizedIdentifier])

    // update the state for this element if the user manually
    // changes the initial state from the property controls
    useEffect(() => {
        setSwitchStateIndex(sanitizedIdentifier, initialState)
    }, [initialState, sanitizedIdentifier])

    // store a registry of available states, so the SwitchToStateAction
    // instances can figure out what the next/previous state is
    useEffect(() => {
        registerSwitchStates(sanitizedIdentifier, states)
    }, [children, sanitizedIdentifier])

    // Extract event handlers from props
    // Note: extract runs hooks for some gesture-related events, so it's
    // important to NOT run it conditionally
    let [
        eventHandlers,
        keyEvents,
        automaticEvents,
    ] = extractEventHandlersFromProps(
        props,
        { getSwitchStateIndex, getAllSwitchStates, setSwitchStateIndex },
        sanitizedIdentifier
    )

    // reset the results of the previous call if this switch isn't interactive
    if (!isInteractive) {
        eventHandlers = {}
        keyEvents = []
        automaticEvents = []
    }

    const automaticEventProps = Object.keys(props)
        .filter(prop => automaticEventTriggerProps.indexOf(prop) !== -1)
        .map(prop => props[prop])

    // execute automatic (delay) event triggers
    useEffect(() => {
        if (RenderTarget.current() !== RenderTarget.preview) {
            return
        }

        const timeouts = automaticEvents.map(({ handler }) => handler())

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [...automaticEventProps, sanitizedIdentifier])

    // attach key event handlers
    const keyEventProps = Object.keys(props)
        .filter(prop => keyEventTriggerProps.indexOf(prop) !== -1)
        .map(prop => props[prop])

    useEffect(() => {
        if (RenderTarget.current() !== RenderTarget.preview) {
            return
        }

        keyEvents.forEach(({ hotkey, options, handler }) =>
            hotkeys(hotkey, options, handler as KeyHandler)
        )

        return () => {
            keyEvents.forEach(({ hotkey, handler }) =>
                hotkeys.unbind(hotkey, handler as KeyHandler)
            )
        }
    }, [...keyEventProps, sanitizedIdentifier])

    const transitionPropsForElement = ({
        source,
        sourceRect,
        target,
        transition,
        useAbsolutePositioning,
        transitionKey,
    }) => {
        if (transition === "enter") {
            return TRANSITIONS[props.enterTransition](source.props, props, {
                transitionKey,
                sourceRect,
                useAbsolutePositioning,
            })
        }

        if (transition === "exit") {
            return TRANSITIONS[props.exitTransition](source.props, props, {
                transitionKey,
                sourceRect,
                useAbsolutePositioning,
            })
        }

        if (
            transition === "cross-dissolve-enter" ||
            transition === "cross-dissolve-exit"
        ) {
            return TRANSITIONS.crossdissolve(source.props, props, {
                direction: transition,
            })
        }

        return TRANSITIONS.morph(source.props, props)
    }

    const size = useMemo(() => {
        if (child) {
            return Size(child.props.width, child.props.height)
        }
    }, [child])

    // if not connected to anything, show placeholder
    if (!child) {
        return createElement(placeholderState, {
            title: "No states",
            label: "Add views for each state by connecting them on the Canvas",
        })
    }

    if (RenderTarget.current() !== RenderTarget.preview) {
        return (
            <Frame
                {...eventHandlers}
                {...omit(rest, eventTriggerProps)}
                background="transparent"
                size="100%"
                overflow={overflow ? "visible" : "hidden"}
            >
                {child}
            </Frame>
        )
    }

    if (transition === "autoanimate") {
        return (
            <Frame
                {...eventHandlers}
                {...omit(rest, eventTriggerProps)}
                background="transparent"
                width="100%"
                height="100%"
                overflow={overflow ? "visible" : "hidden"}
            >
                <Frame background={null} width="100%" height="100%">
                    <AutoAnimatedState
                        source={children[previousIndexRef.current]}
                        target={children[currentIndexRef.current]}
                        transitionPropsForElement={transitionPropsForElement}
                        direction={direction}
                        sourceParentSize={size}
                        targetParentSize={size}
                        morphCodeComponentPropsOnly={
                            morphCodeComponentPropsOnly
                        }
                    />
                </Frame>
            </Frame>
        )
    }

    return (
        <Frame
            {...eventHandlers}
            {...omit(rest, eventTriggerProps)}
            background="transparent"
            width="100%"
            height="100%"
            overflow={overflow ? "visible" : "hidden"}
            style={{ zIndex: 0 }}
        >
            <AnimatePresence initial={false} custom={direction}>
                <Frame
                    key={child.key}
                    background={null}
                    width="100%"
                    height="100%"
                    {...TRANSITIONS[transition](child.props, props, direction)}
                >
                    {child}
                </Frame>
            </AnimatePresence>
        </Frame>
    )
}

const defaultProps = {
    overflow: true,
    autoAssignIdentifier: false,
    identifier: "sharedSwitch",
    initialState: 0,
    isInteractive: false,
    // Specifies how code components will be handled during auto-animate.
    // When this is true, the auto animator will try to preserve code component
    // instances between states and only throw new props at them. When it's false,
    // code components will cross-dissolve between instances in the source / target state.
    // Switch this to `false` with an override if code components don't seem to behave
    // as expected during auto animate transitions.
    morphCodeComponentPropsOnly: true,
    transition: "instant",
    transitionConfigType: "default",
    transitionType: "spring",
    enterTransition: "enterdissolve",
    enterTransitionConfigType: "default",
    enterTransitionType: "tween",
    exitTransition: "exitdissolve",
    exitTransitionConfigType: "default",
    exitTransitionType: "tween",
    damping: DEFAULT_SPRING.damping,
    mass: DEFAULT_SPRING.mass,
    stiffness: DEFAULT_SPRING.stiffness,
    duration: DEFAULT_TWEEN.duration,
    ease: "easeOut",
    customEase: "0.25, 0.1, 0.25, 1",
    enterDamping: DEFAULT_SPRING.damping,
    enterMass: DEFAULT_SPRING.mass,
    enterStiffness: DEFAULT_SPRING.stiffness,
    enterDuration: DEFAULT_TWEEN.duration,
    enterEase: "easeOut",
    enterCustomEase: "0.25, 0.1, 0.25, 1",
    exitDamping: DEFAULT_SPRING.damping,
    exitMass: DEFAULT_SPRING.mass,
    exitStiffness: DEFAULT_SPRING.stiffness,
    exitDuration: DEFAULT_TWEEN.duration,
    exitEase: "easeOut",
    exitCustomEase: "0.25, 0.1, 0.25, 1",
    staggerChildren: 0,
    delayChildren: 0,

    // Auto-generated from the following code:
    //
    // JSON.stringify(
    //     Object.keys(eventTriggerPropertyControls).reduce((res, prop) => {
    //         if ("defaultValue" in eventTriggerPropertyControls[prop]) {
    //             res[prop] = eventTriggerPropertyControls[prop].defaultValue
    //         }
    //         return res
    //     }, {})
    // )

    afterDelayAction: "unset",
    afterDelaySpecificIndex: 0,
    afterDelaySpecificName: "",
    afterDelayDelay: 0,
    onTapAction: "unset",
    onTapSpecificIndex: 0,
    onTapSpecificName: "",
    onTapStartAction: "unset",
    onTapStartSpecificIndex: 0,
    onTapStartSpecificName: "",
    onTapCancelAction: "unset",
    onTapCancelSpecificIndex: 0,
    onTapCancelSpecificName: "",
    onHoverStartAction: "unset",
    onHoverStartSpecificIndex: 0,
    onHoverStartSpecificName: "",
    onHoverEndAction: "unset",
    onHoverEndSpecificIndex: 0,
    onHoverEndSpecificName: "",
    onDragStartAction: "unset",
    onDragStartSpecificIndex: 0,
    onDragStartSpecificName: "",
    onDragEndAction: "unset",
    onDragEndSpecificIndex: 0,
    onDragEndSpecificName: "",
    onDoubleTapAction: "unset",
    onDoubleTapSpecificIndex: 0,
    onDoubleTapSpecificName: "",
    onLongPressAction: "unset",
    onLongPressSpecificIndex: 0,
    onLongPressSpecificName: "",
    onLongPressDuration: 0.5,
    onKeyDownAction: "unset",
    onKeyDownSpecificIndex: 0,
    onKeyDownSpecificName: "",
    onKeyDownKey: "",
    onKeyUpAction: "unset",
    onKeyUpSpecificIndex: 0,
    onKeyUpSpecificName: "",
    onKeyUpKey: "",
}

_Switch.defaultProps = {
    height: 240,
    width: 240,
    ...defaultProps,
}

_Switch.displayName = "Switch"
const __Switch = memo(_Switch)

export const Switch = props => <__Switch {...props} />

// ------------------- Property Controls ------------------

addPropertyControls(Switch, {
    overflow: {
        type: ControlType.Boolean,
        title: "Overflow",
        defaultValue: defaultProps.overflow,
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

    autoAssignIdentifier: {
        title: "Name",
        type: ControlType.Boolean,
        enabledTitle: "Auto",
        disabledTitle: "Set",
        defaultValue: defaultProps.autoAssignIdentifier,
    },

    identifier: {
        title: " ",
        type: ControlType.String,
        defaultValue: defaultProps.identifier,
        hidden: props => props.autoAssignIdentifier,
    },

    initialState: {
        title: "Initial State",
        type: ControlType.Number,
        displayStepper: true,
        defaultValue: defaultProps.initialState,
    },

    // Event Handling

    isInteractive: {
        title: "Interactive",
        type: ControlType.Boolean,
        enabledTitle: "Yes",
        disabledTitle: "No",
        defaultValue: defaultProps.isInteractive,
    },

    ...eventTriggerPropertyControls,

    // Transition Options

    transition: {
        title: "Transition",
        type: ControlType.Enum,
        options: [
            "instant",
            "autoanimate",
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
            "Auto Animate (Magic Move)",
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
        defaultValue: defaultProps.transition,
    },

    // -- start: default/morph transition options --

    transitionConfigType: {
        ...transitionPropertyControls.transitionConfigType,
        defaultValue: defaultProps["transitionConfigType"],
        hidden: props => props["transition"] === "instant",
    },

    transitionType: {
        ...transitionPropertyControls.transitionType,
        defaultValue: defaultProps["transitionType"],
        hidden: props =>
            props["transition"] === "instant" ||
            props["transitionConfigType"] === "default",
    },

    damping: {
        ...transitionPropertyControls.damping,
        hidden: props =>
            props["transition"] === "instant" ||
            props["transitionType"] !== "spring" ||
            props["transitionConfigType"] === "default",
        defaultValue: defaultProps["damping"],
    },

    mass: {
        ...transitionPropertyControls.mass,
        hidden: props =>
            props["transition"] === "instant" ||
            props["transitionType"] !== "spring" ||
            props["transitionConfigType"] === "default",
        defaultValue: defaultProps["mass"],
    },

    stiffness: {
        ...transitionPropertyControls.stiffness,
        hidden: props =>
            props["transition"] === "instant" ||
            props["transitionType"] !== "spring" ||
            props["transitionConfigType"] === "default",
        defaultValue: defaultProps["stiffness"],
    },

    duration: {
        ...transitionPropertyControls.duration,
        hidden: props =>
            props["transition"] === "instant" ||
            props["transitionType"] !== "tween" ||
            props["transitionConfigType"] === "default",
        defaultValue: defaultProps["duration"],
    },

    ease: {
        ...transitionPropertyControls.ease,
        hidden: props =>
            props["transition"] === "instant" ||
            props["transitionType"] !== "tween" ||
            props["transitionConfigType"] === "default",
        defaultValue: defaultProps["ease"],
    },

    customEase: {
        ...transitionPropertyControls.customEase,
        hidden: props =>
            props["transition"] === "instant" ||
            props["transitionType"] !== "tween" ||
            props["transitionConfigType"] === "default" ||
            props["ease"] !== "custom",
        defaultValue: defaultProps["customEase"],
    },

    // -- end: default/morph transition options --

    enterTransition: {
        title: "Enter Transition",
        type: ControlType.Enum,
        options: ["enterdissolve", "growdissolve", "enterInstant"],
        optionTitles: ["Dissolve", "Grow", "Instant"],
        defaultValue: defaultProps.enterTransition,
        hidden: props => props.transition !== "autoanimate",
    },

    // -- start: enter transition options

    enterTransitionConfigType: {
        ...transitionPropertyControls.transitionConfigType,
        defaultValue: defaultProps["transitionConfigType"],
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant",
    },

    enterTransitionType: {
        ...transitionPropertyControls.transitionType,
        defaultValue: defaultProps["transitionType"],
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant" ||
            props["enterTransitionConfigType"] === "default",
    },

    enterDamping: {
        ...transitionPropertyControls.damping,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant" ||
            props["enterTransitionType"] !== "spring" ||
            props["enterTransitionConfigType"] === "default",
        defaultValue: defaultProps["enterDamping"],
    },

    enterMass: {
        ...transitionPropertyControls.mass,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant" ||
            props["enterTransitionType"] !== "spring" ||
            props["enterTransitionConfigType"] === "default",
        defaultValue: defaultProps["enterMass"],
    },

    enterStiffness: {
        ...transitionPropertyControls.stiffness,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant" ||
            props["enterTransitionType"] !== "spring" ||
            props["enterTransitionConfigType"] === "default",
        defaultValue: defaultProps["enterStiffness"],
    },

    enterDuration: {
        ...transitionPropertyControls.duration,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant" ||
            props["enterTransitionType"] !== "tween" ||
            props["enterTransitionConfigType"] === "default",
        defaultValue: defaultProps["enterDuration"],
    },

    enterEase: {
        ...transitionPropertyControls.ease,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant" ||
            props["enterTransitionType"] !== "tween" ||
            props["enterTransitionConfigType"] === "default",
        defaultValue: defaultProps["enterEase"],
    },

    enterCustomEase: {
        ...transitionPropertyControls.customEase,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["enterTransition"] === "enterInstant" ||
            props["enterTransitionType"] !== "tween" ||
            props["enterTransitionConfigType"] === "default" ||
            props["enterEase"] !== "custom",
        defaultValue: defaultProps["enterCustomEase"],
    },

    // -- end: enter transition options

    exitTransition: {
        title: "Exit Transition",
        type: ControlType.Enum,
        options: ["exitdissolve", "shrinkdissolve", "exitInstant"],
        optionTitles: ["Dissolve", "Shrink", "Instant"],
        defaultValue: defaultProps.exitTransition,
        hidden: props => props.transition !== "autoanimate",
    },

    // -- start: exit transition options

    exitTransitionConfigType: {
        ...transitionPropertyControls.transitionConfigType,
        defaultValue: defaultProps["transitionConfigType"],
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant",
    },

    exitTransitionType: {
        ...transitionPropertyControls.transitionType,
        defaultValue: defaultProps["transitionType"],
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant" ||
            props["exitTransitionConfigType"] === "default",
    },

    exitDamping: {
        ...transitionPropertyControls.damping,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant" ||
            props["exitTransitionType"] !== "spring" ||
            props["exitTransitionConfigType"] === "default",
        defaultValue: defaultProps["exitDamping"],
    },

    exitMass: {
        ...transitionPropertyControls.mass,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant" ||
            props["exitTransitionType"] !== "spring" ||
            props["exitTransitionConfigType"] === "default",
        defaultValue: defaultProps["exitMass"],
    },

    exitStiffness: {
        ...transitionPropertyControls.stiffness,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant" ||
            props["exitTransitionType"] !== "spring" ||
            props["exitTransitionConfigType"] === "default",
        defaultValue: defaultProps["exitStiffness"],
    },

    exitDuration: {
        ...transitionPropertyControls.duration,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant" ||
            props["exitTransitionType"] !== "tween" ||
            props["exitTransitionConfigType"] === "default",
        defaultValue: defaultProps["exitDuration"],
    },

    exitEase: {
        ...transitionPropertyControls.ease,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant" ||
            props["exitTransitionType"] !== "tween" ||
            props["exitTransitionConfigType"] === "default",
        defaultValue: defaultProps["exitEase"],
    },

    exitCustomEase: {
        ...transitionPropertyControls.customEase,
        hidden: props =>
            props["transition"] !== "autoanimate" ||
            props["exitTransition"] === "exitInstant" ||
            props["exitTransitionType"] !== "tween" ||
            props["exitTransitionConfigType"] === "default" ||
            props["exitEase"] !== "custom",
        defaultValue: defaultProps["exitCustomEase"],
    },

    // -- end: exit transition options

    staggerChildren: {
        title: "Stagger",
        type: ControlType.Number,
        displayStepper: true,
        step: 0.01,
        unit: "s",
        defaultValue: defaultProps.staggerChildren,
        hidden: props => props.transition !== "autoanimate",
    },

    delayChildren: {
        title: "Delay",
        type: ControlType.Number,
        displayStepper: true,
        step: 0.1,
        unit: "s",
        defaultValue: defaultProps.delayChildren,
        hidden: props => props.transition !== "autoanimate",
    },
} as { [key: string]: ControlDescription })

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
