/**
 * Created by lizongyuan on 16/3/12.
 */
$(document).ready(function(){
    $('.mBtn').each(function(){
        var that = $(this);
        var target = that.children();
        var imgSrc = target.attr("src");
        var imgName = target.attr('data-imgname');
        $(this).click(function(){
            $('#md-by').attr({
                src: imgSrc
            });
            $('#md-vi').attr({
                href: '/info/' + imgName
            })
        });
    });

    $('#edit-edit').click(function(){
        var name = $('#user-name').html();
        var newName = $('#edit-name').val();
        var newEmail = $('#edit-email').val();
        var newText = $('#edit-text').val();
        var par = {
            name: name,
            newName: newName,
            email: newEmail,
            text: newText
        };
        $.ajax({
            url: '/u/:name',
            data: par,
            type: 'post',
            dataType: 'json'
        });
    });

    $('#proxy-btn').click(function(){
        var t_url = $('#t_url').val();
        var t_a = $('#t-a').val();
        var par = {
            url: t_url,
            sel: t_a
        };
        $.ajax({
            url: '/admin',
            data: par,
            type: 'post',
            dataType: 'json'
        });
    });
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});