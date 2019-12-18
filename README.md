# Switch

`Switch` is a utility component that lets you switch between different states of an element on the canvas using animated transitions. It comes with an additional `SwitchToStateAction` component, which acts as a hotspot that can change the current state of a `Switch` without writing any code.

**[→ View documentation on GitHub](https://github.com/tisho/Switch.framerfx)**

# Latest Release

12/15/2019

-   **NEW: Auto-Animate (Magic Move)** added to the list of available transitions between states. Read on to [find out how Auto Animate works](#auto-animating-between-states), and definitely let me know if you spot any bugs when using the auto-animate transition.
-   NEW: Switch names can now be set to "Auto" if you never intend to set their state from a hotspot or through code, and don't want the Switch state to be shared with another Switch.
-   NEW: Added "After Delay" to the list of available triggers, which lets you switch to another state after a specified amount of time. The time is counted from the moment the hotspot (`SwitchToStateAction`) or the Switch component is mounted on the current view.
-   NEW: Added two new actions available through the `useSwitch` hook: `setNextSwitchStateIndex` and `setPreviousSwitchStateIndex`, allowing you to quickly set the next/previous state of a Switch.
-   FIX: Any time a Switch updated its state, all Switches in view would re-render, regardless of whether the update was intended for them, or not. This is no longer the case.

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

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-1.png)

2. Connect it to the states you want to switch between.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-2.png)

3. In the properties panel, set "Interactive" to "Yes".

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-3.png)

4. Choose the trigger for the state change, and the target action.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-4.png)

5. Customize the transition to use when switching between states.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-interactive-5.png)

6. Preview your prototype.

## Controlled Switch

Controlled Switches rely on other elements to set their state. Here are a few use cases that are a good fit for a controlled Switch:

-   A bottom sheet that changes its contents based on a button being pressed.
-   Tabbed navigation
-   A carousel with external Previous / Next buttons

### Creating a Controlled Switch

1. Drag and drop a Switch component onto the canvas.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-1.png)

2. Connect it to the states you want to switch between.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-2.png)

3. Choose a unique name for your switch. This name will let other `SwitchToStateAction` hotspots control the state of your switch.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-3.png)

4. Drag and drop a `SwitchToStateAction` component onto the canvas. This component will act as a hotspot that changes the state of a Switch component when the user interacts with it.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-4.png)

5. Change the name of the target `Switch` to the name you used in step 3, then pick a trigger, and a target state.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-5.png)

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-6.png)

6. Customize the transition to use when switching between states.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-controlled-7.png)

7. Preview your prototype.

# Auto-Animating Between States

The "Auto-Animate" transition works differently from the other available state transitions. When triggered, elements shared between two states will animate their properties smoothly between each state. If there are elements in the next state that don't exist in the current one, they'll fade in, and elements that should no longer be shown will fade out.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-example-fancy-add-menu.gif)

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-example-icon-morph.gif)

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-example-item-list.gif)

## How Element Matching Works

Before an auto-animate transition begins, the Switch component looks for matching elements between the current and the next state. To figure out if an element matches another element, it looks at:

-   the element's name in the layer panel
-   its type (Frame, Stack, code component, etc)
-   its order in the layer list
-   what level of the layer hierarchy it sits in (i.e. whether it's nested in another Frame)

Note: Names of Graphic layers are currently not recognized properly. To transition between Graphic layers, wrap them in a Frame and name the Frame.

## Supported Transitions Between Matching Elements

If an element is found to be matching another element, we'll create an animated transition for the following properties:

-   Size
-   Position (including layout in Stacks)
-   Rotation
-   Opacity
-   Background (linear gradients, radial gradients, and image fill transitions are all supported)
-   Border (radius, color and width)
-   Shadow (up to 10 box / inner shadows are supported)

If the two matching elements are of a different type (e.g. a transition between a Frame and a Graphic), or are of a type where a smooth transition isn't possible (e.g. transitions between two Text layers), the two elements will be animated using a cross-dissolve.

## Customizing Auto-Animation Transition Timing

Each auto-animate transition groups transitioning elements in 3 categories:

-   Morphing Elements: Elements that exist both in the current and the next state
-   Entering Elements: Elements that only exist in the next state
-   Exiting Elements: Elements that only exist in the current state

Each group can have different transition timing. Morphing elements always use the timing options defined right below the "Transition" property when it's set to "Auto-Animate". The Enter and Exit transitions will have their own options right below (by default, they're set to a 0.3s dissolve).

Additionally, auto-animate lets you take advantage of Framer Motion's ability to stagger or delay animations of nested elements.

