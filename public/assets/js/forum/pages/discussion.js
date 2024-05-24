import { infiniteScroll, throttle } from "../../util.js";
import { getSpecificDiscussion } from "../api/discussions.js";

$(() =>
{
    let currentCommentPage = 1;

    let shouldContinueRetrievingData = true;

    let shouldSendMessage = false;

    const userId = '0';

    let params = new URLSearchParams(document.location.search);

    const discussionId = params.get('id');

    if (discussionId === null)
        window.location.href = 'forum.html';

    let commentsList = {};

    start();

    function retrieveDiscussion(discussionEntry)
    {
        if (discussionEntry.length === 0)
        {
            shouldContinueRetrievingData = false;
            return;
        }

        const discussion = discussionEntry[0];

        populateDiscussionWithData(discussion);
    }

    function retrieveComments(comments)
    {
        if (comments.length === 0)
        {
            if (currentCommentPage === 1 && shouldSendMessage)
                showMessage("Ainda não há comentários.|Seja o primeiro a comentar!");
            else
                $('#discussion').off('scroll');

            return;
        }

        currentCommentPage++;

        comments.forEach(commentData =>
        {
            getLikeRelationship(commentData.id, userId, likeRelationship =>
            {
                commentsList[commentData.id] = commentData;

                createCommentElement(commentData, likeRelationship).insertBefore($('.loader-container'));
            })
        });
    }

    function populateDiscussionWithData(discussion)
    {
        const userElement = $('#user span');
        const dateElement = $('header div:nth-child(3)');
        const titleElement = $('#content h2');
        const textElement = $('#content p');

        userElement.text(discussion.authorName);
        dateElement.text(discussion.date);
        titleElement.text(discussion.title);
        textElement.text(discussion.text);

        if (discussion.authorId === userId)
            $('.option').get(0).remove();
    }

    function showMessage(message) 
    {
        const messageContainer = $('<div>', { id: 'message' });

        const messageLines = message.split('|');

        messageLines.forEach(line =>
        {
            const paragraph = $('<p>', { text: line });

            messageContainer.append(paragraph);
        });

        $('#comments-container').append(messageContainer);
    }

    function start()
    {
        throttle(() => { getSpecificDiscussion(discussionId, retrieveDiscussion) });

        if (!shouldContinueRetrievingData)
            return;

        shouldSendMessage = true;
    }
}); 