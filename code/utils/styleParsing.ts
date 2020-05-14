import { Color, LinearGradient, RadialGradient } from "framer"
import { omit } from "./omit"
import { equalizeArrayLength } from "./equalizeArrayLength"

export const getOpacity = (style) =>
    typeof style === "undefined" ||
    typeof style.opacity === "undefined" ||
    style.opacity === null
        ? 1
        : style.opacity

export const getRotate = (style) =>
    typeof style === "undefined" || typeof style.rotate === "undefined"
        ? 0
        : style.rotate

const cssColorVarRegex = /\bvar\([^,]*, (.*)\)/

export const getColorType = (colorObject) => {
    if (typeof colorObject === "undefined" || colorObject === null) {
        return "none"
    }

    if (typeof colorObject === "string") {
        return "plain"
    }

    if ("__class" in colorObject && colorObject.__class === "LinearGradient") {
        return "linear-gradient"
    }

    if ("__class" in colorObject && colorObject.__class === "RadialGradient") {
        return "radial-gradient"
    }

    if ("src" in colorObject) {
        return "image"
    }

    return "plain"
}

export const getBackgroundColorPair = (sourceProps, targetProps) => {
    const sourceColorType = getColorType(sourceProps.background)
    const targetColorType = getColorType(targetProps.background)
    let sourceLinear
    let targetLinear
    let sourceRadial
    let targetRadial

    if (targetColorType === "image" || sourceColorType === "image") {
        return [null, null]
    }

    if (targetColorType === "none" || targetColorType === "plain") {
        if (sourceColorType === "none" || sourceColorType === "plain") {
            const sourceColor = getPlainBackgroundColor(sourceProps)
            const targetColor = getPlainBackgroundColor(targetProps)

            sourceLinear = linearGradientFromColor(
                sourceColorType === "none" && targetColorType === "plain"
                    ? transparent(targetColor)
                    : sourceColor
            )
            targetLinear = linearGradientFromColor(
                sourceColorType === "plain" && targetColorType === "none"
                    ? transparent(sourceColor)
                    : targetColor
            )

            sourceRadial = radialGradientFromColor(
                sourceColorType === "none" && targetColorType === "plain"
                    ? transparent(targetColor)
                    : transparent(sourceColor)
            )
            targetRadial = radialGradientFromColor(
                sourceColorType === "plain" && targetColorType === "none"
                    ? transparent(sourceColor)
                    : transparent(targetColor)
            )
        }

        if (sourceColorType === "linear-gradient") {
            sourceLinear = linearGradientFromGradient(sourceProps.background)
            sourceRadial = radialGradientFromGradient(
                sourceProps.background,
                0 // alpha
            )
            const targetColor = getPlainBackgroundColor(targetProps)
            targetLinear = linearGradientFromColor(
                targetColor,
                sourceProps.background.angle
            )
            targetRadial = radialGradientFromColor(transparent(targetColor))
        }

        if (sourceColorType === "radial-gradient") {
            sourceRadial = radialGradientFromGradient(sourceProps.background)
            const {
                widthFactor,
                heightFactor,
                centerAnchorX,
                centerAnchorY,
            } = sourceProps.background

            const gradientShape = `${widthFactor * 100}% ${heightFactor * 100}%`
            const gradientPosition = `${centerAnchorX * 100}% ${
                centerAnchorY * 100
            }%`
            const targetColor = getPlainBackgroundColor(targetProps)
            targetRadial = radialGradientFromColor(
                targetColor,
                gradientShape,
                gradientPosition
            )

            sourceLinear = linearGradientFromColor(transparent(targetColor))
            targetLinear = linearGradientFromColor(transparent(targetColor))
        }
    }

    if (targetColorType === "linear-gradient") {
        if (sourceColorType === "none" || sourceColorType === "plain") {
            const sourceColor = getPlainBackgroundColor(sourceProps)
            sourceLinear =
                sourceColorType === "none"
                    ? linearGradientFromGradient(targetProps.background, 0)
                    : linearGradientFromColor(
                          sourceColor,
                          targetProps.background.angle
                      )
            sourceRadial =
                sourceColorType === "none"
                    ? radialGradientFromGradient(targetProps.background, 0)
                    : radialGradientFromColor(transparent(sourceColor))

            targetLinear = linearGradientFromGradient(targetProps.background)
            targetRadial = radialGradientFromGradient(targetProps.background, 0)
        }

        if (sourceColorType === "linear-gradient") {
            sourceLinear = linearGradientFromGradient(sourceProps.background)
            sourceRadial = radialGradientFromGradient(sourceProps.background, 0)
            targetLinear = linearGradientFromGradient(targetProps.background)
            targetRadial = radialGradientFromGradient(targetProps.background, 0)
        }

        if (sourceColorType === "radial-gradient") {
            sourceLinear = linearGradientFromGradient(sourceProps.background, 0)
            sourceRadial = radialGradientFromGradient(sourceProps.background)
            targetLinear = linearGradientFromGradient(targetProps.background)
            targetRadial = radialGradientFromGradient(targetProps.background, 0)
        }
    }

    if (targetColorType === "radial-gradient") {
        if (sourceColorType === "none" || sourceColorType === "plain") {
            const sourceColor = getPlainBackgroundColor(sourceProps)

            const {
                widthFactor,
                heightFactor,
                centerAnchorX,
                centerAnchorY,
            } = targetProps.background

            const gradientShape = `${widthFactor * 100}% ${heightFactor * 100}%`
            const gradientPosition = `${centerAnchorX * 100}% ${
                centerAnchorY * 100
            }%`

            sourceLinear =
                sourceColorType === "none"
                    ? linearGradientFromGradient(targetProps.background, 0)
                    : linearGradientFromColor(transparent(sourceColor))
            targetLinear =
                sourceColorType === "none"
                    ? linearGradientFromGradient(targetProps.background, 0)
                    : linearGradientFromColor(transparent(sourceColor))

            sourceRadial = radialGradientFromColor(
                sourceColor,
                gradientShape,
                gradientPosition
            )
            targetRadial = radialGradientFromGradient(targetProps.background)
        }

        if (sourceColorType === "linear-gradient") {
            sourceLinear = linearGradientFromGradient(sourceProps.background)
            sourceRadial = radialGradientFromGradient(sourceProps.background, 0)
            targetRadial = radialGradientFromGradient(targetProps.background)
            targetLinear = linearGradientFromGradient(targetProps.background, 0)
        }

        if (sourceColorType === "radial-gradient") {
            sourceLinear = linearGradientFromGradient(sourceProps.background, 0)
            sourceRadial = radialGradientFromGradient(sourceProps.background)
            targetLinear = linearGradientFromGradient(targetProps.background, 0)
            targetRadial = radialGradientFromGradient(targetProps.background)
        }
    }

    return [
        `${sourceLinear}, ${sourceRadial}`,
        `${targetLinear}, ${targetRadial}`,
    ]
}