![](https://tisho-co.s3.amazonaws.com/img/framer-switch/switch-auto-animate-transition-options.png)

## Auto-Animations Between Code Components

Since code components can render arbitrary HTML, it's hard for Switch to figure out if content rendered by the code component should also be auto-animated. To get around this issue, whenever it encounters a Code Component, the Switch will only animate its position and size. It will then determine if any of the component's props have changed between the different states, and if they have, it will pass the new props to the component.

Matching code components will not get unmounted and remounted between states, just passed new props. This is especially powerful with components that are expensive to fully re-render, like maps and videos.

If this behavior doesn't match what you expect, you can set the `morphCodeComponentPropsOnly` prop on a Switch instance to `false` through an Override, and we'll fall back to a cross-dissolve between the two states of the code component.

# Using Switch in Code

Use these in Overrides, or when you use the `Switch` component from code.

## Switch Overrides

| Prop                   | Type     | Description                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoAssignIdentifier` | boolean  | When `true`, the Switch instance will get its own random identifier automatically. Default: `false`                                                                                                                                                                                                                                                   |
| `identifier`           | string   | The name of the Switch instance. Make sure this is unique.                                                                                                                                                                                                                                                                                            |
| `initialState`         | number   | The index of the initial state of the Switch. Default: `0`                                                                                                                                                                                                                                                                                            |
| `overflow`             | boolean  | Whether content outside the bounds of the container will be shown or not. Default: `true`                                                                                                                                                                                                                                                             |
| `onSwitch`             | function | A callback function that will be called whenever the Switch component switches its state. The function is passed in the current state index, the previous state index, and the identifier of the Switch component in this order.                                                                                                                      |
| `shouldTrigger`        | function | A callback function that will be called right before a trigger is fired. Returning `false` from this callback will stop the trigger from firing. All original arguments to the trigger will be passed down to the function (e.g. `event`)                                                                                                             |
| `transition`           | enum     | The transition to use when switching states. Can be one of: `instant`, `autoanimate`, `dissolve`, `zoom`, `zoomout`, `zoomin`, `swapup`, `swapdown`, `swapleft`, `swapright`, `slidehorizontal`, `slidevertical`, `slideup`, `slidedown`, `slideleft`, `slideright`, `pushhorizontal`, `pushvertical`, `pushup`, `pushdown`, `pushleft`, `pushright`. |

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

-   `controls.setNextSwitchStateIndex(identifier: string, options: { wrapAround?: boolean } = {})`

    Sets the current state index of a Switch to the next available index. The second `options` parameter is optional, and allows you to specify whether the index will wrap around if trying to advance past the last one. By default, `wrapAround` is true.

-   `controls.setPreviousSwitchStateIndex(identifier: string, options: { wrapAround?: boolean } = {})`

    Sets the current state index of a Switch to the previous index (one behind the current one). The second `options` parameter is optional, and allows you to specify whether the index will wrap around if trying to go back beyond the first one. By default, `wrapAround` is true.

-   `controls.getAllSwitchStates(identifier: string) => string[]`

    Returns an array of all names states for a Switch. Frames that haven't been explicitly named might have `undefined` as their name.

-   `controls.registerSwitchStates(identifier: string, states: string[])`

    Registers a list of named states for a particular Switch identifier. For internal use only.

# Past Releases

12/8/2019

-   FIX: Ensured that default props are correctly passed to a Switch component when used directly from code.

11/28/2019

-   FIX: Fixed an issue where the connecting the first state of a Switch would cause an error.
-   FIX: Fixed an issue that prevented event handlers you set through Overrides from firing if the same trigger wasn't also set on the Switch instance.

11/27/2019

-   NEW: Added two new triggers: "Key Down" and "Key Up", which allow you to switch states using keyboard shortcuts. You can use single keys as shortcuts, or more complex shortcuts like `ctrl+o, cmd+shift+t`. Switch uses the popular [hotkeys-js](https://github.com/jaywcjlove/hotkeys) library, so take a look at some of the examples on its Github page to get an idea of the syntax.

11/26/2019

-   **BREAKING CHANGE:** `SwitchToStateAction` now lets you define actions for multiple triggers, similar to a fully interactive Switch. Unfortunately, this change isn't compatible with the previous version of this package, so if you update to the latest version, make sure you rewire all hotspots you're using.
-   NEW: Code-level API for controlling Switches using the new `useSwitch` hook. More details in the docs below.
-   NEW: Added a `shouldTrigger` callback to SwitchToStateAction, which will be called whenever a trigger is about to be executed. If `shouldTrigger` returns `false`, the trigger won't fire. Check out the "Slide to Unlock" example in the updated examples project.
-   FIX: Fixed an issue that prevented Switches to use plain Stacks or some code component instances as states.
-   FIX: If an invalid state index is passed to the Switch, it will now stay at the last known good state, instead of reverting to the placeholder state.

11/21/2019

-   NEW: Added `onSwitch` callback to Switch component, which will be called when the current state changes.

# Get In Touch

-   **@tisho** on Twitter
-   **@tisho** on the [Framer Slack](https://www.framer.com/community/)
