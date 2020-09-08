import * as Framer from "framer"
import * as React from "react"

const _PreventLayoutIdGeneration = (props: {
    children: React.ReactNode | React.ReactNode[]
}) => {
    const context = React.useRef({
        getLayoutId: (args) => null,
        persistLayoutIdCache: () => {},
        top: false,
    }).current

    // LayoutIdContext may not exist on Framer if Switch is used in an old version of Framer.
    // @ts-ignore
    if (Framer.LayoutIdContext) {
        return (
            // @ts-ignore
            <Framer.LayoutIdContext.Provider value={context} {...props} />
        )
    }

    return <>{props.children}</>
}

export const PreventLayoutIdGeneration = _PreventLayoutIdGeneration as any
