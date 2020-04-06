import { ControlType, PropertyControls, ControlDescription } from "framer"

export const keyEventTriggerNames = ["onKeyDown", "onKeyUp"]
export const automaticEventTriggerNames = ["afterDelay"]
export const gestureEventNames = ["onDoubleTap", "onLongPress"]

export const eventTriggerNames = [
    ...automaticEventTriggerNames,
    "onTap",
    "onTapStart",
    "onTapCancel",
    "onHoverStart",
    "onHoverEnd",
    "onDragStart",
    "onDragEnd",
    ...gestureEventNames,
    ...keyEventTriggerNames,
]

export const isCustomEvent = (name: string) => {
    return (
        automaticEventTriggerNames.indexOf(name) !== -1 ||
        gestureEventNames.indexOf(name) !== -1
    )
}

export const eventTriggerTitles = {
    onTap: "On Tap",
    onTapStart: "Tap Start",
    onTapCancel: "Tap Cancel",
    afterDelay: "After Delay",
    onHoverStart: "Hover Start",
    onHoverEnd: "Hover End",
    onDragStart: "Drag Start",
    onDragEnd: "Drag End",
    onDoubleTap: "Double Tap",
    onLongPress: "Long Press",
    onKeyDown: "Key Down",
    onKeyUp: "Key Up",
}

// Auto-generated from:
//
// console.log(
//     JSON.stringify([
//         ...eventTriggerNames,
//         ...eventTriggerNames.map(name => `${name}Action`),
//         ...eventTriggerNames.map(name => `${name}SpecificIndex`),
//         ...eventTriggerNames.map(name => `${name}SpecificName`),
//         ...keyEventTriggerNames.map(name => `${name}Key`),
//         ...automaticEventTriggerNames.map(name => `${name}Delay`),
//         "onLongPressDuration",
//     ])
// )

export const eventTriggerProps = [
    "afterDelay",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "onHoverStart",
    "onHoverEnd",
    "onDragStart",
    "onDragEnd",
    "onDoubleTap",
    "onLongPress",
    "onKeyDown",
    "onKeyUp",
    "afterDelayAction",
    "onTapAction",
    "onTapStartAction",
    "onTapCancelAction",
    "onHoverStartAction",
    "onHoverEndAction",
    "onDragStartAction",
    "onDragEndAction",
    "onDoubleTapAction",
    "onLongPressAction",
    "onKeyDownAction",
    "onKeyUpAction",
    "afterDelaySpecificIndex",
    "onTapSpecificIndex",
    "onTapStartSpecificIndex",
    "onTapCancelSpecificIndex",
    "onHoverStartSpecificIndex",
    "onHoverEndSpecificIndex",
    "onDragStartSpecificIndex",
    "onDragEndSpecificIndex",
    "onDoubleTapSpecificIndex",
    "onLongPressSpecificIndex",
    "onKeyDownSpecificIndex",
    "onKeyUpSpecificIndex",
    "afterDelaySpecificName",
    "onTapSpecificName",
    "onTapStartSpecificName",
    "onTapCancelSpecificName",
    "onHoverStartSpecificName",
    "onHoverEndSpecificName",
    "onDragStartSpecificName",
    "onDragEndSpecificName",
    "onDoubleTapSpecificName",
    "onLongPressSpecificName",
    "onKeyDownSpecificName",
    "onKeyUpSpecificName",
    "onKeyDownKey",
    "onKeyUpKey",
    "afterDelayDelay",
    "onLongPressDuration",
]

// console.log(
//     JSON.stringify([
//         ...keyEventTriggerNames.map(name => `${name}Action`),
//         ...keyEventTriggerNames.map(name => `${name}SpecificIndex`),
//         ...keyEventTriggerNames.map(name => `${name}SpecificName`),
//         ...keyEventTriggerNames.map(name => `${name}Key`),
//     ])
// )

export const keyEventTriggerProps = [
    "onKeyDownAction",
    "onKeyUpAction",
    "onKeyDownSpecificIndex",
    "onKeyUpSpecificIndex",
    "onKeyDownSpecificName",
    "onKeyUpSpecificName",
    "onKeyDownKey",
    "onKeyUpKey",
]

// console.log(
//     JSON.stringify([
//         ...automaticEventTriggerNames.map(name => `${name}Action`),
//         ...automaticEventTriggerNames.map(name => `${name}SpecificIndex`),
//         ...automaticEventTriggerNames.map(name => `${name}SpecificName`),
//         ...automaticEventTriggerNames.map(name => `${name}Delay`),
//     ])
// )

export const automaticEventTriggerProps = [
    "afterDelayAction",
    "afterDelaySpecificIndex",
    "afterDelaySpecificName",
    "afterDelayDelay",
]

export const eventTriggerPropertyControls: PropertyControls = {}

