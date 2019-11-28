import * as React from "react"
import { useEffect, createElement } from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import hotkeys, { KeyHandler } from "hotkeys-js"
import { useSwitch } from "./globalStore"
import { placeholderState } from "./placeholderState"
import { sanitizePropName } from "./sanitizePropName"
import { omit } from "./omit"
import { colors as thumbnailColors } from "./thumbnailStyles"
import { extractEventHandlersFromProps } from "./extractEventHandlersFromProps"
import {
    eventTriggerProps,
    keyEventTriggerProps,
    eventTriggerPropertyControls,
} from "./controls"

// ------------- SwitchToStateAction Component ------------

export function SwitchToStateAction(props) {
    const { children, target, ...rest } = props
    const sanitizedTarget = sanitizePropName(target)
    const switchControls = useSwitch()

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return <SwitchToStateActionThumbnail />
    }

    // Extract event handlers from props
    let [eventHandlers, keyEvents] = extractEventHandlersFromProps(
        props,
        switchControls,
        sanitizedTarget
    )

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
    }, keyEventProps)

    const child = children && React.Children.toArray(children)[0]
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
