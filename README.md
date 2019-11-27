# Switch

`Switch` is a utility component that lets you switch between different states of an element on the canvas using animated transitions. It comes with an additional `SwitchToStateAction` component, which acts as a hotspot that can change the current state of a `Switch` without writing any code.

**[→ View documentation on GitHub](https://github.com/tisho/Switch.framerfx)**

# Examples

**[→ Download all examples (.framerx file)](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-examples.framerx)**

## Bottom Sheet

![Bottom Sheet Example](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-bottom-sheet-low.gif)

## Tabs

![Tabs Example](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-tabs-low.gif)

## Carousel

![Carousel Example](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-carousel.gif)

## Tooltip

![Tooltip](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-tooltip.gif)

## Toggle

![Toggle](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-toggle.gif)

# Usage

## Interactive Switch

Interactive Switches can manage their own state. Use them when you need to have a Switch change its own state when it's tapped / hovered over. Here are a few examples of components that are a good fit for an interactive Switch:

-   A button with a normal / hover / active state
-   An on/off toggle
-   A checkbox
-   A tooltip that expands on hover

### Creating an Interactive Switch

1. Drag and drop a Switch component onto the canvas.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-1.png" width="600">

2. Connect it to the states you want to switch between.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-2.png" width="600">

3. In the properties panel, set "Interactive" to "Yes".

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-3.png" width="227">

4. Choose the trigger for the state change, and the target action.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-4.png" width="227">

5. Customize the transition to use when switching between states.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-5.png" width="227">

6. Preview your prototype.

## Controlled Switch

Controlled Switches rely on other elements to set their state. Here are a few use cases that are a good fit for a controlled Switch:

-   A bottom sheet that changes its contents based on a button being pressed.
-   Tabbed navigation
-   A carousel with external Previous / Next buttons

### Creating a Controlled Switch

1. Drag and drop a Switch component onto the canvas.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-1.png" width="600">

2. Connect it to the states you want to switch between.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-2.png" width="600">

3. Choose a unique name for your switch. This name will let other `SwitchToStateAction` hotspots control the state of your switch.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-3.png" width="227">

4. Drag and drop a `SwitchToStateAction` component onto the canvas. This component will act as a hotspot that changes the state of a Switch component when the user interacts with it.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-4.png" width="400">

5. Change the name of the target `Switch` to the name you used in step 3, then pick a trigger, and a target state.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-5.png" width="227">

6. Customize the transition to use when switching between states.

<img src="https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-6.png" width="227">

7. Preview your prototype.

# Using Switch in Code

Use these in Overrides, or when you use the `Switch` component from code.

## Switch Overrides

| Prop            | Type     | Description                                                                                                                                                                                                                                                                                                                            |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier`    | string   | The name of the Switch instance. Make sure this is unique.                                                                                                                                                                                                                                                                             |
| `initialState`  | number   | The index of the initial state of the Switch. Default: `0`                                                                                                                                                                                                                                                                             |
| `overflow`      | boolean  | Whether content outside the bounds of the container will be shown or not. Default: `true`                                                                                                                                                                                                                                              |
| `onSwitch`      | function | A callback function that will be called whenever the Switch component switches its state. The function is passed in the current state index, the previous state index, and the identifier of the Switch component in this order.                                                                                                       |
| `shouldTrigger` | function | A callback function that will be called right before a trigger is fired. Returning `false` from this callback will stop the trigger from firing. All original arguments to the trigger will be passed down to the function (e.g. `event`)                                                                                              |
| `transition`    | enum     | The transition to use when switching states. Can be one of: `instant`, `dissolve`, `zoom`, `zoomout`, `zoomin`, `swapup`, `swapdown`, `swapleft`, `swapright`, `slidehorizontal`, `slidevertical`, `slideup`, `slidedown`, `slideleft`, `slideright`, `pushhorizontal`, `pushvertical`, `pushup`, `pushdown`, `pushleft`, `pushright`. |

## SwitchToStateAction Overrides

| Prop            | Type     | Description                                                                                                                                                                                                                               |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`        | string   | The name of the Switch instance to target. Make sure this is unique and matches the name of an existing Switch.                                                                                                                           |
| `shouldTrigger` | function | A callback function that will be called right before a trigger is fired. Returning `false` from this callback will stop the trigger from firing. All original arguments to the trigger will be passed down to the function (e.g. `event`) |

## Controlling Switches with the `useSwitch` Hook

To control Switches from code, first import the `useSwitch` hook at the top of your file:

```
import { useSwitch } from "@framer/tishogeorgiev.switch"
```

Then call the `useSwitch()` hook in your code component or override:

```typescript
export function SwitchButton(): Override {
    const controls = useSwitch()

    return {
        onTap: () => {
            controls.setSwitchStateIndex("sharedSwitch", 1)
        },
    }
}
```

Note: you can **only** call this hook from inside a React component or override. Calling it from a different place in your code could result in unexpected behavior. [Read more about the rules of hook usage](https://reactjs.org/docs/hooks-rules.html).

The `useSwitch` hook will return a controls object, containing the following functions:

-   `controls.getSwitches() => string[]`

    Returns an array of identifiers for all registered Switches.

-   `controls.getSwitchStateIndex(identifier: string) => number`

    Returns the index of the current state of a Switch.

-   `controls.setSwitchStateIndex(identifier: string, state: number)`

    Sets the current state index of a Switch. If the index isn't valid, it will still be accepted, but the targeted Switch will remain set to its last known good state.

-   `controls.getAllSwitchStates(identifier: string) => string[]`

    Returns an array of all names states for a Switch. Frames that haven't been explicitly named might have `undefined` as their name.

-   `controls.registerSwitchStates(identifier: string, states: string[])`

    Registers a list of named states for a particular Switch identifier. For internal use only.

# Release Notes

11/21/2019

-   NEW: Added `onSwitch` callback to Switch component, which will be called when the current state changes.

# Get In Touch

-   **@tisho** on Twitter
-   **@tisho** on the [Framer Slack](https://www.framer.com/community/)
