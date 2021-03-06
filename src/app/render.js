import { convertTimestamp } from './utils'
const htmlentities = require('he')

export class Render {}

Render.dom = (state) => {
    const comments = state.comments
    const currentUser = state.currentUser

    if (!document.querySelector('main')) {
        // Render initial markup
        renderDeleteModal()
        const mainEl = document.createElement('main')
        document.querySelector('#app').appendChild(mainEl)
    }

    comments.forEach((c) => {
        renderComment(c, currentUser)
    })

    renderAddCommentForm(currentUser)
}

Render.lastComment = (state) => {
    const last = state.comments[state.comments.length - 1]
    renderComment(last, state.currentUser)
}

Render.replyForm = (targetMessageId, currentUser) => {
    renderReplyForm(targetMessageId, currentUser)
}

Render.lastReply = (state, targetCommentId) => {
    const lastComment = state.comments.find((comment) => comment.id == targetCommentId)
    const lastReply = lastComment.replies[lastComment.replies.length - 1]
    renderReply(lastReply, targetCommentId, state.currentUser)
}

Render.updatedMessage = (state, messageId) => {
    const message = state.getMessageById(messageId)
    renderUpdatedMessage(message, messageId)
}

Render.messageScore = (state, messageId) => {
    const message = state.getMessageById(messageId)
    const scoreValue = document.querySelector(`[id="${messageId}"] .counter-value`)
    scoreValue.textContent = message.score
}

/* ----- Modal ----- */

const renderDeleteModal = () => {
    document.body.insertAdjacentHTML('afterbegin', buildDeleteModalHtml())
}

const buildDeleteModalHtml = () => {
    const html = `
        <input type="checkbox" id="modal" hidden>
        <aside class="modal" role="dialog" aria-modal="true" aria-live="assertive" aria-labelledby="modal-title">
            <section class="message-box">
                <h2 id="modal-title">Delete comment</h2>
                <p>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
                <div class="btn-group">
                    <label for="modal"><a class="btn-secondary rounded-2" role="button">NO, CANCEL</label></a>
                    <label for="modal"><a class="btn-danger rounded-2" role="button">YES, DELETE</label></a>
                </div>
            </section>
        </aside>`

    return html
}

/* ----- Forms ----- */

const renderAddCommentForm = (currentUser) => {
    const container = document.querySelector('main')
    container.insertAdjacentHTML('afterend', buildAddCommentFormHtml(currentUser))
}

const buildAddCommentFormHtml = (currentUser) => {
    const html = `
        <form class="add-comment-form">
            <p contenteditable="true" data-placeholder="Add a comment&hellip;"></p>
            <img class="avatar" src="${currentUser.image.webp}" alt="${currentUser.username}'s avatar">
            <div class="btn-group">
                <button class="btn-primary rounded-2" type="submit">SEND</a>
            </div>
        </form>`
    return html
}

const renderReplyForm = (targetMessageId, currentUser) => {
    const targetMessage = document.getElementById(targetMessageId)
    targetMessage.insertAdjacentHTML('afterend', buildReplyFormHtml(targetMessageId, currentUser))
    targetMessage.querySelector('.action-reply').classList.add('disabled-link')
    document.querySelector(`[data-target-id="${targetMessageId}"]`).focus()
}

const buildReplyFormHtml = (targetMessageId, currentUser) => {
    const html = `
        <form class="reply-form animate-form animate-fadeIn">
            <p contenteditable="true" data-target-id="${targetMessageId}" data-placeholder="Add your reply&hellip;"></p>
            <img class="avatar" src="${currentUser.image.webp}" alt="${currentUser.username}'s avatar">
            <div class="btn-group">
                <a href="#" data-target-id="${targetMessageId}" data-action="addReply" class="btn-primary rounded-2" role="button">REPLY</a>
            </div>
        </form>`
    return html
}

/* ----- Comment ----- */

const renderComment = (comment, currentUser) => {
    const container = document.querySelector('main')
    container.insertAdjacentHTML('beforeend', buildCommentHtml(comment, currentUser))
}

