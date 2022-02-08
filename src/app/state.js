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

    addComment(messageContent) {
        this.comments.push(this._createComment(messageContent))
        this.saveState()
    }

    addReply(messageContent, targetCommentId, targetUser) {
        const targetComment = this.comments.find((comment) => comment.id == targetCommentId)
        targetComment.replies.push(this._createReply(messageContent, targetUser))
        this.saveState()
    }

    removeMessage(id) {
        let isMessageRemoved = false

        if (id) {
            for (let i = 0; i < this.comments.length; i++) {
                if (this.comments[i].id == id) {
                    isMessageRemoved = !!this.comments.splice(i, 1)
                    break
                }

                const index = this.comments[i].replies.findIndex((reply) => reply.id == id)
                if (index !== -1) {
                    isMessageRemoved = !!this.comments[i].replies.splice(index, 1)
                    break
                }
            }

            if (isMessageRemoved) this.saveState()
        }

        return isMessageRemoved
    }

    updateMessage(msgId, messageContent) {
        const message = this.getMessageById(msgId)
        if (message) {
            message.content = messageContent.trim()
            this.saveState()
        }
    }

    getMessageById(id) {
        for (let i = 0; i < this.comments.length; i++) {
            if (this.comments[i].id == id) return this.comments[i]

            const msg = this.comments[i].replies.find((reply) => reply.id == id)

            if (msg) return msg
        }
        return null
    }

    scoreMessage(msgId, action) {
        const message = this.getMessageById(msgId)
        let hasStateChanded = false

        if (message) {
            if (!message.voters) message.voters = []

            if (message.user.username !== this.currentUser.username) {
                // check the vote of current user for this message
                let voteIndex = message.voters.findIndex(
                    (v) => v.username === this.currentUser.username
                )

                if (voteIndex === -1) {
                    // User never voted, initialize his/her vote
                    voteIndex =
                        message.voters.push({ username: this.currentUser.username, value: 0 }) - 1
                }

                if (action === 'upvote') {
                    if (message.voters[voteIndex].value < 1) {
                        message.score++
                        message.voters[voteIndex].value++
                        hasStateChanded = true
                    } else {
                        console.log(`%cYou've already upvoted this message.`, 'color: #e6b079;')
                    }
                }

                if (action === 'downvote') {
                    if (message.voters[voteIndex].value > -1) {
                        message.score--
                        message.voters[voteIndex].value--
                        hasStateChanded = true
                    } else {
                        console.log(`%cYou've already downvoted this message.`, 'color: #e6b079;')
                    }
                }
            } else {
                console.log(`%cYou can't vote for your own messages.`, 'color: #e6b079;')
            }
        }
        if (hasStateChanded) this.saveState()
    }

    _createComment(commentContent) {
        return {
            id: uuid(),
            content: commentContent,
            createdAt: new Date(),
            timestamp: Date.now(),
            score: 0,
            user: this.currentUser,
            replies: [],
        }
    }

    _createReply(replyContent, targetReplyUser) {
        return {
            id: uuid(),
            content: replyContent,
            createdAt: new Date(),
            timestamp: Date.now(),
            score: 0,
            user: this.currentUser,
            replyingTo: targetReplyUser,
        }
    }
}
