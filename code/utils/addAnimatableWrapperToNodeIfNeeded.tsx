import * as React from "react"
import { cloneElement } from "react"
import { Frame } from "framer"
import { getNodeType, getNodeName } from "./nodeHelpers"

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
    const needsWrapper =
        ["Frame", "VectorWrapper", "AnimatableWrapper"].indexOf(
            getNodeType(node)
        ) === -1

    return needsWrapper ? (
        <AnimatableWrapper key={node.key} name={getNodeName(node)}>
            {cloneElement(node, propOverrides, ...children)}
        </AnimatableWrapper>
    ) : (
        node
    )
}
