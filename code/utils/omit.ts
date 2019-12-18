export function omit(source, blacklist) {
    return Object.keys(source)
        .filter(key => blacklist.indexOf(key) < 0)
        .reduce(
            (result, key) => Object.assign(result, { [key]: source[key] }),
            {}
        )
}
