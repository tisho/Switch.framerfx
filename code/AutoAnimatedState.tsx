import * as React from "react"
import { useState, useEffect, memo, cloneElement } from "react"
import { Size, useAnimation } from "framer"
import { getCache } from "./store/keyStore"
import { pick } from "./utils/pick"
import { randomID } from "./utils/randomID"
import {
    getBackgroundColorPair,
    getBorderPair,
    getBorderRadius,
    getBoxShadowPair,
    getOpacity,
    getRotate,
    isBackgroundTransitionAnimatable,
    filterOutAbsolutePositioningProps,
} from "./utils/styleParsing"
import {
    canAnimateNodeChildren,
    getNodeName,
    getNodeId,
    getNodeType,
    getNodeRect,
    getNodeChildren,
    isNodeVisible,
    nodeWithIdAndKey,
    isNodeAnimatable,
    isSameComponent,
} from "./utils/nodeHelpers"
import { addAnimatableWrapperToNodeIfNeeded } from "./utils/addAnimatableWrapperToNodeIfNeeded"

const propsForPositionReset = {
    top: null,
    right: null,
    bottom: null,
    left: null,
    center: null,
}

const _AutoAnimatedState = ({
    source,
    target,
    transitionPropsForElement,
    sourceParentSize,
    targetParentSize,
    direction,
    morphCodeComponentPropsOnly = true,
    parentContext = null,
    sourceKey = null,
    keyCache = null,
    transitionKey = null,
}) => {
    const [id, _] = useState(randomID())
    const keySourceCache = keyCache || getCache(id)
    const getSourceKey = keySourceCache.getSourceKey

    // Ensure both source and target have an id and key, even if they're auto-generated
    source = nodeWithIdAndKey(source)
    target = nodeWithIdAndKey(target)

    // The transition key will be used to create a unique name for the
    // initial/next variant used in animating the state transition.
    // All children will share the same transition key, so options like
    // staggerChildren can take effect.
    const tkey = transitionKey || `${source.key}-${target.key}`

    const sourceNodeType = getNodeType(source)
    const targetNodeType = getNodeType(target)

    const useAbsolutePositioning = !(
        ["StackLegacyContainer", "Stack"].indexOf(sourceNodeType) > -1 ||
        ["StackLegacyContainer", "Stack"].indexOf(targetNodeType) > -1 ||
        parentContext === "Stack"
    )

    const controls = useAnimation()
    const initialVariantName = `__switch_initial_${tkey}`
    const nextVariantName = `__switch_next_${tkey}`
    const isRoot = transitionKey === null

    const sourcePositionAndSizeProps = getNodeRect(source, sourceParentSize)
    const targetPositionAndSizeProps = getNodeRect(target, targetParentSize)

    const shouldAnimateChildren =
        canAnimateNodeChildren(source) && canAnimateNodeChildren(target)

    const sourceStateChildren = shouldAnimateChildren
        ? getNodeChildren(source)
        : []
    const targetStateChildren = shouldAnimateChildren
        ? getNodeChildren(target)
        : []

    const morphingChildrenPairs = []
    const morphingChildrenIds = []
    const enteringChildrenIds = []
    const exitingChildrenIds = []

    const sourceStateChildrenIds = sourceStateChildren.map(getNodeId)

    targetStateChildren.forEach(child => {
        const name = getNodeName(child)
        const id = getNodeId(child)

        // if the child isn't visible in the target state, skip it, so it can be marked for exiting
        if (!isNodeVisible(child)) {
            return
        }

        // find the first match by name that's not already in the morphing children list
        const match = sourceStateChildren.find(otherChild => {
            const otherName = getNodeName(otherChild)
            const otherId = getNodeId(otherChild)

            return (
                name === otherName &&
                morphingChildrenIds.indexOf(otherId) === -1
            )
        })

        if (match) {
            const otherId = getNodeId(match)
            morphingChildrenIds.push(otherId)
            morphingChildrenPairs.push({ source: otherId, target: id })
            return
        }

        // if there's no match, this child is entering the scene
        enteringChildrenIds.push(id)
    })

    // exiting children will be all children from the current state that haven't been tagged as morphing
    sourceStateChildren.forEach(child => {
        const id = getNodeId(child)
        if (morphingChildrenIds.indexOf(id) === -1) {
            exitingChildrenIds.push(id)
        }
    })

    // put together final hierarchy

    // step 1: replace morphing children with their equivalents from current state
    // morphing children will be evaluated separately, so the fact that we're using
    // the source child in this stage of the hierarchy doesn't mean much.
    const targetHierarchy = targetStateChildren.map(child => {
        const id = getNodeId(child)
        const morphingPair = morphingChildrenPairs.find(c => c.target === id)

        if (morphingPair) {
            return sourceStateChildren.find(
                c => getNodeId(c) === morphingPair.source
            )
        }
        return child
    })

    // step 2: place exiting children back into the hierarchy
    exitingChildrenIds.forEach(id => {
        const index = sourceStateChildrenIds.indexOf(id)
        let closestMorphingChildId

        for (let i = index; i >= 0; i--) {
            if (morphingChildrenIds.indexOf(sourceStateChildrenIds[i]) !== -1) {
                closestMorphingChildId = sourceStateChildrenIds[i]
                break
            }
        }

        const indexOfClosestMorphingChild = targetHierarchy.findIndex(
            c => getNodeId(c) === closestMorphingChildId
        )
        const child = sourceStateChildren.find(c => getNodeId(c) === id)

        if (typeof indexOfClosestMorphingChild !== "undefined") {
            targetHierarchy.splice(indexOfClosestMorphingChild + 1, 0, child)
        } else {
            targetHierarchy.unshift(child)
        }
    })

    // ------------ Build Final Hierarchy with Animated Elements --------------

    const animatedHierarchy = targetHierarchy.map(child => {
        const id = getNodeId(child)
        const morphingPair = morphingChildrenPairs.find(c => c.source === id)
        if (morphingPair) {
            const targetChild = targetStateChildren.find(
                c => getNodeId(c) === morphingPair.target
            )

            const key = getSourceKey(targetChild.key, child.key)

            return React.createElement(AutoAnimatedState, {
                key,
                sourceKey: key,
                transitionKey: tkey,
                source: child,
                target: targetChild,
                transitionPropsForElement,
                sourceParentSize: Size(
                    sourcePositionAndSizeProps.width,
                    sourcePositionAndSizeProps.height
                ),
                targetParentSize: Size(
                    targetPositionAndSizeProps.width,
                    targetPositionAndSizeProps.height
                ),
                direction,
                parentContext:
                    ["StackLegacyContainer", "Stack"].indexOf(sourceNodeType) >
                        -1 ||
                    ["StackLegacyContainer", "Stack"].indexOf(targetNodeType) >
                        -1
                        ? "Stack"
                        : null,
                keyCache: keySourceCache,
            })
        }

        const positionAndSize = getNodeRect(child, sourcePositionAndSizeProps)

        const wrappedChild = addAnimatableWrapperToNodeIfNeeded(child, {
            ...propsForPositionReset,
            width: "100%",
            height: "100%",
        })

        if (enteringChildrenIds.indexOf(id) !== -1) {
            const positionAndSizeInTarget = getNodeRect(
                child,
                targetPositionAndSizeProps
            )
            let props = {
                ...propsForPositionReset,
                ...positionAndSizeInTarget,
                ...transitionPropsForElement({
                    source: child,
                    sourceRect: positionAndSize,
                    transition: "enter",
                    transitionKey: tkey,
                    useAbsolutePositioning,
                }),
            }

            props = useAbsolutePositioning
                ? props
                : filterOutAbsolutePositioningProps(props)

            return cloneElement(wrappedChild, props)
        }

        if (exitingChildrenIds.indexOf(id) !== -1) {
            let props = {
                ...propsForPositionReset,
                ...positionAndSize,
                ...transitionPropsForElement({
                    source: child,
                    sourceRect: positionAndSize,
                    transition: "exit",
                    transitionKey: tkey,
                    useAbsolutePositioning,
                }),
            }

            props = useAbsolutePositioning
                ? props
                : filterOutAbsolutePositioningProps(props)

            return cloneElement(wrappedChild, props)
        }
    })

    // ------------ Set Up Transition Effect --------------

    // Decide which transition to run
    const hasNonAnimatableTransitions =
        sourceNodeType === targetNodeType &&
        !isBackgroundTransitionAnimatable(source, target)

    const shouldCrossDissolve =
        sourceNodeType !== targetNodeType ||
        hasNonAnimatableTransitions ||
        !isNodeAnimatable(source) ||
        !isNodeAnimatable(target)

    const shouldMorphComponentProps =
        morphCodeComponentPropsOnly &&
        sourceNodeType === "ComponentContainer" &&
        targetNodeType === "ComponentContainer" &&
        isSameComponent(source, target)

    useEffect(() => {
        // We only need to start the variant transition at the root level.
        // animations deeper in the hierarchy will be automatically triggered,
        // because they share the same variant name through the transition key.
        if (!isRoot) {
            return
        }

        if (
            source.type === target.type &&
            getNodeId(source) === getNodeId(target)
        ) {
            // skip animation entirely if we're not transitioning to a new state
            controls.set(nextVariantName)
        } else {
            // delay animation until after the next paint / layout, so animations
            // can start from the correct values
            requestAnimationFrame(() =>
                setTimeout(() => controls.start(nextVariantName), 0)
            )
        }
    }, [source, target, controls, initialVariantName, nextVariantName])

    // ------------ Cross-Dissolving Elements --------------

    if (shouldCrossDissolve && !shouldMorphComponentProps) {
        const enteringChildVariants = {
            [initialVariantName]: {
                opacity: 0,
                display: "block",
            },
            [nextVariantName]: {
                ...targetPositionAndSizeProps,
                opacity: getOpacity(target.props.style || {}),
                display: "block",
                scaleX: 1,
                scaleY: 1,
                translateX: [0, 0],
            },
        }

        const exitingChildVariants = {
            [initialVariantName]: {
                opacity: getOpacity(source.props.style || {}),
                display: "block",
            },
            [nextVariantName]: {
                ...pick(targetPositionAndSizeProps, ["top", "left"]),
                scaleX:
                    targetPositionAndSizeProps.width /
                    sourcePositionAndSizeProps.width,
                scaleY:
                    targetPositionAndSizeProps.height /
                    sourcePositionAndSizeProps.height,
                opacity: 0,
                transitionEnd: {
                    translateX: -9999,
                },
            },
        }

        const enterTransitionProps = transitionPropsForElement({
            source,
            target,
            transition: "cross-dissolve-enter",
        })

        const exitTransitionProps = transitionPropsForElement({
            source,
            target,
            transition: "cross-dissolve-exit",
        })

        const key = getSourceKey(sourceKey, source.key)

        let enteringChildProps = {
            key: direction === 1 ? `__enter_${key}` : `__exit_${key}`,
            ...propsForPositionReset,
            ...pick(sourcePositionAndSizeProps, ["top", "left"]),
            ...pick(targetPositionAndSizeProps, ["width", "height"]),
            originX: 0,
            originY: 0,
            scaleX:
                sourcePositionAndSizeProps.width /
                targetPositionAndSizeProps.width,
            scaleY:
                sourcePositionAndSizeProps.height /
                targetPositionAndSizeProps.height,
            variants: {
                ...(target.props.variants || {}),
                ...enteringChildVariants,
            },
            initial: initialVariantName,
            animate: controls,
            ...enterTransitionProps,
        }

        enteringChildProps = useAbsolutePositioning
            ? enteringChildProps
            : filterOutAbsolutePositioningProps(enteringChildProps)

        let exitingChildProps = {
            key: direction === 1 ? `__exit_${key}` : `__enter_${key}`,
            ...propsForPositionReset,
            ...sourcePositionAndSizeProps,
            originX: 0,
            originY: 0,
            scaleX: 1,
            scaleY: 1,
            variants: {
                ...(source.props.variants || {}),
                ...exitingChildVariants,
            },
            initial: initialVariantName,
            animate: controls,
            ...exitTransitionProps,
        }

        exitingChildProps = useAbsolutePositioning
            ? exitingChildProps
            : filterOutAbsolutePositioningProps(exitingChildProps)

        const wrappedSource = addAnimatableWrapperToNodeIfNeeded(
            source,
            {
                ...propsForPositionReset,
                width: "100%",
                height: "100%",
            },
            shouldAnimateChildren ? animatedHierarchy : []
        )

        const wrappedTarget = addAnimatableWrapperToNodeIfNeeded(
            target,
            {
                ...propsForPositionReset,
                ...pick(targetPositionAndSizeProps, ["width", "height"]),
            },
            shouldAnimateChildren ? animatedHierarchy : []
        )

        const enteringElement = cloneElement(wrappedTarget, enteringChildProps)
        const exitingElement = cloneElement(wrappedSource, exitingChildProps)

        return (
            <>
                {exitingElement}
                {enteringElement}
            </>
        )
    }

    // ------------ Variants for Morphing Elements --------------

    const {
        sourceProps: initialVariant,
        targetProps: nextVariant,
    } = getPropTransitionsBetweenNodes(
        source,
        target,
        sourceParentSize,
        targetParentSize,
        parentContext
    )

    let transitionProps = {
        ...propsForPositionReset,
        ...sourcePositionAndSizeProps,
        _border: null,
        style: {
            ...source.props.style,
        },
        variants: {
            ...(target.props.variants || {}),
            [initialVariantName]: initialVariant,
            [nextVariantName]: nextVariant,
        },
        initial: initialVariantName,
        animate: controls,
        ...transitionPropsForElement({
            source,
            target,
            transition: "morph",
        }),
    }

    transitionProps =
        !useAbsolutePositioning && sourceNodeType !== "Stack"
            ? filterOutAbsolutePositioningProps(transitionProps)
            : transitionProps

    const key = getSourceKey(sourceKey, source.key)

    // ------------ Stacks --------------

    if (sourceNodeType === "StackLegacyContainer") {
        const containerProps = {
            key,
            id: null,
            ...propsForPositionReset,
            ...sourcePositionAndSizeProps,
            top: 0,
            left: 0,
            _border: null,
        }

        const sourceStack = React.Children.toArray(source.props.children)[0]
        const targetStack = React.Children.toArray(target.props.children)[0]

        const {
            sourceProps: stackInitialVariant,
            targetProps: stackNextVariant,
        } = getPropTransitionsBetweenNodes(
            sourceStack,
            targetStack,
            sourcePositionAndSizeProps,
            targetPositionAndSizeProps,
            parentContext
        )

        let stackProps = {
            key,
            id: null,
            ...transitionProps,
            top: sourcePositionAndSizeProps.top,
            left: sourcePositionAndSizeProps.left,
            variants: {
                [initialVariantName]: stackInitialVariant,
                [nextVariantName]: {
                    ...stackNextVariant,
                    top: targetPositionAndSizeProps.top,
                    left: targetPositionAndSizeProps.left,
                },
            },
        }

        stackProps =
            parentContext === "Stack"
                ? filterOutAbsolutePositioningProps(stackProps)
                : stackProps

        return cloneElement(
            source,
            containerProps,
            cloneElement(sourceStack, stackProps, ...animatedHierarchy)
        )
    }

    // ------------ Code Components --------------

    if (shouldMorphComponentProps) {
        const sourceComponent = React.Children.toArray(source.props.children)[0]
        const targetComponent = React.Children.toArray(target.props.children)[0]

        const containerProps = {
            ...transitionProps,
            positionTransition: useAbsolutePositioning
                ? false
                : transitionPropsForElement({
                      source,
                      target,
                      transition: "morph",
                  }).transition,
            key,
        }

        const wrappedSource = addAnimatableWrapperToNodeIfNeeded(
            source,
            {
                ...propsForPositionReset,
                width: "100%",
                height: "100%",
                id: target.props.id,
                key,
            },
            [
                cloneElement(sourceComponent, {
                    ...targetComponent.props,
                    key,
                }),
            ]
        )

        return <>{cloneElement(wrappedSource, containerProps)}</>
    }

    // ------------ All Other Morphable Elements --------------

    const wrappedTarget = addAnimatableWrapperToNodeIfNeeded(target, {
        ...propsForPositionReset,
        width: "100%",
        height: "100%",
        key,
    })

    return cloneElement(
        wrappedTarget,
        {
            id: null,
            ...transitionProps,
            positionTransition: useAbsolutePositioning
                ? false
                : transitionPropsForElement({
                      source,
                      target,
                      transition: "morph",
                  }).transition,
            key,
        },
        [<React.Fragment key={key}>{animatedHierarchy}</React.Fragment>]
    )
}

