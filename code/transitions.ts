import { prefixPropName } from "./utils/propNameHelpers"
import { getOpacity } from "./utils/styleParsing"

const EASINGS = {
    linear: "linear",
    easeIn: "easeIn",
    easeOut: "easeOut",
    easeInOut: "easeInOut",
    easeInSine: [0.47, 0, 0.745, 0.715],
    easeOutSine: [0.39, 0.575, 0.565, 1],
    easeInOutSine: [0.445, 0.05, 0.55, 0.95],
    easeInQuad: [0.55, 0.085, 0.68, 0.53],
    easeOutQuad: [0.25, 0.46, 0.45, 0.94],
    easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
    easeInCubic: [0.55, 0.055, 0.675, 0.19],
    easeOutCubic: [0.215, 0.61, 0.355, 1],
    easeInOutCubic: [0.645, 0.045, 0.355, 1],
    easeInQuart: [0.895, 0.03, 0.685, 0.22],
    easeOutQuart: [0.165, 0.84, 0.44, 1],
    easeInOutQuart: [0.77, 0, 0.175, 1],
    easeInQuint: [0.755, 0.05, 0.855, 0.06],
    easeOutQuint: [0.23, 1, 0.32, 1],
    easeInOutQuint: [0.86, 0, 0.07, 1],
    easeInExpo: [0.95, 0.05, 0.795, 0.035],
    easeOutExpo: [0.19, 1, 0.22, 1],
    easeInOutExpo: [1, 0, 0, 1],
    circIn: "circIn",
    circOut: "circOut",
    circInOut: "circInOut",
    backIn: "backIn",
    backOut: "backOut",
    backInOut: "backInOut",
    anticipate: "anticipate",
}

export const transitionOptionsFromProps = (props, prefix = null) => {
    const getProp = n => props[prefixPropName(n, prefix)]
    const type = getProp("transitionType")

    if (type === "tween") {
        return {
            type: "tween",
            duration: getProp("duration"),
            ease:
                getProp("ease") === "custom"
                    ? getProp("customEase")
                          .split(/,\s+/)
                          .map(parseFloat)
                    : EASINGS[getProp("ease")],
        }
    }

    if (type === "spring") {
        return {
            type: "spring",
            damping: getProp("damping"),
            mass: getProp("mass"),
            stiffness: getProp("stiffness"),
            velocity: 0,
        }
    }

    return DEFAULT_SPRING
}

export const DEFAULT_SPRING = {
    type: "spring",
    damping: 45,
    mass: 1,
    stiffness: 500,
}
export const DEFAULT_TWEEN = { type: "tween", ease: "easeInOut", duration: 0.3 }

