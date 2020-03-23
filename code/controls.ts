import { ControlType, PropertyControls } from "framer"

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

export const eventTriggerProps = [
    ...eventTriggerNames,
    ...eventTriggerNames.map(name => `${name}Action`),
    ...eventTriggerNames.map(name => `${name}SpecificIndex`),
    ...eventTriggerNames.map(name => `${name}SpecificName`),
    ...keyEventTriggerNames.map(name => `${name}Key`),
    ...automaticEventTriggerNames.map(name => `${name}Delay`),
    "onLongPressDuration",
]

export const keyEventTriggerProps = [
    ...keyEventTriggerNames.map(name => `${name}Action`),
    ...keyEventTriggerNames.map(name => `${name}SpecificIndex`),
    ...keyEventTriggerNames.map(name => `${name}SpecificName`),
    ...keyEventTriggerNames.map(name => `${name}Key`),
]

export const automaticEventTriggerProps = [
    ...automaticEventTriggerNames.map(name => `${name}Action`),
    ...automaticEventTriggerNames.map(name => `${name}SpecificIndex`),
    ...automaticEventTriggerNames.map(name => `${name}SpecificName`),
    ...automaticEventTriggerNames.map(name => `${name}Delay`),
]

export const eventTriggerPropertyControls: PropertyControls = eventTriggerNames.reduce(
    (res, trigger) => {
        res[`${trigger}Action`] = {
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

        res[`${trigger}SpecificIndex`] = {
            title: "↳ State",
            type: ControlType.Number,
            displayStepper: true,
            defaultValue: 0,
            hidden: props =>
                props.isInteractive === false ||
                props[`${trigger}Action`] !== "specific",
        }

        res[`${trigger}SpecificName`] = {
            title: "↳ State",
            type: ControlType.String,
            defaultValue: "",
            hidden: props =>
                props.isInteractive === false ||
                props[`${trigger}Action`] !== "specific-name",
        }

        if (keyEventTriggerNames.indexOf(trigger) !== -1) {
            res[`${trigger}Key`] = {
                title: "↳ Key",
                type: ControlType.String,
                defaultValue: "",
                hidden: props =>
                    props.isInteractive === false ||
                    props[`${trigger}Action`] === "unset",
            }
        }

        if (automaticEventTriggerNames.indexOf(trigger) !== -1) {
            res[`${trigger}Delay`] = {
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
            res["onLongPressDuration"] = {
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

        return res
    },
    {}
)
