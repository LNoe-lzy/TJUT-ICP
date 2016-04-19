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
        var par = {
            url: t_url
        };
        $.ajax({
            url: '/admin',
            data: par,
            type: 'post',
            dataType: 'json'
        });
    });

    $('#imgSearch').click(function(){
        $('#upload').fadeIn();
    });
    $('#upload-remove').click(function(){
        $('#upload').fadeOut();
        $('#uploadSpan').html('本地上传图片');
    });

    $('#footer-buttons').click(function(){
        $('#new').fadeIn();
    });

    $('#new-remove').click(function(){
        $('#new').fadeOut();
        $('#newSpan').html('本地上传图片');
    });

    $('#uploadInput').change(function(){
        $('#uploadSpan').html('已选择图片');
    });

    $('#newInput').change(function(){
        $('#newSpan').html('已选择图片');
    });
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$(document).ready(function() {
    $('body').fadeloader({ });
});