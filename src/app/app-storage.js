import defaultData from '../data.json'

/**
 * Wrapper for window.localStorage
 */
export class AppStorage {
    constructor(name) {
        let isAvailable

        try {
            window.localStorage.setItem('__test__', '__test__')
            window.localStorage.removeItem('__test__')
            isAvailable = true
        } catch (e) {
            isAvailable = false
        }

        this.name = name
        this.isAvailable = isAvailable
    }

    save(data) {
        const json = JSON.stringify(data)
        localStorage.setItem(this.name, json)
    }

    load() {
        const data = localStorage.getItem(this.name)

        if (data !== null) {
            console.log('%cUsing existing data.', 'color: #6ea885;')
            return {
                currentUser: JSON.parse(data).currentUser,
                comments: JSON.parse(data).comments.sort((a, b) => a.timestamp - b.timestamp),
            }
        }

        console.log('%cLoading default data.', 'color: #6ea885;')
        defaultData.comments = defaultData.comments.sort((a, b) => a.timestamp - b.timestamp)
        return defaultData
    }
}
