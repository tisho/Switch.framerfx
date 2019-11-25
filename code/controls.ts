import { ControlType, PropertyControls } from "framer"

export const eventTriggerNames = [
    "onTap",
    "onTapStart",
    "onTapCancel",
    "onHoverStart",
    "onHoverEnd",
    "onDragStart",
    "onDragEnd",
]

export const eventTriggerTitles = {
    onTap: "On Tap",
    onTapStart: "Tap Start",
    onTapCancel: "Tap Cancel",
    onHoverStart: "Hover Start",
    onHoverEnd: "Hover End",
    onDragStart: "Drag Start",
    onDragEnd: "Drag End",
}

export const eventTriggerProps = [
    ...eventTriggerNames,
    ...eventTriggerNames.map(name => `${name}Action`),
    ...eventTriggerNames.map(name => `${name}SpecificIndex`),
]

export const eventTriggerPropertyControls: PropertyControls = eventTriggerNames.reduce(
    (res, trigger) => {
        res[`${trigger}Action`] = {
            title: eventTriggerTitles[trigger] || trigger,
            type: ControlType.Enum,
            options: ["unset", "specific", "previous", "next"],
            optionTitles: [
                "Not Set",
                "Specific State",
                "Previous State",
                "Next State",
            ],
            hidden: props => props.isInteractive === false,
        }

        res[`${trigger}SpecificIndex`] = {
            title: " ",
            type: ControlType.Number,
            displayStepper: true,
            defaultValue: 0,
            hidden: props =>
                props.isInteractive === false ||
                props[`${trigger}Action`] !== "specific",
        }

        return res
    },
    {}
)
