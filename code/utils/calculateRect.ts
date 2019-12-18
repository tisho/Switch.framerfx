import { Animatable, Rect } from "framer"

function isString(t: any): t is string {
    return typeof t === "string"
}

export function isFiniteNumber(value: any): value is number {
    return typeof value === "number" && isFinite(value)
}

function containsInvalidStringValues(props): boolean {
    const { left, right, top, bottom, center } = props
    // We never allow right or bottom to be strings
    if ([right, bottom].some(isString)) {
        return true
    }
    // Only allow a string for left, if it is part of the centering logic
    if (isString(left) && (!center || center === "y")) {
        // We are not centering or only centering in the opposite direction
        return true
    }
    // Only allow a string for top, if it is part of the centering logic
    if (isString(top) && (!center || center === "x")) {
        // We are not centering or only centering in the opposite direction
        return true
    }
    return false
}

export function constraintsEnabled(props) {
    const { _constraints } = props
    if (!_constraints) {
        return false
    }

    if (containsInvalidStringValues(props)) {
        return false
    }

    return _constraints.enabled
}

function sizeFromFiniteNumberProps(props) {
    const { size } = props
    let { width, height } = props
    if (isFiniteNumber(size)) {
        if (width === undefined) {
            width = size
        }
        if (height === undefined) {
            height = size
        }
    }
    if (isFiniteNumber(width) && isFiniteNumber(height)) {
        return {
            width: width,
            height: height,
        }
    }
    return null
}

function rectFromFiniteNumberProps(props) {
    const size = sizeFromFiniteNumberProps(props)
    if (size === null) {
        return null
    }
    const { left, top } = props
    if (isFiniteNumber(left) && isFiniteNumber(top)) {
        return {
            x: left,
            y: top,
            ...size,
        }
    }
    return null
}

export function pixelAligned(rect: Rect): Rect {
    const x = Math.round(rect.x)
    const y = Math.round(rect.y)
    const rectMaxX = Math.round(rect.x + rect.width)
    const rectMaxY = Math.round(rect.y + rect.height)
    const width = Math.max(rectMaxX - x, 0)
    const height = Math.max(rectMaxY - y, 0)
    return { x, y, width, height }
}

export enum ParentSizeState {
    Unknown, // There is no known ParentSize
    Disabled, // ParentSize should not be used for layout
}

export function deprecatedParentSize(parentSize) {
    if (
        parentSize === ParentSizeState.Unknown ||
        parentSize === ParentSizeState.Disabled
    ) {
        return null
    }
    return parentSize
}

export namespace ConstraintValues {
    // Returns a parent-relative rect given concrete ConstraintValues.
    export const toRect = (
        values,
        parentSize,
        autoSize,
        pixelAlign,
        // This argument is actually never used, because fractional sizes are always calculated by it's parent to static sizes
        freeSpace = null
    ) => {
        let x = values.left || 0
        let y = values.top || 0
        let width: number | null = null
        let height: number | null = null

        const parentWidth = parentSize
            ? Animatable.getNumber(parentSize.width)
            : null
        const parentHeight = parentSize
            ? Animatable.getNumber(parentSize.height)
            : null

        const hOpposingPinsOffset = pinnedOffset(values.left, values.right)

        if (parentWidth && isFiniteNumber(hOpposingPinsOffset)) {
            width = parentWidth - hOpposingPinsOffset
        } else if (autoSize && values.widthType === DimensionType.Auto) {
            width = autoSize.width
        } else if (isFiniteNumber(values.width)) {
            switch (values.widthType) {
                case DimensionType.FixedNumber:
                    width = values.width
                    break
                case DimensionType.FractionOfFreeSpace:
                    width = freeSpace
                        ? (freeSpace.freeSpaceInParent.width /
                              freeSpace.freeSpaceUnitDivisor.width) *
                          values.width
                        : null
                    break
                case DimensionType.Percentage:
                    if (parentWidth) {
                        width = parentWidth * values.width
                    }
                    break
            }
        }

        const vOpposingPinsOffset = pinnedOffset(values.top, values.bottom)

        if (parentHeight && isFiniteNumber(vOpposingPinsOffset)) {
            height = parentHeight - vOpposingPinsOffset
        } else if (autoSize && values.heightType === DimensionType.Auto) {
            height = autoSize.height
        } else if (isFiniteNumber(values.height)) {
            switch (values.heightType) {
                case DimensionType.FixedNumber:
                    height = values.height
                    break
                case DimensionType.FractionOfFreeSpace:
                    height = freeSpace
                        ? (freeSpace.freeSpaceInParent.height /
                              freeSpace.freeSpaceUnitDivisor.height) *
                          values.height
                        : null
                    break
                case DimensionType.Percentage:
                    if (parentHeight) {
                        height = parentHeight * values.height
                    }
                    break
            }
        }

        const sizeWithDefaults = sizeAfterApplyingDefaultsAndAspectRatio(
            width,
            height,
            values
        )
        width = sizeWithDefaults.width
        height = sizeWithDefaults.height

        if (values.left !== null) {
            x = values.left
        } else if (parentWidth && values.right !== null) {
            x = parentWidth - values.right - width
        } else if (parentWidth) {
            x = values.centerAnchorX * parentWidth - width / 2
        }

        if (values.top !== null) {
            y = values.top
        } else if (parentHeight && values.bottom !== null) {
            y = parentHeight - values.bottom - height
        } else if (parentHeight) {
            y = values.centerAnchorY * parentHeight - height / 2
        }

        const f = { x, y, width, height }
        if (pixelAlign) {
            return pixelAligned(f)
        }
        return f
    }
}

