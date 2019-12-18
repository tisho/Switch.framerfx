import { setGlobal, getGlobal, useGlobal } from "reactn"

setGlobal({
    __switch: { __registry: {} },
})

type SwitchControls = () => {
    getSwitches: () => string[]
    getSwitchStateIndex: (identifier: string) => number
    getAllSwitchStates: (identifier: string) => string[]
    setSwitchStateIndex: (identifier: string, state: number) => void
    registerSwitchStates: (identifier: string, states: string[]) => void
}

type PrevNextSwitchOptions = {
    wrapAround?: boolean
}

export const useSwitch: SwitchControls = () => {
    const [store, setStore] = useGlobal("__switch")
    const prevNextSwitchOptions = {
        wrapAround: true,
    }

    const getSwitchStateIndex = (identifier: string) => {
        return store[identifier]
    }

    const setSwitchStateIndex = (identifier: string, state: number) => {
        store[identifier] = state
        setStore(store)
    }

    const setNextSwitchStateIndex = (
        identifier: string,
        options: PrevNextSwitchOptions = {}
    ) => {
        const { wrapAround } = { ...prevNextSwitchOptions, ...options }
        const current = getSwitchStateIndex(identifier)
        const states = getAllSwitchStates(identifier)

        setSwitchStateIndex(
            identifier,
            current + 1 >= states.length
                ? wrapAround
                    ? 0
                    : states.length - 1
                : current + 1
        )
    }

    const setPreviousSwitchStateIndex = (
        identifier: string,
        options: PrevNextSwitchOptions = {}
    ) => {
        const { wrapAround } = { ...prevNextSwitchOptions, ...options }
        const current = getSwitchStateIndex(identifier)
        const states = getAllSwitchStates(identifier)

        setSwitchStateIndex(
            identifier,
            current - 1 < 0 ? (wrapAround ? states.length - 1 : 0) : current - 1
        )
    }

    const registerSwitchStates = (identifier: string, states: string[]) => {
        store.__registry = {
            ...store.__registry,
            [identifier]: states,
        }
        setStore(store)
    }

    const getAllSwitchStates = (identifier: string) => {
        return store.__registry && store.__registry[identifier]
            ? store.__registry[identifier]
            : []
    }

    const getSwitches = () => {
        return Object.keys(store.__registry || {})
    }

    return {
        getSwitches,
        getSwitchStateIndex,
        getAllSwitchStates,
        setSwitchStateIndex,
        setNextSwitchStateIndex,
        setPreviousSwitchStateIndex,
        registerSwitchStates,
    }
}

export const actions = {
    getSwitchStateIndex: identifier => {
        const store = getGlobal().__switch
        return store[identifier]
    },
    setSwitchStateIndex: (identifier, state) => {
        const store = getGlobal().__switch
        store[identifier] = state
        setGlobal({ ...getGlobal(), __switch: store })
    },
    registerSwitchStates: (identifier: string, states: string[]) => {
        const store = getGlobal().__switch
        store.__registry = {
            ...store.__registry,
            [identifier]: states,
        }
        setGlobal({ ...getGlobal(), __switch: store })
    },
    getAllSwitchStates: (identifier: string) => {
        const store = getGlobal().__switch
        return store.__registry && store.__registry[identifier]
            ? store.__registry[identifier]
            : []
    },
}