_AutoAnimatedState.displayName = "AutoAnimatedState"
export const AutoAnimatedState = memo(_AutoAnimatedState) as any

const getPropTransitionsBetweenNodes = (
    source,
    target,
    sourceParentSize,
    targetParentSize,
    parentContext
) => {
    const targetPositionAndSizeProps = getNodeRect(target, targetParentSize)

    const [
        sourceBackgroundColor,
        targetBackgroundColor,
    ] = getBackgroundColorPair(source.props, target.props)

    const [sourceBoxShadow, targetBoxShadow] = getBoxShadowPair(
        source.props,
        target.props
    )

    const [sourceBorder, targetBorder] = getBorderPair(
        source.props,
        target.props
    )

    const sourceProps = {
        opacity: getOpacity(source.props.style),
        rotate: getRotate(source.props.style),
        ...getBorderRadius(source.props.style),
        ...(sourceBackgroundColor && { background: sourceBackgroundColor }),
        boxShadow: sourceBoxShadow,
        ...sourceBorder,
    }

    let targetProps = {
        ...targetPositionAndSizeProps,
        opacity: getOpacity(target.props.style),
        rotate: getRotate(target.props.style),
        ...getBorderRadius(target.props.style),
        ...(targetBackgroundColor && { background: targetBackgroundColor }),
        boxShadow: targetBoxShadow,
        ...targetBorder,
    }

    targetProps =
        parentContext === "Stack"
            ? filterOutAbsolutePositioningProps(targetProps)
            : targetProps

    return {
        sourceProps,
        targetProps,
    }
}
