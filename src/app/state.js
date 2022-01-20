import { v1 as uuid } from 'uuid'
import { AppStorage } from './app-storage'

export class State {
    constructor(name) {
        this.currentUser = {}
        this.comments = []
        this.store = new AppStorage(name)

        if (this.store.isAvailable) {
            const data = this.store.load()
            this.currentUser = data.currentUser
            this.comments = data.comments
        }
    }

    saveState() {
        if (this.store.isAvailable) {
            this.store.save({
                currentUser: this.currentUser,
                comments: this.comments,
            })
        }
    }

    addComment(msg) {
        this.comments.push(this._createComment(msg))
        this.saveState()
    }

    removeMessage(id) {
        let isMessageRemoved = false

        if (id) {
            console.log('looking for id', id)

            for (let i = 0; i < this.comments.length; i++) {
                if (this.comments[i].id == id) {
                    console.log(`remove comment ${id} at index ${i}`)
                    isMessageRemoved = !!this.comments.splice(i, 1)
                    break
                }

                const index = this.comments[i].replies.findIndex((reply) => reply.id == id)
                if (index !== -1) {
                    console.log(`remove reply ${id} at index ${index}`)
                    isMessageRemoved = !!this.comments[i].replies.splice(index, 1)
                    break
                }
            }

            if (isMessageRemoved) this.saveState()
        }
        return isMessageRemoved
    }

    _createComment(msg) {
        return {
            id: uuid(),
            content: msg,
            createdAt: new Date(),
            timestamp: Date.now(),
            score: 0,
            user: this.currentUser,
            replies: [],
        }
    }
}
