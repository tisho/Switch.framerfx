function capitalize(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1)
}

export function prefixPropName(name: string, prefix: string = null): string {
    return prefix ? `${prefix}${capitalize(name)}` : name
}

export function sanitizePropName(name: string): string {
    return name.replace(/\s/, "")
}
