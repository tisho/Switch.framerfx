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

# Get In Touch

-   **@tisho** on Twitter
-   **@tisho** on the [Framer Slack](https://www.framer.com/community/)
