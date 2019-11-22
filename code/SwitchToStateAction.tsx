import * as React from "react"
import { createElement } from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import { useStore } from "./globalStore"
import { placeholderState } from "./placeholderState"
import { sanitizePropName } from "./sanitizePropName"
import { omit } from "./omit"
import { colors as thumbnailColors } from "./thumbnailStyles"
import { extractEventHandlersFromProps } from "./extractEventHandlersFromProps"
import { eventTriggerProps, eventTriggerPropertyControls } from "./controls"

// ------------- SwitchToStateAction Component ------------

export function SwitchToStateAction(props) {
    const { children, target, trigger, ...rest } = props
    const sanitizedTarget = sanitizePropName(target)
    const [store, setStore] = useStore()

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return <SwitchToStateActionThumbnail />
    }

    const eventHandlers = extractEventHandlersFromProps(
        props,
        store,
        setStore,
        sanitizedTarget
    )

    const child = children && children[0]
    let placeholder

    if (!child) {
        placeholder = createElement(placeholderState, {
            striped: true,
        })
    }

    return (
        <Frame
            {...eventHandlers}
            {...omit(rest, eventTriggerProps)}
            background="transparent"
            size="100%"
            whileTap={{ opacity: 0.75 }}
        >
            {!child && RenderTarget.current() === RenderTarget.canvas
                ? placeholder
                : null}
            {children}
        </Frame>
    )
}

SwitchToStateAction.defaultProps = {
    width: 50,
    height: 50,
    target: "sharedSwitch",
    isInteractive: true,
}

// ------------------- Property Controls ------------------

addPropertyControls(SwitchToStateAction, {
    children: {
        type: ControlType.ComponentInstance,
        title: "Appearance",
    },
    target: {
        type: ControlType.String,
        title: "Switch",
        defaultValue: "sharedSwitch",
    },

    ...eventTriggerPropertyControls,
})

// ---------------------- Thumbnail -----------------------

function SwitchToStateActionThumbnail() {
    return (
        <Frame
            size="100%"
            borderRadius={8}
            border={`2px solid ${thumbnailColors.primary}`}
            background={thumbnailColors.background}
        >
            <Frame
                borderRadius="50%"
                size="55%"
                center
                background={thumbnailColors.primary}
            ></Frame>
        </Frame>
    )
}