for (let trigger of eventTriggerNames) {
    eventTriggerPropertyControls[`${trigger}Action`] = {
        title: eventTriggerTitles[trigger] || trigger,
        type: ControlType.Enum,
        options: ["unset", "specific", "specific-name", "previous", "next"],
        optionTitles: [
            "Not Set",
            "Specific State Index",
            "Specific State Name",
            "Previous State",
            "Next State",
        ],
        defaultValue: "unset",
        hidden: props => props.isInteractive === false,
    }

    eventTriggerPropertyControls[`${trigger}SpecificIndex`] = {
        title: "↳ State",
        type: ControlType.Number,
        displayStepper: true,
        defaultValue: 0,
        hidden: props =>
            props.isInteractive === false ||
            props[`${trigger}Action`] !== "specific",
    }

    eventTriggerPropertyControls[`${trigger}SpecificName`] = {
        title: "↳ State",
        type: ControlType.String,
        defaultValue: "",
        hidden: props =>
            props.isInteractive === false ||
            props[`${trigger}Action`] !== "specific-name",
    }

    if (keyEventTriggerNames.indexOf(trigger) !== -1) {
        eventTriggerPropertyControls[`${trigger}Key`] = {
            title: "↳ Key",
            type: ControlType.String,
            defaultValue: "",
            hidden: props =>
                props.isInteractive === false ||
                props[`${trigger}Action`] === "unset",
        }
    }

    if (automaticEventTriggerNames.indexOf(trigger) !== -1) {
        eventTriggerPropertyControls[`${trigger}Delay`] = {
            title: "↳ Delay",
            type: ControlType.Number,
            displayStepper: true,
            step: 0.1,
            defaultValue: 0,
            hidden: props =>
                props.isInteractive === false ||
                props[`${trigger}Action`] === "unset",
        }
    }

    if (trigger === "onLongPress") {
        eventTriggerPropertyControls["onLongPressDuration"] = {
            title: "↳ Duration",
            type: ControlType.Number,
            displayStepper: true,
            step: 0.1,
            defaultValue: 0.5,
            unit: "s",
            hidden: props =>
                props.isInteractive === false ||
                props[`${trigger}Action`] === "unset",
        }
    }
}

export const transitionPropertyControls: {
    [key: string]: Partial<ControlDescription>
} = {
    transitionConfigType: {
        title: " ",
        type: ControlType.SegmentedEnum,
        options: ["default", "custom"],
        optionTitles: ["Default", "Custom"],
    },

    transitionType: {
        title: "Type",
        type: ControlType.Enum,
        options: ["spring", "tween"],
        optionTitles: ["Spring", "Tween"],
    },

    damping: {
        title: "Damping",
        type: ControlType.Number,
        min: 0,
        max: 50,
    },

    mass: {
        title: "Mass",
        type: ControlType.Number,
        step: 0.1,
        min: 0,
        max: 5,
    },

    stiffness: {
        title: "Stiffness",
        type: ControlType.Number,
        min: 0,
        max: 1000,
    },

    duration: {
        title: "Duration",
        type: ControlType.Number,
        step: 0.1,
        min: 0,
        unit: "s",
        displayStepper: true,
    },

    ease: {
        title: "Easing",
        type: ControlType.Enum,
        options: [
            "custom",
            "linear",
            "easeIn",
            "easeOut",
            "easeInOut",
            "easeInSine",
            "easeOutSine",
            "easeInOutSine",
            "easeInQuad",
            "easeOutQuad",
            "easeInOutQuad",
            "easeInCubic",
            "easeOutCubic",
            "easeInOutCubic",
            "easeInQuart",
            "easeOutQuart",
            "easeInOutQuart",
            "easeInQuint",
            "easeOutQuint",
            "easeInOutQuint",
            "easeInExpo",
            "easeOutExpo",
            "easeInOutExpo",
            "circIn",
            "circOut",
            "circInOut",
            "backIn",
            "backOut",
            "backInOut",
            "anticipate",
        ],
        optionTitles: [
            "Custom",
            "linear",
            "easeIn",
            "easeOut",
            "easeInOut",
            "easeInSine",
            "easeOutSine",
            "easeInOutSine",
            "easeInQuad",
            "easeOutQuad",
            "easeInOutQuad",
            "easeInCubic",
            "easeOutCubic",
            "easeInOutCubic",
            "easeInQuart",
            "easeOutQuart",
            "easeInOutQuart",
            "easeInQuint",
            "easeOutQuint",
            "easeInOutQuint",
            "easeInExpo",
            "easeOutExpo",
            "easeInOutExpo",
            "circIn",
            "circOut",
            "circInOut",
            "backIn",
            "backOut",
            "backInOut",
            "anticipate",
        ],
    },

    customEase: {
        title: " ",
        type: ControlType.String,
    },
}
