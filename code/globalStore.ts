import { createStore } from "./store"

declare global {
    interface Window {
        __switchStore: any
    }
}

window.__switchStore = window.__switchStore || createStore({ __registry: {} })
export const useStore = window.__switchStore

type SwitchControls = () => {
    getSwitches: () => string[]
    getSwitchStateIndex: (identifier: string) => number
    getAllSwitchStates: (identifier: string) => string[]
    setSwitchStateIndex: (identifier: string, state: number) => void
    registerSwitchStates: (identifier: string, states: string[]) => void
}

export const useSwitch: SwitchControls = () => {
    const [store, setStore] = useStore()

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
