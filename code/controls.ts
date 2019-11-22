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
    ...eventTriggerNames.map(name => `${name}SpecificIndex`),
]

export const eventTriggerPropertyControls: PropertyControls = eventTriggerNames.reduce(
    (res, trigger) => {
        res[trigger] = {
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
                props.isInteractive === false || props[trigger] !== "specific",
        }

        return res
    },
    {}
)

// export const eventTriggerPropertyControls: PropertyControls = {
//     onTap: {
//         title: "On Tap",
//         type: ControlType.Enum,
//         options: ["unset", "specific", "previous", "next"],
//         optionTitles: [
//             "Not Set",
//             "Specific State",
//             "Previous State",
//             "Next State",
//         ],
//         hidden: props => props.isInteractive === false,
//     },

//     onTapSpecificIndex: {
//         title: " ",
//         type: ControlType.Number,
//         displayStepper: true,
//         defaultValue: 0,
//         hidden: props =>
//             props.isInteractive === false || props.onTap !== "specific",
//     },

//     onTapStart: {
//         title: "Tap Start",
//         type: ControlType.Enum,
//         options: ["unset", "specific", "previous", "next"],
//         optionTitles: [
//             "Not Set",
//             "Specific State",
//             "Previous State",
//             "Next State",
//         ],
//         hidden: props => props.isInteractive === false,
//     },

//     onTapStartSpecificIndex: {
//         title: " ",
//         type: ControlType.Number,
//         displayStepper: true,
//         defaultValue: 0,
//         hidden: props =>
//             props.isInteractive === false || props.onTapStart !== "specific",
//     },

//     onTapCancel: {
//         title: "Tap Cancel",
//         type: ControlType.Enum,
//         options: ["unset", "specific", "previous", "next"],
//         optionTitles: [
//             "Not Set",
//             "Specific State",
//             "Previous State",
//             "Next State",
//         ],
//         hidden: props => props.isInteractive === false,
//     },

//     onTapCancelSpecificIndex: {
//         title: " ",
//         type: ControlType.Number,
//         displayStepper: true,
//         defaultValue: 0,
//         hidden: props =>
//             props.isInteractive === false || props.onTapCancel !== "specific",
//     },

//     onHoverStart: {
//         title: "Hover Start",
//         type: ControlType.Enum,
//         options: ["unset", "specific", "previous", "next"],
//         optionTitles: [
//             "Not Set",
//             "Specific State",
//             "Previous State",
//             "Next State",
//         ],
//         hidden: props => props.isInteractive === false,
//     },

//     onHoverStartSpecificIndex: {
//         title: " ",
//         type: ControlType.Number,
//         displayStepper: true,
//         defaultValue: 0,
//         hidden: props =>
//             props.isInteractive === false || props.onHoverStart !== "specific",
//     },

//     onHoverEnd: {
//         title: "Hover End",
//         type: ControlType.Enum,
//         options: ["unset", "specific", "previous", "next"],
//         optionTitles: [
//             "Not Set",
//             "Specific State",
//             "Previous State",
//             "Next State",
//         ],
//         hidden: props => props.isInteractive === false,
//     },

//     onHoverEndSpecificIndex: {
//         title: " ",
//         type: ControlType.Number,
//         displayStepper: true,
//         defaultValue: 0,
//         hidden: props =>
//             props.isInteractive === false || props.onHoverEnd !== "specific",
//     },

//     onDragStart: {
//         title: "Drag Start",
//         type: ControlType.Enum,
//         options: ["unset", "specific", "previous", "next"],
//         optionTitles: [
//             "Not Set",
//             "Specific State",
//             "Previous State",
//             "Next State",
//         ],
//         hidden: props => props.isInteractive === false,
//     },

//     onDragStartSpecificIndex: {
//         title: " ",
//         type: ControlType.Number,
//         displayStepper: true,
//         defaultValue: 0,
//         hidden: props =>
//             props.isInteractive === false || props.onDragStart !== "specific",
//     },

//     onDragEnd: {
//         title: "Drag End",
//         type: ControlType.Enum,
//         options: ["unset", "specific", "previous", "next"],
//         optionTitles: [
//             "Not Set",
//             "Specific State",
//             "Previous State",
//             "Next State",
//         ],
//         hidden: props => props.isInteractive === false,
//     },

//     onDragEndSpecificIndex: {
//         title: " ",
//         type: ControlType.Number,
//         displayStepper: true,
//         defaultValue: 0,
//         hidden: props =>
//             props.isInteractive === false || props.onDragEnd !== "specific",
//     },
// }
