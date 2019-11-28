import { setGlobal, useGlobal } from "reactn"

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

export const useSwitch: SwitchControls = () => {
    const [store, setStore] = useGlobal("__switch")

    const getSwitchStateIndex = (identifier: string) => {
        return store[identifier]
    }

    const setSwitchStateIndex = (identifier: string, state: number) => {
        store[identifier] = state
        setStore(store)
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
        registerSwitchStates,
    }
}
