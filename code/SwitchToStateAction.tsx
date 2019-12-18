import * as React from "react"
import { useEffect, createElement, memo } from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import hotkeys, { KeyHandler } from "hotkeys-js"
import { placeholderState } from "./placeholderState"
import { sanitizePropName } from "./utils/propNameHelpers"
import { omit } from "./utils/omit"
import { colors as thumbnailColors } from "./thumbnailStyles"
import { extractEventHandlersFromProps } from "./utils/extractEventHandlersFromProps"
import {
    eventTriggerProps,
    keyEventTriggerProps,
    automaticEventTriggerProps,
    eventTriggerPropertyControls,
} from "./controls"
import { actions } from "./store/globalStore"

// ------------- SwitchToStateAction Component ------------

function _SwitchToStateAction(props) {
    const { children, target, ...rest } = props
    const sanitizedTarget = sanitizePropName(target)

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return <SwitchToStateActionThumbnail />
    }

    const {
        getSwitchStateIndex,
        setSwitchStateIndex,
        registerSwitchStates,
        getAllSwitchStates,
    } = actions

    // Extract event handlers from props
    let [
        eventHandlers,
        keyEvents,
        automaticEvents,
    ] = extractEventHandlersFromProps(
        props,
        {
            getSwitchStateIndex,
            setSwitchStateIndex,
            registerSwitchStates,
            getAllSwitchStates,
        },
        sanitizedTarget
    )

    const automaticEventProps = Object.keys(props)
        .filter(prop => automaticEventTriggerProps.indexOf(prop) !== -1)
        .map(prop => props[prop])

    // execute automatic (delay) event triggers
    useEffect(() => {
        if (RenderTarget.current() !== RenderTarget.preview) {
            return
        }

        const timeouts = automaticEvents.map(({ handler }) => handler())

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [...automaticEventProps, sanitizedTarget, props.id])

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
    }, [...keyEventProps, sanitizedTarget, props.id])

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
        >
            {!child && RenderTarget.current() === RenderTarget.canvas
                ? placeholder
                : null}
            {children}
        </Frame>
    )
}

_SwitchToStateAction.displayName = "SwitchToStateAction"

const __SwitchToStateAction = memo(_SwitchToStateAction)

export const SwitchToStateAction = props => <__SwitchToStateAction {...props} />

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
