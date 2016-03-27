var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var formidable = require('formidable');
var fs = require('fs');

User = require('../models/user');
Images = require('../models/image');
Detail = require('../models/detail');

/* GET home page. */
router.get('/', function(req, res) {
  Images.getAll(null, function(err, paths){
    if (err){
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('index', {
      title: 'LeeImage',
      user: req.session.user,
      paths: paths,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/login', function(req, res){
  res.render('login', {
    title: '登录',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', function(req, res){
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  User.get(req.body.name, function(err, user){
    if (!user){
      req.flash('error', ' 用户不存在!');
      return res.redirect('/login');
    }
    if (user.password != password){
      req.flash('error', '密码错误!');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登录成功!');
    res.redirect('/');
  });
});

router.get('/signup', function(req, res){
  res.render('signup', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/signup', function(req, res){
  var name = req.body.name,
      password = req.body.password,
      passwordre = req.body.passwordrep;
  if (passwordre != password){
    req.flash('error', '两次输入的密码不一样!');
    return res.redirect('/signup');
  }
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: password
  });
  User.get(newUser.name, function(err, user){
    if (user){
      req.flash('error', '用户已存在!');
      return res.redirect('/signup');
    }
    newUser.save(function(err, user){
      if (err){
        req.flash('error', err);
        return res.redirect('/signup');
      }
      req.session.user = user;
      req.flash('success', ' 注册成功!');
      res.redirect('/');
    });
  });
});

router.get('/logout', function(req, res){
  req.session.user = null;
  req.flash('success', '退出成功!');
  res.redirect('/');
});

router.get('/:name/new', function(req, res){
  User.get(req.params.name, function(err, user){
    if (!user){
      req.flash('error', '用户不存在!');
      return res.redirect('/');
    }
    res.render('new', {
      title: user.name,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/:name/new', function(req, res) {
  console.log(req.body.info, req.body.tag);
  var username = req.params.name;
  var form = new formidable.IncomingForm();   //创建上传表单
  form.encoding = 'utf-8';		//设置编辑
  form.uploadDir = 'public/avatar/';	 //设置上传目录
  form.keepExtensions = true;	 //保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
  form.parse(req, function(err, fields, files) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    var extName = '';  //后缀名
    switch (files.fulAvatar.type) {
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
    if(extName.length == 0){
      req.flash('error', '只支持png和jpg格式图片!');
      return res.redirect('/');
    }
    var imageName = username + Math.random();
    var avatarName = imageName + '.' + extName;
    var newPath = form.uploadDir + avatarName;
    console.log(newPath);
    fs.renameSync(files.fulAvatar.path, newPath);//重命名
    //将图片信息存储到数据库
    var newImages = new Images(avatarName, imageName, username);
    newImages.save(function(err){
      if (err){
        req.flash('error', err);
        return res.redirect('/');
      }
    });
  });
  req.flash('success', '上传成功!');
  res.redirect('/');
});

router.get('/:name', function(req, res){
  var username = req.params.name;
  User.get(username, function(err, user){
    if (!user){
      req.flash('error', '用户不存在!');
      return res.redirect('/');
    }
    Images.getAll(username, function(err, paths){
      if (err){
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        user: req.session.user,
        paths: paths,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});

router.get('/:name/edit/:imageName', function(req, res){
  User.get(req.params.name, function(err, user){
    if (!user){
      req.flash('error', '用户不存在!');
      return res.redirect('/');
    }
    Images.getAll(req.params.name, function(err, paths){
      if (err){
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('edit', {
        title: user.name,
        user: req.session.user,
        paths: paths,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    })
  });
});

router.post('/:name/edit/:imageName', function(req, res){
  Detail.update(req.params.name, req.params.imageName, req.body.info, req.body.tag, function(err){
    if (err){
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '添加成功!');
    res.redirect('/' + req.params.name);
  });
});

router.get('/:imageName/info', function(req, res){
  Images.getOne(req.params.imageName, function(err, path){
    res.render('info', {
      title: 'info',
      path: path,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/remove/:name/:imageName', function(req, res){
  var currentUser = req.session.user.name;
  Images.remove(currentUser, req.params.imageName, function(err){
    if (err){
      req.flash('err', error);
      return res.redirect('/' + currentUser);
    }
    req.flash('success', '删除成功!');
    res.redirect('/' + req.session.user.name);
  });
});

router.get('/tags/:tag', function(req, res){
  Images.getTags(req.params.tag, function(err, tags){
    if (err){
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('tag', {
      title: 'tag',
      tags: tags,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

module.exports = router;
