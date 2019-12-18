import { prefixPropName } from "./utils/propNameHelpers"

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
                    : getProp("ease"),
        }
    }

    if (type === "spring") {
        return {
            type: "spring",
            damping: getProp("damping"),
            mass: getProp("mass"),
            stiffness: getProp("stiffness"),
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
                    opacity: [0, 1],
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
                    opacity: [1, 0],
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
                opacity: 1,
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
                opacity: 1,
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
                opacity: 1,
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
