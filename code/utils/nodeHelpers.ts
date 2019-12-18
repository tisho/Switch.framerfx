import * as React from "react"
import { calculateRect } from "./calculateRect"
import { rectAsStyleProps } from "./styleParsing"

const nodeTypeMap = {
    Frame: "Frame",
    Text: "Text",
    Vector: "Vector",
    VectorWrapper: "VectorWrapper",
    StackContainer: "StackContainer",
    Stack: "Stack",
    ComponentContainer: "ComponentContainer",
    SVG: "SVG",
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
        // if only child is a vector root node, this is a vector wrapper
        const children = React.Children.toArray(node.props.children || [])
        if (children.length === 1) {
            const onlyChildType = getNodeType(children[0])
            if (onlyChildType === "Vector") {
                return nodeTypeMap.VectorWrapper
            }
        }

        return nodeTypeMap.Frame
    }

    if (
        name === "ComponentContainer" &&
        node.props.componentIdentifier === "framer/Stack"
    ) {
        return nodeTypeMap.StackContainer
    }

    // Frame with Overrides
    if ((name === "s" || typeof name === "undefined") && isFrameLike(node)) {
        return "Frame"
    }

    return nodeTypeMap[name] || "Unknown"
}

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
