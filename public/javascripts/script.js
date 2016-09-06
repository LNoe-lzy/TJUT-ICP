/**
 * Created by lizongyuan on 16/3/12.
 */
$(document).ready(function(){
    $('.mBtn').each(function(){
        var that = $(this);
        var target = that.parent();
        var imgSrc = target.attr("data-src");
        var imgId = target.attr('data-id');
        $(this).click(function(){
            $('#md-by').attr({
                src: imgSrc
            });
            $('#md-vi').attr({
                href: '/info/' + imgId
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
            url: '/u/:id',
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

    $('.imgSearch').click(function(){
        $('#upload').fadeIn();
    });
    $('#upload-remove').click(function(){
        $('#upload').fadeOut();
        $('#uploadSpan').html('本地上传图片');
    });

    $('#plus').click(function(){
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

    //显示标签栏
    $('#tag-bar').click(function(){
        $('#tag-container').toggle(500);
    });

    //返回顶部
    $(function(){
        $(window).scroll(function(){
            if ($(window).scrollTop() > 300){
                $('#totop').fadeIn();
            } else {
                $('#totop').fadeOut();
            }
        });

        $('#totop').click(function(){
            $('body, html').animate({
                scrollTop: 0
            });
        });
    });

    $(function(){
        $(window).scroll(function(){
            if ($(window).scrollTop() > 70){
                $('#header-scroll').fadeIn(1000);
            } else {
                $('#header-scroll').fadeOut(500);
            }
        });
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });


    $(function() {
        $('.masonry-container').each(function () {
            var that = $(this);
            that.imagesLoaded(function() {
                that.masonry({
                    itemSelector: '.item',
                    isAnimated: true
                });
            });
        });

    });

    $(function() {
        var $container = $('#info-tags');
        $container.imagesLoaded(function() {
            $container.masonry({
                itemSelector: '.item',
                isAnimated: true
            });
        });
    });

    // 图片预加载
    $(function () {
        $('.item').each(function () {
            var that = $(this),
                node = that.find('#modal-btn'),
                imgSrc = that.attr('data-src');
            var myImage = (function () {
                var imgNode = $('<img>');
                imgNode.appendTo(node);
                return {
                    setSrc: function (src) {
                        imgNode.attr({
                            src: src
                        });
                    }
                }
            })();
            var proxyImage = (function () {
                var img = new Image;
                img.onload = function () {
                    myImage.setSrc(this.src);
                };
                return {
                    setSrc: function (src) {
                        myImage.setSrc('../images/loading.gif');
                        img.src = src;
                    }
                }
            })();

            proxyImage.setSrc(imgSrc);
        })
    });

});