export const isBackgroundTransitionAnimatable = (source, target) => {
    const sourceBackground = getColorType(source.props.background)
    const targetBackground = getColorType(target.props.background)

    return !(
        (sourceBackground !== "image" && targetBackground === "image") ||
        (sourceBackground === "image" && targetBackground !== "image")
    )
}

export const transparent = (color) =>
    Color.toString(Color.alpha(toColor(color), 0))

export const linearGradientFromColor = (color, angle = 0) => {
    return `linear-gradient(${angle}deg, ${color} 0%, ${color} 100%)`
}

export const radialGradientFromColor = (
    color,
    shape = "50% 50%",
    position = "50% 50%"
) => {
    return `radial-gradient(${shape} at ${position}, ${color} 0%, ${color} 100%)`
}

const toColor = (color) => {
    if (typeof color === "string" && color.match(cssColorVarRegex)) {
        const matches = color.match(cssColorVarRegex)
        return Color(matches[1])
    }

    return Color(color)
}

export const getPlainBackgroundColor = (props) => {
    let color = "transparent"

    if (typeof props.style !== "undefined") {
        color =
            props.style.backgroundColor ||
            props.style.background ||
            "transparent"
    } else {
        color = props.backgroundColor || props.background || "transparent"
    }

    return Color.toString(toColor(color))
}

