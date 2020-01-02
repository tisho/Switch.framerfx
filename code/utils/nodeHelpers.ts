import * as React from "react"
import { calculateRect } from "./calculateRect"
import { rectAsStyleProps } from "./styleParsing"

const nodeTypeMap = {
    Frame: "Frame",
    Text: "Text",
    Vector: "Vector",
    VectorGroup: "VectorGroup",
    VectorWrapper: "VectorWrapper",
    StackContainer: "StackContainer",
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

const animatableNodeTypes = ["Frame", "StackContainer", "Stack"]

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
export const getNodeType = node => {
    const name = node.type.name

    if (name === "Frame") {
        // if all children are of type Vector or VectorGroup, this is a vector wrapper
        const children = React.Children.toArray(node.props.children || [])
        if (
            children.length > 0 &&
            children.every(
                child =>
                    [nodeTypeMap.Vector, nodeTypeMap.VectorGroup].indexOf(
                        getNodeType(child)
                    ) !== -1
            )
        ) {
            return nodeTypeMap.VectorWrapper
        }

        return nodeTypeMap.Frame
    }

    if (name === "ComponentContainer" && isStack(node)) {
        return nodeTypeMap.StackContainer
    }

    // Frame with Overrides
    if (
        name === "s" ||
        name.match(/^WithOverrides?\((Frame|Stack)/) ||
        typeof name === "undefined"
    ) {
        if (isStack(node)) {
            return nodeTypeMap.StackContainer
        }

        if (isFrameLike(node)) {
            return nodeTypeMap.Frame
        }
    }

    return nodeTypeMap[name] || nodeTypeMap.Unknown
}

export const isStack = node =>
    "componentIdentifier" in node.props &&
    node.props.componentIdentifier === "framer/Stack"

export const isSameComponent = (source, target) => {
    return source.props.componentIdentifier === target.props.componentIdentifier
}

export const getNodeRect = (node, parentSize) => {
    const nodeType = getNodeType(node)
    let props = { ...node.props }

    if (nodeType === "StackContainer") {
        const stack = React.Children.toArray(node.props.children)[0]

        props.width = stack.props.width
        props.height = stack.props.height
    }

    const rect = calculateRect(props, parentSize)
    return rectAsStyleProps(rect)
}

export const getNodeChildren = node => {
    const nodeType = getNodeType(node)
    let children = node.props.children

    if (nodeType === "StackContainer") {
        const stack = React.Children.toArray(children)[0]
        children = stack.props.children
    }

    return React.Children.toArray(children)
}
