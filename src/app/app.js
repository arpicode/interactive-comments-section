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
            btnAddComment: document.querySelector('.add-comment-form a'),
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
            console.log(
                `%cRemoving comment %c${id} %cfrom DOM.`,
                'color: #6de09b;',
                'color: #c9c9c9;',
                'color: #6de09b;'
            )
            message?.remove()
            return
        }
        console.log('%cMissing id for delete action.', 'color: #e6b079;')
    }

    actionsHandler(event) {
        const el = event.target
        const action = el.dataset.action
        // console.log(el)

        switch (action) {
            case undefined:
                break
            case 'delete':
                this.deleteActionHandler(event)
                break
            case 'edit':
                console.log('edit')
                // TODO
                break
            case 'reply':
                this.openReplyFormHandler(event)
                break
            case 'addReply':
                this.addReplyHandler(event)
                // TODO
                break
            case 'upvote':
                // TODO
                break
            case 'downvote':
                // TODO
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

        // Since a reply doesn't have replies, check if current reply targets a reply and if so, get the id of parent comment.
        const replyParentId = document.getElementById(targetMessageId).dataset.parentId

        if (message !== '') {
            this.state.addReply(message, replyParentId || targetMessageId, targetUser)
            Render.lastReply(this.state, replyParentId || targetMessageId)
        }

        const replyActionBtn = document.querySelector(`[id="${targetMessageId}"] .action-reply`)
        replyActionBtn.classList.remove('disabled-link')
        replyForm.remove()
    }
}
