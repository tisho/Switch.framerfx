export function pick(source, whitelist) {
    return Object.keys(source)
        .filter(key => whitelist.indexOf(key) >= 0)
        .reduce(
            (result, key) => Object.assign(result, { [key]: source[key] }),
            {}
        )
}
