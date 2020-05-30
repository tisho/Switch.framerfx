import * as React from "react"
import { useEffect, useState, useRef, createElement, memo } from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import hotkeys, { KeyHandler } from "hotkeys-js"
import { placeholderState } from "./placeholderState"
import { sanitizePropName } from "./utils/propNameHelpers"
import { omit } from "./utils/omit"
import { colors as thumbnailColors } from "./thumbnailStyles"
import { extractEventHandlersFromProps } from "./utils/extractEventHandlersFromProps"
import { randomID } from "./utils/randomID"
import {
    eventTriggerProps,
    keyEventTriggerProps,
    automaticEventTriggerProps,
    eventTriggerPropertyControls,
} from "./controls"
import { actions } from "./store/globalStore"

// ------------- SwitchToStateAction Component ------------

function _SwitchToStateAction(props) {
    const { children, target, targetType, ...rest } = props
    const ref = useRef<HTMLDivElement>(null)
    const sanitizedTarget = sanitizePropName(target)
    const [targetId, setTargetId] = useState(
        targetType === "named" ? sanitizedTarget : randomID()
    )

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
        targetId
    )

    const automaticEventProps = Object.keys(props)
        .filter((prop) => automaticEventTriggerProps.indexOf(prop) !== -1)
        .map((prop) => props[prop])

    // find id of closest switch if targetType is `closest`
    useEffect(() => {
        if (
            RenderTarget.current() !== RenderTarget.preview ||
            !ref.current ||
            targetType !== "closest"
        ) {
            return
        }

        const closestSwitch = ref.current.closest(
            "[data-switch-id]"
        ) as HTMLElement | null

        if (closestSwitch) {
            const id = sanitizePropName(closestSwitch.dataset.switchId)
            if (targetId !== id) {
                setTargetId(id)
            }
        }
    }, [targetType, ref.current])

    // execute automatic (delay) event triggers
    useEffect(() => {
        if (RenderTarget.current() !== RenderTarget.preview) {
            return
        }

        const timeouts = automaticEvents.map(({ handler }) => handler())

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [...automaticEventProps, targetId, props.id])

    // attach key event handlers
    const keyEventProps = Object.keys(props)
        .filter((prop) => keyEventTriggerProps.indexOf(prop) !== -1)
        .map((prop) => props[prop])

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
    }, [...keyEventProps, targetId, props.id])

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
            ref={ref}
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

export const SwitchToStateAction = (props) => (
    <__SwitchToStateAction {...props} />
)

const defaultProps = {
    width: 50,
    height: 50,
    targetType: "named",
    target: "sharedSwitch",
    isInteractive: true,
}

SwitchToStateAction.defaultProps = defaultProps

// ------------------- Property Controls ------------------

addPropertyControls(SwitchToStateAction, {
    children: {
        type: ControlType.ComponentInstance,
        title: "Appearance",
    },
    targetType: {
        title: "Switch",
        type: ControlType.Enum,
        options: ["closest", "named"],
        optionTitles: ["Closest", "Named"],
        defaultValue: defaultProps.targetType,
    },
    target: {
        type: ControlType.String,
        title: " ",
        defaultValue: defaultProps.target,
        placeholder: "Name of Switch",
        hidden: (props) => props.targetType !== "named",
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
