/**
 * Created by lizongyuan on 16/4/17.
 */
var fs = require('fs');
var Images = require('./image');

exports.imgUpload = function(tmp, file_name, mime, username, req, res){
    //指定目标存储位置
    var target_path = 'public/avatar/upload/' + file_name;
    var extName = '';
    switch (mime) {
        case 'image/pjpeg':
            extName = 'jpg';
            break;
        case 'image/jpeg':
            extName = 'jpg';
            break;
        case 'image/png':
            extName = 'png';
            break;
        case 'image/x-png':
            extName = 'png';
            break;
    }
    //通过extname的长度从而判断文件是否为图像类型
    if (extName.length == 0){
        req.flash('error','只支持png和jpg格式图片!');
        return res.redirect('/');
    }
    //文件移动目录
    var store_path = target_path + '.' + extName;
    //文件相对路径用于存储于数据库
    var imgpath = '/avatar/upload/' + file_name + '.' + extName;
    //移动文件
    fs.rename(tmp, store_path, function(err){
        if (err) {
            console.log(err);
        }
        //删除临时文件文件夹
        fs.unlink(tmp, function(){
            if (err) {
                console.log(err);
            }
        });
    });
    var newImages = new Images(imgpath, file_name, username);
    newImages.save(function(err){
        if (err){
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '上传成功!');
        res.redirect('/');
    });
};

exports.imgSearch = function(tmp, file_name, mime, req, res){
    var extName = '';
    switch (mime) {
        case 'image/pjpeg':
            extName = 'jpg';
            break;
        case 'image/jpeg':
            extName = 'jpg';
            break;
        case 'image/png':
            extName = 'png';
            break;
        case 'image/x-png':
            extName = 'png';
            break;
    }
    //通过extname的长度从而判断文件是否为图像类型
    if (extName.length == 0){
        req.flash('error','只支持png和jpg格式图片!');
        return res.redirect('/');
    }
    var img_path = tmp + '.' + extName;
    //相对路径
    var rel_path = '/avatar/tmp/' + file_name + '.' + extName;
    fs.rename(tmp, img_path, function(err){
        if (err) {
            console.log(err);
        }
        req.session.searchPath = rel_path;
        res.redirect('/results');
        //删除临时文件文件夹
        //fs.unlink(tmp, function(){
        //    if (err) {
        //        console.log(err);
        //    }
        //});
    });
};