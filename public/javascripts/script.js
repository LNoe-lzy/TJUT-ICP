/**
 * Created by lizongyuan on 16/3/12.
 */
$(document).ready(function(){
    var $container = $('.masonry-container');
    $container.imagesLoaded( function () {
        $container.masonry({
            columnWidth: '.item',
            itemSelector: '.item'
        });
    });

    $('.mBtn').each(function(){
        var that = $(this);
        var imgSrc = that.children().attr("src");
        $(this).click(function(){
            $('#md-by').attr({
                src: imgSrc
            });
        });
    });
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});