# Switch

`Switch` is a utility component that lets you switch between different states of an element on the canvas using animated transitions. It comes with an additional `SwitchToStateAction` component, which acts as a hotspot that can change the current state of a `Switch` without writing any code.

# Examples

![Download all examples (.framerx file)]()

## Bottom Sheet

## Tabs

## Carousel

## Tooltip

## Toggle

# Usage

## Interactive Switch

Interactive Switches can manage their own state. Use them when you need to have a Switch change its own state when it's tapped / hovered over. Here are a few examples of components that are a good fit for an interactive Switch:

-   A button with a normal / hover / active state
-   An on/off toggle
-   A checkbox
-   A tooltip that expands on hover

### Creating an Interactive Switch

1. Drag and drop a Switch component onto the canvas.

2. Connect it to the states you want to switch between.

3. Set "Interactive" to "Yes".

4. Choose the trigger for the state change, and the target action.

5. Customize the transition to use when switching between states.

6. Preview your prototype.

## Controlled Switch

Controlled Switches rely on other elements to set their state. Here are a few use cases that are a good fit for a controlled Switch:

-   A bottom sheet that changes its contents based on a button being pressed.
-   Tabbed navigation
-   A carousel with external Previous / Next buttons

### Creating a Controlled Switch

1. Drag and drop a Switch component onto the canvas.

2. Connect it to the states you want to switch between.

3. Choose a unique name for your switch. This name will let other `SwitchToStateAction` hotspots control the state of your switch.

4. Drag and drop a `SwitchToStateAction` component onto the canvas. This component will act as a hotspot that changes the state of a Switch component when the user interacts with it.

5. Change the name of the target `Switch` to the name you used in step 3, then pick a trigger, and a target state.

6. Customize the transition to use when switching between states.

7. Preview your prototype.

# Using Switch with Overrides
