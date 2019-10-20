import * as React from "react"
import { createElement } from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import { useStore } from "./globalStore"
import { placeholderState } from "./placeholderState"
import { sanitizePropName } from "./sanitizePropName"

export function SwitchToStateAction(props) {
    const {
        children,
        target,
        trigger,
        actionType,
        targetState,
        ...rest
    } = props
    const sanitizedTarget = sanitizePropName(target)
    const [store, setStore] = useStore()

    const onTrigger = () => {
        if (sanitizedTarget === "") return

        const current = store[sanitizedTarget]
        const states =
            store.__registry && store.__registry[sanitizedTarget]
                ? store.__registry[sanitizedTarget]
                : []

        if (actionType === "specific") {
            store[sanitizedTarget] = targetState
        }

        if (actionType === "next") {
            store[sanitizedTarget] =
                current + 1 >= states.length ? 0 : current + 1
        }

        if (actionType === "previous") {
            store[sanitizedTarget] =
                current - 1 < 0 ? states.length - 1 : current - 1
        }

        setStore(store)
    }

    const events = { [trigger]: onTrigger }

    const child = children && children[0]
    let placeholder

    if (!child) {
        placeholder = createElement(placeholderState, {
            striped: true,
        })
    }

    return (
        <Frame
            {...rest}
            background="transparent"
            size="100%"
            whileTap={{ opacity: 0.75 }}
            {...events}
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
}

addPropertyControls(SwitchToStateAction, {
    children: {
        type: ControlType.ComponentInstance,
        title: "Appearance",
    },
    trigger: {
        type: ControlType.Enum,
        title: "Trigger",
        options: [
            "onTap",
            "onTapStart",
            "onTapCancel",
            "onHoverStart",
            "onHoverEnd",
            "onDragStart",
            "onDragEnd",
        ],
    },
    target: {
        type: ControlType.String,
        title: "Switch",
        defaultValue: "sharedSwitch",
    },
    actionType: {
        type: ControlType.Enum,
        title: "Set to",
        options: ["specific", "next", "previous"],
        optionTitles: ["Specific State", "Next State", "Previous State"],
    },
    targetState: {
        type: ControlType.Number,
        displayStepper: true,
        title: "State",
        defaultValue: 0,
        hidden: props => props.actionType !== "specific",
    },
})
