export const equalizeArrayLength = (source, target, paddingValue) => {
    let sourceResult = [...source]
    let targetResult = [...target]

    if (source.length !== target.length) {
        const diff = source.length - target.length
        const padding = Array(Math.abs(diff)).fill(paddingValue)
        if (diff > 0) {
            targetResult = [...padding, ...targetResult]
        } else {
            sourceResult = [...padding, ...sourceResult]
        }
    }

    return [sourceResult, targetResult]
}