const defaultWidth = 200
const defaultHeight = 200

export enum DimensionType {
    FixedNumber,
    Percentage,
    /** @internal */ Auto,
    FractionOfFreeSpace,
}

function sizeAfterApplyingDefaultsAndAspectRatio(
    width: number | null,
    height: number | null,
    values
) {
    let w = isFiniteNumber(width) ? width : defaultWidth
    let h = isFiniteNumber(height) ? height : defaultHeight

    if (isFiniteNumber(values.aspectRatio)) {
        if (isFiniteNumber(values.left) && isFiniteNumber(values.right)) {
            h = w / values.aspectRatio
        } else if (
            isFiniteNumber(values.top) &&
            isFiniteNumber(values.bottom)
        ) {
            w = h * values.aspectRatio
        } else if (values.widthType !== DimensionType.FixedNumber) {
            h = w / values.aspectRatio
        } else {
            w = h * values.aspectRatio
        }
    }

    return {
        width: w,
        height: h,
    }
}

function pinnedOffset(start: number | null, end: number | null) {
    if (!isFiniteNumber(start) || !isFiniteNumber(end)) return null
    return start + end
}

export function calculateRect(props, parentSize, pixelAlign: boolean = true) {
    // if (!constraintsEnabled(props) || parentSize === ParentSizeState.Disabled) {
    // if (!constraintsEnabled(props)) {
    //     return rectFromFiniteNumberProps(props)
    // }
    const constraintValues = getConstraintValues(props)

    return ConstraintValues.toRect(
        constraintValues,
        deprecatedParentSize(parentSize),
        null,
        pixelAlign
    )
}

export namespace ConstraintMask {
    // Modifies the constraint mask to remove invalid (mutually exclusive) options and returns the original.
    // TODO: this removes major inconsistencies but probably needs to be merged with ConstraintSolver.
    export const quickfix = constraints => {
        if (constraints.fixedSize) {
            // auto sized text
            // TODO: use auto dimension type
            constraints.widthType = DimensionType.FixedNumber
            constraints.heightType = DimensionType.FixedNumber
            constraints.aspectRatio = null
        }

        if (isFiniteNumber(constraints.aspectRatio)) {
            if (
                (constraints.left && constraints.right) ||
                (constraints.top && constraints.bottom)
            ) {
                constraints.widthType = DimensionType.FixedNumber
                constraints.heightType = DimensionType.FixedNumber
            }
            if (
                constraints.left &&
                constraints.right &&
                constraints.top &&
                constraints.bottom
            ) {
                constraints.bottom = false
            }
            if (
                constraints.widthType !== DimensionType.FixedNumber &&
                constraints.heightType !== DimensionType.FixedNumber
            ) {
                constraints.heightType = DimensionType.FixedNumber
            }
        }

        if (constraints.left && constraints.right) {
            constraints.widthType = DimensionType.FixedNumber

            if (constraints.fixedSize) {
                constraints.right = false
            }
        }
        if (constraints.top && constraints.bottom) {
            constraints.heightType = DimensionType.FixedNumber

            if (constraints.fixedSize) {
                constraints.bottom = false
            }
        }

        return constraints
    }
}