export const TRANSITIONS = {
    instant: (childProps, containerProps) => ({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { type: "tween", ease: "linear", duration: 0 },
    }),
    dissolve: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: [1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_TWEEN
                : transitionOptionsFromProps(containerProps),
    }),
    zoom: (
        childProps,
        { transitionConfigType, ...containerProps },
        direction
    ) => ({
        variants: {
            initial:
                direction === 1
                    ? { opacity: 0, scale: 1.15, zIndex: 0 }
                    : { opacity: 0, scale: 0.85, zIndex: 1 },
            enter: { opacity: [1, 1], scale: 1 },
            exit: direction =>
                direction === 1
                    ? { scale: 0.85, opacity: 0, zIndex: 0 }
                    : { opacity: 0, scale: 1.15, zIndex: 1 },
        },
        initial: "initial",
        animate: "enter",
        exit: "exit",
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    zoomout: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { opacity: 0, scale: 1.15 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.85 },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    zoomin: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.15 },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    swapup: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { y: containerProps.height },
        animate: { y: 0 },
        exit: { y: containerProps.height },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    swapdown: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { y: -containerProps.height },
        animate: { y: 0 },
        exit: { y: -containerProps.height },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    swapleft: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { x: -containerProps.width },
        animate: { x: 0 },
        exit: { x: -containerProps.width },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    swapright: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { x: containerProps.width },
        animate: { x: 0 },
        exit: { x: containerProps.width },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    slidehorizontal: (
        childProps,
        { transitionConfigType, ...containerProps },
        direction
    ) => ({
        variants: {
            initial:
                direction === 1
                    ? { x: containerProps.width, zIndex: 1 }
                    : { x: 0, zIndex: 0 },
            enter: { x: 0, opacity: 1 },
            exit: direction => {
                return direction === -1
                    ? { x: containerProps.width, zIndex: 1 }
                    : { opacity: [1, 1, 0], zIndex: 0 }
            },
        },
        initial: "initial",
        animate: "enter",
        exit: "exit",
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    slidevertical: (
        childProps,
        { transitionConfigType, ...containerProps },
        direction
    ) => ({
        variants: {
            initial:
                direction === 1
                    ? { y: containerProps.height, zIndex: 1 }
                    : { y: 0, zIndex: 0 },
            enter: { y: 0, opacity: 1 },
            exit: direction => {
                return direction === -1
                    ? { y: containerProps.height, zIndex: 1 }
                    : { opacity: [1, 1, 0], zIndex: 0 }
            },
        },
        initial: "initial",
        animate: "enter",
        exit: "exit",
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    slideup: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { y: containerProps.height },
        animate: { y: 0 },
        exit: { opacity: [1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    slidedown: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { y: -containerProps.height },
        animate: { y: 0 },
        exit: { opacity: [1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    slideleft: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { x: containerProps.width },
        animate: { x: 0 },
        exit: { opacity: [1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    slideright: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { x: -containerProps.width },
        animate: { x: 0 },
        exit: { opacity: [1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    pushhorizontal: (
        childProps,
        { transitionConfigType, ...containerProps },
        direction
    ) => ({
        variants: {
            initial:
                direction === 1
                    ? { x: containerProps.width }
                    : { x: -containerProps.width },
            enter: { x: 0 },
            exit: direction =>
                direction === -1
                    ? { x: containerProps.width, opacity: [1, 1, 1, 0] }
                    : { x: -containerProps.width, opacity: [1, 1, 1, 0] },
        },
        initial: "initial",
        animate: "enter",
        exit: "exit",
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    pushvertical: (
        childProps,
        { transitionConfigType, ...containerProps },
        direction
    ) => ({
        variants: {
            initial:
                direction === 1
                    ? { y: containerProps.height }
                    : { y: -containerProps.height },
            enter: { y: 0 },
            exit: direction =>
                direction === -1
                    ? { y: containerProps.height, opacity: [1, 1, 1, 0] }
                    : { y: -containerProps.height, opacity: [1, 1, 1, 0] },
        },
        initial: "initial",
        animate: "enter",
        exit: "exit",
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    pushup: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { y: containerProps.height },
        animate: { y: 0 },
        exit: { y: -containerProps.height, opacity: [1, 1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    pushdown: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { y: -containerProps.height },
        animate: { y: 0 },
        exit: { y: containerProps.height, opacity: [1, 1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    pushleft: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { x: containerProps.width },
        animate: { x: 0 },
        exit: { x: -containerProps.height, opacity: [1, 1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    pushright: (childProps, { transitionConfigType, ...containerProps }) => ({
        initial: { x: -containerProps.width },
        animate: { x: 0 },
        exit: { x: containerProps.height, opacity: [1, 1, 1, 0] },
        transition:
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps),
    }),
    morph: (
        childProps,
        {
            transitionConfigType,
            staggerChildren,
            delayChildren,
            ...containerProps
        }
    ) => ({
        transition: {
            ...(transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps)),
            staggerChildren,
            delayChildren,
        },
    }),
    crossdissolve: (
        childProps,
        {
            transitionConfigType,
            staggerChildren,
            delayChildren,
            ...containerProps
        },
        { direction }
    ) => {
        const options =
            transitionConfigType === "default"
                ? DEFAULT_SPRING
                : transitionOptionsFromProps(containerProps)

        // When using a tween transition, we intentionally give opacity a different
        // curve, which aims to maximize the time that both the appearing and disappearing
        // elements stay at a higher opacity value. This works around the issue when in the
        // middle of the cross-dissolve, both elements have an opacity of 50% for a combined
        // max alpha value of 0.75. The observable effect is that of the element dimming/blinking
        // out of existence and then back in, rather than smoothly cross-fading between states.
        // A true cross-dissolve would have us paint the blended value of the front/back layer,
        // preserving the alpha of the target, but hopefully this is a good approximation.
        const opacity = {
            type: "tween",
            // using a blend of easeIn/easeOut means that in the middle
            // of the transition, both elements will be at >50% opacity
            ease:
                direction === "cross-dissolve-enter"
                    ? EASINGS.easeOutCubic
                    : EASINGS.easeInCubic,
            duration: options["duration"],
        }

        return {
            transition: {
                opacity,
                default: options,
                staggerChildren,
                delayChildren,
            },
        }
    },
    enterdissolve: (
        childProps,
        { enterTransitionConfigType, ...containerProps },
        {
            transitionKey: tkey,
            useAbsolutePositioning,
            sourceRect: rect,
            ...transitionOptions
        }
    ) => {
        if (!useAbsolutePositioning) {
            return TRANSITIONS.growdissolve(
                childProps,
                { enterTransitionConfigType, ...containerProps },
                {
                    transitionKey: tkey,
                    useAbsolutePositioning,
                    sourceRect: rect,
                    ...transitionOptions,
                }
            )
        }

        return {
            variants: {
                [`__switch_initial_${tkey}`]: { opacity: 0, display: "block" },
                [`__switch_next_${tkey}`]: {
                    opacity: [0, getOpacity(childProps.style || {})],
                    display: "block",
                    width: [rect.width, rect.width],
                    height: [rect.height, rect.height],
                },
            },
            initial: `__switch_initial_${tkey}`,
            animate: `__switch_next_${tkey}`,
            transition:
                enterTransitionConfigType === "default"
                    ? DEFAULT_TWEEN
                    : transitionOptionsFromProps(containerProps, "enter"),
        }
    },
    exitdissolve: (
        childProps,
        { exitTransitionConfigType, ...containerProps },
        { transitionKey: tkey, useAbsolutePositioning, ...transitionOptions }
    ) => {
        if (!useAbsolutePositioning) {
            return TRANSITIONS.shrinkdissolve(
                childProps,
                { exitTransitionConfigType, ...containerProps },
                {
                    transitionKey: tkey,
                    useAbsolutePositioning,
                    ...transitionOptions,
                }
            )
        }

        return {
            variants: {
                [`__switch_initial_${tkey}`]: { opacity: 1 },
                [`__switch_next_${tkey}`]: {
                    opacity: [getOpacity(childProps.style || {}), 0],
                    transitionEnd: { display: "none" },
                },
            },
            initial: `__switch_initial_${tkey}`,
            animate: `__switch_next_${tkey}`,
            transition:
                exitTransitionConfigType === "default"
                    ? DEFAULT_TWEEN
                    : transitionOptionsFromProps(containerProps, "exit"),
        }
    },
    growdissolve: (
        childProps,
        { enterTransitionConfigType, ...containerProps },
        { transitionKey: tkey, sourceRect: rect }
    ) => ({
        variants: {
            [`__switch_initial_${tkey}`]: {
                opacity: 0,
                width: 0,
                height: 0,
                display: "block",
            },
            [`__switch_next_${tkey}`]: {
                opacity: getOpacity(childProps.style || {}),
                width: [0, rect.width],
                height: [0, rect.height],
                display: "block",
            },
        },
        initial: `__switch_initial_${tkey}`,
        animate: `__switch_next_${tkey}`,
        transition:
            enterTransitionConfigType === "default"
                ? DEFAULT_TWEEN
                : transitionOptionsFromProps(containerProps, "enter"),
    }),
    shrinkdissolve: (
        childProps,
        { exitTransitionConfigType, ...containerProps },
        { transitionKey: tkey, sourceRect: rect }
    ) => ({
        variants: {
            [`__switch_next_${tkey}`]: { opacity: 0, width: 0, height: 0 },
        },
        animate: `__switch_next_${tkey}`,
        transition:
            exitTransitionConfigType === "default"
                ? DEFAULT_TWEEN
                : transitionOptionsFromProps(containerProps, "exit"),
    }),
    enterInstant: (childProps, containerProps, { transitionKey: tkey }) => ({
        variants: {
            [`__switch_initial_${tkey}`]: {
                opacity: 0,
                display: "block",
            },
            [`__switch_next_${tkey}`]: {
                opacity: getOpacity(childProps.style || {}),
                display: "block",
            },
        },
        initial: `__switch_initial_${tkey}`,
        animate: `__switch_next_${tkey}`,
        transition: { type: "tween", ease: "linear", duration: 0 },
    }),
    exitInstant: (childProps, containerProps, { transitionKey: tkey }) => ({
        variants: {
            [`__switch_initial_${tkey}`]: {
                opacity: getOpacity(childProps.style || {}),
            },
            [`__switch_next_${tkey}`]: {
                opacity: 0,
                transitionEnd: { display: "none" },
            },
        },
        initial: `__switch_initial_${tkey}`,
        animate: `__switch_next_${tkey}`,
        transition: { type: "tween", ease: "linear", duration: 0 },
    }),
}
