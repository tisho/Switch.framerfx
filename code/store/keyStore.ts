const caches = {}

export const getCache = id => {
    if (!caches[id]) {
        caches[id] = {}
    }

    const cache = caches[id]

    return {
        getSourceKey: (targetKey, sourceKey) =>
            getSourceKey(cache, targetKey, sourceKey),
    }
}

const getSourceKey = (cache, targetKey, sourceKey) => {
    const key =
        targetKey in cache
            ? resolveKey(targetKey, cache)
            : resolveKey(sourceKey, cache)
    cache[targetKey] = key
    return key
}

const resolveKey = (targetKey, cache) => {
    const checkedKeys = {}
    let key = targetKey
    while (cache[key] && !(cache[key] in checkedKeys)) {
        checkedKeys[key] = true
        key = cache[key]
    }
    return key
}