const buildCommentHtml = (comment, currentUser) => {
    const author = comment.user.username
    const isCurrentUser = author === currentUser.username
    const ts = convertTimestamp(comment.timestamp)

    let html = `
        <article class="comment">
            <section class="message animate-message animate-fadeIn" id="${comment.id}">
                <header>
                    <img class="avatar" src="${comment.user.image.webp}" alt="${author}'s avatar">
                    <h4 class="user-name"><a>${author}</a>
                        ${isCurrentUser ? '<span class="current-user-badge">you</span>' : ''}
                    </h4>
                    <time class="text-secondary" datetime="${comment.createdAt}">
                        ${ts}${ts !== 'now' ? ' ago' : ''}
                    </time>
                </header>

                <p class="text-secondary">${htmlentities.encode(comment.content)}</p>

                <div class="score-counter">
                    <a href="#" class="btn-counter-plus" data-action="upvote"
                       data-message-id="${comment.id}" role="button" aria-label="upvote"></a>
                    <span class="counter-value">${comment.score}</span>
                    <a href="#" class="btn-counter-minus" data-action="downvote"
                        data-message-id="${comment.id}" role="button" aria-label="downvote"></a>
                </div>

                <div class="actions-group">`
    if (isCurrentUser) {
        html += `
                    <label for="modal">
                        <a class="action-delete" data-message-id="${comment.id}" role="button" data-action="delete">Delete</a>
                    </label>
                    <a href="#" class="action-edit" data-message-id="${comment.id}" role="button" data-action="edit">Edit</a>`
    } else {
        html += `
                    <a href="#" class="action-reply" data-message-id="${comment.id}" role="button" data-action="reply">Reply</a>`
    }
    html += `
                </div>
                <div class="btn-group">
                    <a href="#" class="btn-primary rounded-2">UPDATE</a>
                </div>
            </section>

            <div class="replies">`
    comment.replies.forEach((r) => {
        html += buildReplyHtml(r, currentUser, comment.id)
    })

    html += `
            </div>
        </article>`

    return html
}

const renderReply = (reply, targetCommentId, currentUser) => {
    const targetComment = document.getElementById(targetCommentId)
    const repliesDiv = targetComment.parentElement.querySelector('.replies')
    repliesDiv.insertAdjacentHTML('beforeend', buildReplyHtml(reply, currentUser))
}

const buildReplyHtml = (reply, currentUser, commentId) => {
    const author = reply.user.username
    const isCurrentUser = author === currentUser.username
    const ts = convertTimestamp(reply.timestamp)

    let html = `
        <section class="message animate-message animate-fadeIn"
                 id="${reply.id}" data-parent-id="${commentId}">
            <header>
                <img class="avatar" src="${reply.user.image.webp}" alt="${author}'s avatar">
                <h4 class="user-name"><a>${author}</a>
                    ${isCurrentUser ? '<span class="current-user-badge">you</span>' : ''}
                </h4>
                <time class="text-secondary" datetime="${reply.createdAt}">
                    ${ts}${ts !== 'now' ? ' ago' : ''}
                </time>
            </header>

            <p class="text-secondary">
                <span class="at-user">@${reply.replyingTo}</span> ${htmlentities.encode(
        reply.content
    )}
            </p>

            <div class="score-counter">
                <a href="#" class="btn-counter-plus" data-action="upvote"
                   data-message-id="${reply.id}" role="button" aria-label="upvote"></a>
                <span class="counter-value">${reply.score}</span>
                <a href="#" class="btn-counter-minus" data-action="downvote"
                   data-message-id="${reply.id}" role="button" aria-label="downvote"></a>
            </div>

            <div class="actions-group">`
    if (isCurrentUser) {
        html += `
                <label for="modal"><a class="action-delete" data-message-id="${reply.id}" role="button" data-action="delete">Delete</a></label>
                <a href="#" class="action-edit" data-message-id="${reply.id}" role="button" data-action="edit">Edit</a>`
    } else {
        html += `
                <a href="#" class="action-reply" data-message-id="${reply.id}" role="button" data-action="reply">Reply</a>`
    }
    html += `
            </div>
            <div class="btn-group">
                <a href="#" class="btn-primary rounded-2">UPDATE</a>
            </div>
        </section>`
    return html
}

const renderUpdatedMessage = (message, msgId) => {
    const msgElement = document.getElementById(msgId)
    msgElement.querySelector('p').innerHTML = buildUpdatedMessageHtml(message)
}

const buildUpdatedMessageHtml = (message) => {
    let html = ''
    if (message?.replyingTo) {
        html += `
            <span class="at-user">@${message.replyingTo}</span> `
    }
    html += `${htmlentities.encode(message.content)}`
    return html
}