export function valueToDimensionType(
    value: string | number | Animatable<number> | undefined
) {
    if (typeof value === "string") {
        const trimmedValue = value.trim()
        if (trimmedValue === "auto") return DimensionType.Auto
        if (trimmedValue.endsWith("fr"))
            return DimensionType.FractionOfFreeSpace
        if (trimmedValue.endsWith("%")) return DimensionType.Percentage
    }
    return DimensionType.FixedNumber
}

function getConstraintValues(props) {
    const { left, right, top, bottom, center, _constraints = {}, size } = props
    let { width, height } = props
    if (width === undefined) {
        width = size
    }
    if (height === undefined) {
        height = size
    }
    const { aspectRatio, autoSize } = _constraints
    const constraintMask = ConstraintMask.quickfix({
        left: isFiniteNumber(left),
        right: isFiniteNumber(right),
        top: isFiniteNumber(top),
        bottom: isFiniteNumber(bottom),
        widthType: valueToDimensionType(width),
        heightType: valueToDimensionType(height),
        aspectRatio: aspectRatio || null,
        fixedSize: autoSize === true,
    })

    let widthValue: number | null = null
    let heightValue: number | null = null

    let widthType = DimensionType.FixedNumber
    let heightType = DimensionType.FixedNumber

    if (
        constraintMask.widthType !== DimensionType.FixedNumber &&
        typeof width === "string"
    ) {
        const parsedWidth = parseFloat(width)

        if (width.endsWith("fr")) {
            widthType = DimensionType.FractionOfFreeSpace
            widthValue = parsedWidth
        } else if (width === "auto") {
            widthType = DimensionType.Auto
        } else {
            // Percentage
            widthType = DimensionType.Percentage
            widthValue = parsedWidth / 100
        }
    } else if (width !== undefined && typeof width !== "string") {
        widthValue = width
    }

    if (
        constraintMask.heightType !== DimensionType.FixedNumber &&
        typeof height === "string"
    ) {
        const parsedHeight = parseFloat(height)

        if (height.endsWith("fr")) {
            heightType = DimensionType.FractionOfFreeSpace
            heightValue = parsedHeight
        } else if (height === "auto") {
            heightType = DimensionType.Auto
        } else {
            // Percentage
            heightType = DimensionType.Percentage
            heightValue = parseFloat(height) / 100
        }
    } else if (height !== undefined && typeof height !== "string") {
        heightValue = height
    }

    let centerAnchorX = 0.5
    let centerAnchorY = 0.5
    // XXX: is this
    if (center === true || center === "x") {
        constraintMask.left = false
        if (typeof left === "string") {
            centerAnchorX = parseFloat(left) / 100
        }
    }
    if (center === true || center === "y") {
        constraintMask.top = false
        if (typeof top === "string") {
            centerAnchorY = parseFloat(top) / 100
        }
    }

    return {
        // Because we check isFiniteNumber when creating the masks,
        // We know that left, right, top and bottom are numbers if the mask is true for the corresponding value
        // We need to cast this because typescript does not understand that
        left: constraintMask.left ? (left as number) : null,
        right: constraintMask.right ? (right as number) : null,
        top: constraintMask.top ? (top as number) : null,
        bottom: constraintMask.bottom ? (bottom as number) : null,
        widthType,
        heightType,
        width: widthValue,
        height: heightValue,
        aspectRatio: constraintMask.aspectRatio || null,
        centerAnchorX: centerAnchorX,
        centerAnchorY: centerAnchorY,
    }
}
