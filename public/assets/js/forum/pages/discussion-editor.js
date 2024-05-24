import { getDate } from "../../util.js";
import { createDiscussion, getSpecificDiscussion, updateDiscussion } from "../api/discussions.js";

$(() =>
{
    const Modes = {
        CREATE: 0,
        EDIT: 1
    };

    let params = new URLSearchParams(window.location.search);

    let discussionId = params.get('id');

    let discussion;

    const userId = '0';

    let mode;

    console.log(!discussionId)

    if (!discussionId)
        mode = Modes.CREATE;
    else
        mode = Modes.EDIT;

    let lockState = false;

    onLoadPage();

    $('form').on('submit', e =>
    {
        e.preventDefault();
    });

    $('#title').on('input', () =>
    {
        didFillInFields();

        if (mode === Modes.EDIT)
            checkSimilarityToOriginal();
    });

    $('#body').on('input', () =>
    {
        didFillInFields();

        if (mode === Modes.EDIT)
            checkSimilarityToOriginal();
    });


    $('#submit').on('click', () =>
    {
        lockState = true;

        if (mode === Modes.CREATE)
        {
            discussion = {
                authorId: userId,
                title: $('#title').val(),
                text: $('#body').val(),
                date: getDate(),
                commentCount: 0
            };

            $('#cancel').prop('disabled', true);

            createDiscussion(discussion, () =>
            {
                window.location.href = `forum.html?state=2`;
            });

            return;
        }

        discussion.title = $('#title').val();
        discussion.text = $('#body').val();
        discussion.updateDate = getDate();

        updateDiscussion(discussionId, discussion, () =>
        {
            window.location.href = `forum.html?state=2`;
        });

        return;
    });

    $('#cancel').on('click', () =>
    {
        console.log(lockState)

        if (!lockState)
            window.location.href = 'forum.html';
    });

    function onLoadPage()
    {
        if (mode !== Modes.EDIT)
            return;

        $('#create-discussion h1').text('Editar discussão');

        $('#submit span').text('Salvar');

        getSpecificDiscussion(discussionId, data =>
        {
            discussion = data[0];

            if (discussion.authorId !== userId)
            {
                window.location.href = 'forum.html';
                return;
            }

            $('#title').val(discussion.title);
            $('#body').val(discussion.text);

        });
    }

    function didFillInFields()
    {
        const titleText = $('#title').val().replace(' ', '');
        const bodyText = $('#body').val().replace(' ', '');

        const check = (titleText.length > 0 && titleText.match(/^ *$/) == null) &&
            (bodyText.length > 0 && bodyText.match(/^ *$/) == null);

        $('#submit').prop('disabled', !check);
    }

    function checkSimilarityToOriginal()
    {
        const titleText = $('#title').val().replace(' ', '');
        const bodyText = $('#body').val().replace(' ', '');

        const check = titleText === discussion.title.replace(' ', '') && bodyText === discussion.text.replace(' ', '');

        console.log(check);

        $('#submit').prop('disabled', check);
    }

});