import * as React from "react"
import { useState, useEffect } from "react"

/**
A hook to simply use state between components
Usage:
// You can put this in an central file and import it too
const useStore = createStore({ count: 0 })
// And this is how you use it from any component
export function Example() {
    const [store, setStore] = useStore()
    const updateCount = () => setStore({ count: store.count + 1 })
    return <div onClick={updateCount}>{store.count}</div>
}
*/

export function createStore<T>(state: T) {
    let storeState: T = Object.assign({}, state)
    const storeSetters = new Set()

    const setStoreState = (state: Partial<T>) => {
        storeState = Object.assign({}, storeState, state)
        storeSetters.forEach(setter => setter(storeState))
    }

    function useStore(): [T, typeof setStoreState] {
        const [state, setState] = useState(storeState)
        useEffect(() => () => storeSetters.delete(setState), [])
        storeSetters.add(setState)
        return [state, setStoreState]
    }

    return useStore
}
