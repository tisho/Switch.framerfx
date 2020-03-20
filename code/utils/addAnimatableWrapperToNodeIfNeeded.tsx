import * as React from "react"
import { cloneElement } from "react"
import { Frame } from "framer"
import { getNodeType, getNodeName, hasOverrides } from "./nodeHelpers"

const AnimatableWrapper = ({ children, name, ...props }) => (
    <Frame {...props} name={name} background={null}>
        {children}
    </Frame>
)

AnimatableWrapper.displayName = "AnimatableWrapper"

export const addAnimatableWrapperToNodeIfNeeded = (
    node,
    propOverrides = {},
    children = []
) => {
    const nodeType = getNodeType(node)
    const needsWrapper =
        ["Frame", "VectorWrapper", "AnimatableWrapper", "Stack"].indexOf(
            nodeType
        ) === -1 ||
        (nodeType === "Frame" && hasOverrides(node))

    return needsWrapper ? (
        <AnimatableWrapper key={node.key} name={getNodeName(node)}>
            {cloneElement(node, propOverrides, ...children)}
        </AnimatableWrapper>
    ) : (
        node
    )
}