export const toCssGradientWithRgbStops = (
    gradient,
    targetGradientType = null,
    targetAlpha = null
) => {
    const stops = gradient.stops.map((stop) => ({
        ...stop,
        value: Color.toString(
            targetAlpha === null
                ? toColor(stop.value)
                : Color.alpha(toColor(stop.value), targetAlpha)
        ),
    }))

    let type = targetGradientType
    if (!type && gradient.__class === "LinearGradient") {
        type = "linear"
    }

    if (!type && gradient.__class === "RadialGradient") {
        type = "radial"
    }

    if (type === "linear") {
        return LinearGradient.toCSS({
            angle: 0,
            ...gradient,
            stops,
        })
    }

    if (type === "radial") {
        return RadialGradient.toCSS({
            widthFactor: 0.5,
            heightFactor: 0.5,
            centerAnchorX: 0.5,
            centerAnchorY: 0.5,
            ...gradient,
            stops,
        })
    }

    return gradient
}

export const linearGradientFromGradient = (gradient, alpha = null) =>
    toCssGradientWithRgbStops(gradient, "linear", alpha)

export const radialGradientFromGradient = (gradient, alpha = null) =>
    toCssGradientWithRgbStops(gradient, "radial", alpha)

const transparentShadow = `0px 0px 0px 0px rgba(0, 0, 0, 0)`
const insetTransparentShadow = `inset ${transparentShadow}`

const shadowRegex = new RegExp(/, (?=-?\d+px)|, (?=inset -?\d+px)/)
const maxShadows = 10
const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\)|\b(black|silver|gray|whitesmoke|maroon|red|purple|fuchsia|green|lime|olivedrab|yellow|navy|blue|teal|aquamarine|orange|aliceblue|antiquewhite|aqua|azure|beige|bisque|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|gainsboro|ghostwhite|goldenrod|gold|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavenderblush|lavender|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olive|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|turquoise|violet|wheat|white|yellowgreen|rebeccapurple)\b)/i

export const convertColorsInStringToRgba = (string) => {
    const updated = string
        .replace(cssColorVarRegex, "$1")
        .replace(colorRegex, (match) => {
            return Color.toString(toColor(match))
        })

    return updated
}

export const getBoxShadowPair = (sourceProps, targetProps) => {
    let sourceShadows = getBoxShadow(sourceProps.style).split(shadowRegex)
    let sourceBoxShadows = sourceShadows
        .filter((s) => !s.match(/^inset/))
        .slice(0, maxShadows)
        .map(convertColorsInStringToRgba)
    let sourceInnerShadows = sourceShadows
        .filter((s) => s.match(/^inset/))
        .slice(0, maxShadows)
        .map(convertColorsInStringToRgba)
    let targetShadows = getBoxShadow(targetProps.style).split(shadowRegex)
    let targetBoxShadows = targetShadows
        .filter((s) => !s.match(/^inset/))
        .slice(0, maxShadows)
        .map(convertColorsInStringToRgba)
    let targetInnerShadows = targetShadows
        .filter((s) => s.match(/^inset/))
        .slice(0, maxShadows)
        .map(convertColorsInStringToRgba)
    const placeholderBoxShadows = Array(maxShadows).fill(transparentShadow)
    const placeholderInnerShadows = Array(maxShadows).fill(
        insetTransparentShadow
    )

    if (sourceBoxShadows.length <= placeholderBoxShadows.length) {
        let _
        ;[sourceBoxShadows, _] = equalizeArrayLength(
            sourceBoxShadows,
            placeholderBoxShadows,
            transparentShadow
        )
    }

    if (targetBoxShadows.length < placeholderBoxShadows.length) {
        let _
        ;[targetBoxShadows, _] = equalizeArrayLength(
            targetBoxShadows,
            placeholderBoxShadows,
            transparentShadow
        )
    }

    if (sourceInnerShadows.length <= placeholderInnerShadows.length) {
        let _
        ;[sourceInnerShadows, _] = equalizeArrayLength(
            sourceInnerShadows,
            placeholderInnerShadows,
            insetTransparentShadow
        )
    }

    if (targetInnerShadows.length < placeholderBoxShadows.length) {
        let _
        ;[targetInnerShadows, _] = equalizeArrayLength(
            targetInnerShadows,
            placeholderInnerShadows,
            insetTransparentShadow
        )
    }

    sourceShadows = [...sourceBoxShadows, ...sourceInnerShadows]
    targetShadows = [...targetBoxShadows, ...targetInnerShadows]

    return [sourceShadows.join(", "), targetShadows.join(", ")]
}

