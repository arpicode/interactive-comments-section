const pural = (value) => {
    return value > 1 ? 's' : ''
}

/**
 * Returns the difference between `Date.now()` and a `timestamp` in a meaningful
 * unit rounded down.
 *
 * e.g.: a 9 days difference would give 1 week
 *
 * @param {number} ts timestamp
 * @returns A period in years, months, weeks, days,...
 */
export const convertTimestamp = (ts) => {
    const now = new Date(Date.now())
    const createdAt = new Date(ts)
    const secondsSinceCreated = Math.floor((now - createdAt) / 1000)
    const times = [
        { value: Math.floor(secondsSinceCreated / 3600 / 24 / 365), unit: 'year' },
        { value: Math.floor(((secondsSinceCreated / 3600 / 24) % 365) / 30), unit: 'month' },
        { value: Math.floor(((secondsSinceCreated / 3600 / 24) % 365) / 7), unit: 'week' },
        { value: Math.floor((secondsSinceCreated / 3600 / 24) % 365), unit: 'day' },
        { value: Math.floor((secondsSinceCreated / 3600) % 24), unit: 'hour' },
        { value: Math.floor((secondsSinceCreated / 60) % 60), unit: 'minute' },
        { value: Math.floor(secondsSinceCreated % 60), unit: 'second' },
    ]

    for (const time of times) {
        if (time.value > 0) return `${time.value} ${time.unit}${pural(time.value)}`
    }

    return 'now'
}
