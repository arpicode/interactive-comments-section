import { Render } from './render'
import { State } from './state'

export class App {
    constructor(name) {
        this.name = name
        this.state = new State(name)

        Render.dom(this.state)

        this.dom = {
            main: document.querySelector('main'),
            btnCancelModal: document.querySelector('.modal .btn-secondary'),
            btnConfirmDelete: document.querySelector('.modal .btn-danger'),
            btnAddComment: document.querySelector('.add-comment-form button'),
        }

        this.bindAppEvents()
    }

    bindAppEvents() {
        this.dom.main.addEventListener('click', this.actionsHandler.bind(this))
        this.dom.btnCancelModal.addEventListener('click', this.cancelDeleteHandler)
        this.dom.btnConfirmDelete.addEventListener('click', this.confirmDeleteHandler.bind(this))
        this.dom.btnAddComment.addEventListener('click', this.addCommentHandler.bind(this))
    }

    /* Event Handlers */

    cancelDeleteHandler() {
        const modal = document.querySelector('.modal')
        console.log(
            `%cCanceling delete action for %c${modal.dataset.idToDelete}`,
            'color: #6de09b;',
            'color: #c9c9c9;'
        )
        modal.removeAttribute('data-id-to-delete')
    }

    confirmDeleteHandler() {
        const modal = document.querySelector('.modal')
        const id = modal.dataset.idToDelete

        modal.removeAttribute('data-id-to-delete')

        if (id !== undefined && this.state.removeMessage(id)) {
            const message = document.getElementById(id)
            message.addEventListener(
                'animationend',
                (e) => {
                    e.stopPropagation()
                    e.target.remove()
                    console.log(
                        `%cRemoving comment %c${id} %cfrom DOM.`,
                        'color: #6de09b;',
                        'color: #c9c9c9;',
                        'color: #6de09b;'
                    )
                },
                { once: true }
            )
            message.classList.add('animate-fadeOut')
            return
        }
        console.log('%cMissing id for delete action.', 'color: #e6b079;')
    }

    actionsHandler(event) {
        const el = event.target
        const action = el.dataset.action

        switch (action) {
            case undefined:
                break
            case 'delete':
                this.deleteActionHandler(event)
                break
            case 'edit':
                this.editMessageHandler(event)
                break
            case 'reply':
                this.openReplyFormHandler(event)
                break
            case 'addReply':
                this.addReplyHandler(event)
                break
            case 'upvote':
                this.voteMessageHandler(event)
                break
            case 'downvote':
                this.voteMessageHandler(event)
                break

            default:
                break
        }
    }

    addCommentHandler(event) {
        event.preventDefault()
        const message = document.querySelector('.add-comment-form p')
        const trimed = message.textContent.trim()

        if (trimed !== '') {
            this.state.addComment(trimed)
            Render.lastComment(this.state)
        }
        message.textContent = ''
        event.target.blur()
    }

    deleteActionHandler(event) {
        const modal = document.querySelector('.modal')
        modal.dataset.idToDelete = event.target.dataset.messageId
    }

    openReplyFormHandler(event) {
        const id = event.target.dataset.messageId
        Render.replyForm(id, this.state.currentUser)
    }

    addReplyHandler(event) {
        event.preventDefault()
        const replyBtn = event.target
        const replyForm = replyBtn.parentElement.parentElement
        let message = replyForm.querySelector('p')

        const targetMessageId = message.dataset.targetId
        const targetUser = document.querySelector(
            `[id="${targetMessageId}"] .user-name a`
        ).textContent

        message = message.textContent.trim()

        // Since a reply doesn't have replies, check if current reply targets a reply and if so, use the id of parent comment.
        const replyParentId = document.getElementById(targetMessageId).dataset.parentId

        if (message !== '') {
            this.state.addReply(message, replyParentId || targetMessageId, targetUser)
            Render.lastReply(this.state, replyParentId || targetMessageId)
        }

        const replyActionBtn = document.querySelector(`[id="${targetMessageId}"] .action-reply`)
        replyActionBtn.classList.remove('disabled-link')
        replyForm.remove()
    }

    editMessageHandler(event) {
        const messageId = event.target.dataset.messageId
        const message = document.getElementById(messageId)
        const textarea = message.querySelector('p')
        const updateBtn = message.querySelector('.btn-group a')
        const replyToSpan = textarea.querySelector('.at-user')

        message.classList.add('update-form')

        if (replyToSpan) {
            replyToSpan.remove()
            textarea.textContent = `${replyToSpan.textContent} ${textarea.textContent.trim()}`
        }
        textarea.focus()

        updateBtn.addEventListener('click', this.updateMessageHandler.bind(this, messageId), {
            once: true,
        })

        textarea.setAttribute('contenteditable', 'true')
    }

    updateMessageHandler(msgId, event) {
        event.preventDefault()
        const message = document.getElementById(msgId)
        if (message) {
            const messageContent = message
                .querySelector('p')
                .textContent.replace(/^\s*@[\w]+\s+/gm, '')
            this.state.updateMessage(msgId, messageContent)
            Render.updatedMessage(this.state, msgId)
        }
        message.classList.remove('update-form')
        message.querySelector('p').removeAttribute('contenteditable')
    }

    voteMessageHandler(event) {
        const messageId = event.target.dataset.messageId
        this.state.scoreMessage(messageId, event.target.dataset.action)
        Render.messageScore(this.state, messageId)
    }
}