export const getBoxShadow = (style) => {
    if (
        typeof style === "undefined" ||
        typeof style.boxShadow === "undefined" ||
        style.boxShadow === null
    ) {
        return transparentShadow
    }

    return style.boxShadow
}

export const getBorderRadius = (style) => {
    if (
        typeof style === "undefined" ||
        typeof style.borderRadius === "undefined" ||
        style.borderRadius === null
    ) {
        return {
            borderTopLeftRadius: "0px",
            borderTopRightRadius: "0px",
            borderBottomRightRadius: "0px",
            borderBottomLeftRadius: "0px",
        }
    }

    // single value
    if (style.borderRadius.split(" ").length === 1) {
        return {
            borderTopLeftRadius: style.borderRadius,
            borderTopRightRadius: style.borderRadius,
            borderBottomRightRadius: style.borderRadius,
            borderBottomLeftRadius: style.borderRadius,
        }
    }

    // four values
    if (style.borderRadius.split(" ").length === 4) {
        const values = style.borderRadius.split(" ")
        return {
            borderTopLeftRadius: values[0],
            borderTopRightRadius: values[1],
            borderBottomRightRadius: values[2],
            borderBottomLeftRadius: values[3],
        }
    }

    return {}
}

export const getBorderPair = (sourceProps, targetProps) => {
    const sourceBorder = getBorder(sourceProps._border)
    const targetBorder = getBorder(targetProps._border)

    return [sourceBorder, targetBorder]
}

export const getBorder = (border) => {
    if (
        typeof border === "undefined" ||
        border === null ||
        Object.keys(border).length === 0
    ) {
        return {
            borderWidth: "0px 0px 0px 0px",
            borderStyle: "solid",
            borderColor: "rgba(0, 0, 0, 0)",
        }
    }

    const rgbaColor = Color.toString(toColor(border.borderColor))
    return {
        borderWidth:
            typeof border.borderWidth === "number"
                ? `${border.borderWidth}px ${border.borderWidth}px ${border.borderWidth}px ${border.borderWidth}px`
                : `${border.borderWidth.top}px ${border.borderWidth.right}px ${border.borderWidth.bottom}px ${border.borderWidth.left}px`,
        borderStyle: border.borderStyle,
        borderColor: rgbaColor,
    }
}

export const rectAsStyleProps = (rect) => {
    return {
        width: rect.width,
        height: rect.height,
        top: rect.y,
        left: rect.x,
    }
}

const absolutePositioningProps = ["top", "left", "bottom", "right"]

export const filterOutAbsolutePositioningProps = (props) => {
    const filteredProps = omit(props, absolutePositioningProps)

    if (filteredProps.variants) {
        filteredProps.variants = Object.keys(filteredProps.variants).reduce(
            (res, v) => {
                res[v] = omit(
                    filteredProps.variants[v],
                    absolutePositioningProps
                )
                return res
            },
            {}
        )
    }

    return filteredProps
}
