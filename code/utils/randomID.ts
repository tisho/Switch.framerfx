const first = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_"

function f(): string {
    return first[Math.floor(Math.random() * first.length)]
}

function l(): string {
    return letters[Math.floor(Math.random() * letters.length)]
}

export function randomID(): string {
    return f() + l() + l() + l() + l() + l() + l() + l() + l()
}
