import * as React from "react"
import { calculateRect } from "./calculateRect"
import { rectAsStyleProps } from "./styleParsing"
import { randomID } from "./randomID"

const nodeTypeMap = {
    Frame: "Frame",
    Text: "Text",
    Vector: "Vector",
    VectorGroup: "VectorGroup",
    VectorWrapper: "VectorWrapper",
    StackLegacyContainer: "StackLegacyContainer",
    Stack: "Stack",
    ComponentContainer: "ComponentContainer",
    SVG: "SVG",
    Unknown: "Unknown",
}

// The Switch doesn't support animating the hierarchy of SVG nodes,
// or Text components for now
const nonAnimatableChildrenNodeTypes = [
    "VectorWrapper",
    "Text",
    "ComponentContainer",
    "SVG",
    "Unknown",
]

const animatableNodeTypes = ["Frame", "StackLegacyContainer", "Stack"]

export const isNodeAnimatable = node =>
    animatableNodeTypes.indexOf(getNodeType(node)) !== -1

export const canAnimateNodeChildren = node =>
    nonAnimatableChildrenNodeTypes.indexOf(getNodeType(node)) === -1

export const isFrameLike = node => {
    return (
        node.props &&
        "_constraints" in node.props &&
        "_border" in node.props &&
        "style" in node.props &&
        "visible" in node.props &&
        "willChangeTransform" in node.props
    )
}

export const hasOverrides = node => {
    const name = getNodeTypeName(node)

    return (
        name === "s" ||
        (typeof name === "string" &&
            name.match(/^WithOverrides?\((Frame|Stack)/))
    )
}

export const getNodeName = node => {
    if (
        node.props &&
        typeof node.props.name !== "undefined" &&
        node.props.name !== null
    ) {
        return node.props.name
    }

    return getNodeType(node)
}

export const getNodeId = node => node.props.id
export const getNodeTypeName = node => {
    if (node.type) {
        if ("displayName" in node.type) {
            return node.type.displayName
        }

        if ("name" in node.type) {
            return node.type.name
        }

        if (
            "render" in node.type &&
            typeof node.type.render === "function" &&
            "name" in node.type.render
        ) {
            return node.type.render.name
        }
    }

    return undefined
}

const isVectorWrapper = node => {
    // if all children are of type Vector or VectorGroup, this is a vector wrapper
    const children = React.Children.toArray(node.props.children || [])

    return (
        children.length > 0 &&
        children.every(
            child =>
                [nodeTypeMap.Vector, nodeTypeMap.VectorGroup].indexOf(
                    getNodeType(child)
                ) !== -1
        )
    )
}

export const getNodeType = node => {
    const name = getNodeTypeName(node)

    // Known Frame case - Frames could be Vector Wrappers or regular frames
    if (name === "Frame" || name === "FrameWithMotion") {
        return getRefinedFrameType(node)
    }

    // Component containers could be legacy stacks
    if (name === "ComponentContainer" && isLegacyStack(node)) {
        return nodeTypeMap.StackLegacyContainer
    }

    // Unknown types and Frames with Overrides
    if (typeof name === "undefined" || hasOverrides(node)) {
        // Test for an overridden Legacy Stack (a component container underneath)
        if (isLegacyStack(node)) {
            return nodeTypeMap.StackLegacyContainer
        }

        // Test for a modern overridden Stack (will have a proper displayName)
        if (
            typeof name === "string" &&
            name.match(/^WithOverrides?\(Stack\)/)
        ) {
            return nodeTypeMap.Stack
        }

        // Test for Frame-like props and if true, apply the same Frame heuristics as
        // in the known Frame case above
        if (isFrameLike(node)) {
            return getRefinedFrameType(node)
        }
    }

    return nodeTypeMap[name] || nodeTypeMap.Unknown
}

// Refines the node type of a Frame to either a VectorWrapper, or a regular Frame.
// The passed in node is assumed to be a Frame/FrameWithMotion or a Frame-like component.
const getRefinedFrameType = node => {
    if (isVectorWrapper(node)) {
        return nodeTypeMap.VectorWrapper
    }

    return nodeTypeMap.Frame
}

export const isLegacyStack = node =>
    "componentIdentifier" in node.props &&
    node.props.componentIdentifier === "framer/Stack"

export const isSameComponent = (source, target) => {
    return source.props.componentIdentifier === target.props.componentIdentifier
}

export const getNodeRect = (node, parentSize) => {
    const nodeType = getNodeType(node)
    let props = { ...node.props }

    if (nodeType === "StackLegacyContainer") {
        const stack = React.Children.toArray(node.props.children)[0]

        props.width = stack.props.width
        props.height = stack.props.height
    }

    const rect = calculateRect(props, parentSize)
    return rectAsStyleProps(rect)
}

export const nodeWithIdAndKey = node => {
    let id = getNodeId(node)
    id = typeof id === "undefined" || id === null ? randomID() : id
    const key =
        typeof node.key === "undefined" || node.key === null ? id : node.key

    return React.cloneElement(node, { key, id })
}

export const getNodeChildren = node => {
    const nodeType = getNodeType(node)
    let children = node.props.children

    if (nodeType === "StackLegacyContainer") {
        const stack = React.Children.toArray(children)[0]
        children = stack.props.children
    }

    return React.Children.map(children, nodeWithIdAndKey)
}

export const isNodeVisible = node => {
    return node.props && node.props.visible
}
