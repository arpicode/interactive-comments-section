import { convertTimestamp } from './utils'
const htmlentities = require('he')

export class Render {}

Render.dom = (state) => {
    const comments = state.comments
    const currentUser = state.currentUser

    comments.forEach((c) => {
        renderComment(c, currentUser)
    })

    renderAddCommentForm(currentUser)
}

Render.lastComment = (state) => {
    const last = state.comments[state.comments.length - 1]
    renderComment(last, state.currentUser)
}

/* ----- Forms ----- */

const renderAddCommentForm = (currentUser) => {
    const container = document.querySelector('main')
    container.insertAdjacentHTML('afterend', buildAddCommentFormHtml(currentUser))
}

const buildAddCommentFormHtml = (currentUser) => {
    const html = `
        <form class="add-comment-form">
            <p contenteditable="true" placeholder="Add a comment&hellip;"></p>
            <img class="avatar" src="${currentUser.image.webp}" alt="${currentUser.username}'s avatar">
            <div class="btn-group">
                <a href="#" class="btn-primary rounded-2">SEND</a>
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

    let html = `
        <article class="comment">
            <section class="message" id="${comment.id}">
                <header>
                    <img class="avatar" src="${comment.user.image.webp}" alt="${author}'s avatar">
                    <h4 class="user-name"><a>${author}</a>
                        ${isCurrentUser ? '<span class="current-user-badge">you</span>' : ''}
                    </h4>
                    <time class="text-secondary" datetime="${comment.createdAt}">
                        ${convertTimestamp(comment.timestamp)}
                    </time>
                </header>

                <p class="text-secondary">${htmlentities.encode(comment.content)}</p>

                <div class="score-counter">
                    <a class="btn-counter-plus" role="button"></a>
                    <span class="counter-value">${comment.score}</span>
                    <a class="btn-counter-minus" role="button"></a>
                </div>

                <div class="actions-group">`
    if (isCurrentUser) {
        html += `
                    <label for="modal">
                        <a class="action-delete" data-message-id="${comment.id}" role="button" data-action="delete">Delete</a>
                    </label>
                    <a class="action-edit" data-message-id="${comment.id}" role="button" data-action="edit">Edit</a>`
    } else {
        html += `
                    <a class="action-reply" data-message-id="${comment.id}" role="button" data-action="reply">Reply</a>`
    }
    html += `
                </div>
            </section>

            <div class="replies">`
    comment.replies.forEach((r) => {
        html += buildReplyHtml(r, currentUser)
    })

    html += `
            </div>
        </article>`

    return html
}

const buildReplyHtml = (reply, currentUser) => {
    const author = reply.user.username
    const isCurrentUser = author === currentUser.username
    let html = `
        <section class="message" id="${reply.id}">
            <header>
                <img class="avatar" src="${reply.user.image.webp}" alt="${author}'s avatar">
                <h4 class="user-name"><a href="#">${author}</a>
                    ${isCurrentUser ? '<span class="current-user-badge">you</span>' : ''}
                </h4>
                <time class="text-secondary" datetime="${reply.createdAt}">
                    ${convertTimestamp(reply.timestamp)}
                </time>
            </header>

            <p class="text-secondary">
                <span class="at-user">@${reply.replyingTo}</span> ${reply.content}
            </p>

            <div class="score-counter">
                <a class="btn-counter-plus" data-message-id="${reply.id}" role="button"></a>
                <span class="counter-value">${reply.score}</span>
                <a class="btn-counter-minus" data-message-id="${reply.id}" role="button"></a>
            </div>

            <div class="actions-group">`
    if (isCurrentUser) {
        html += `
                <label for="modal"><a class="action-delete" data-message-id="${reply.id}" role="button" data-action="delete">Delete</a></label>
                <a class="action-edit" data-message-id="${reply.id}" role="button" data-action="edit">Edit</a>`
    } else {
        html += `
                <a class="action-reply" data-message-id="${reply.id}" role="button" data-action="reply">Reply</a>`
    }
    html += `
            </div>
        </section>`
    return html
}
