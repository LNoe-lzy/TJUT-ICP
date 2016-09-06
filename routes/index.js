var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var formidable = require('formidable');
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest: 'public/avatar/tmp/'});
var async = require('async');

var imgUpload = require('../models/upload');

User = require('../models/user');
Images = require('../models/image');
Proxy = require('../models/proxy');
History = require('../models/history');
Tags = require('../models/tag');
Tool = require('../models/tool');

//GET home page.
//通过分页效果渲染首页
router.get('/', function(req, res){
  var page = req.query.page ? parseInt(req.query.page) : 1;
  var user = req.session.user;
  Tags.find(null, function (err, tags) {
    if (err) {
      console.log(err);
    }
    // 分页查询
    Images.find(null).count().exec(function (err, total) {
      if (err) {
        console.log(err);
      }
      Images.find(null).sort({_id: -1}).skip((page - 1) * 30).limit(30).exec(function (err, images) {
        if (err) {
          console.log(err);
        }
        res.render('index', {
          title: 'LeeImage',
          user: req.session.user,
          t: tags,
          images: images,
          page: page,
          isFirstPage: (page - 1) === 0,
          isLastPage: ((page - 1) * 30 + images.length) === total,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res){
  res.render('login', {
    title: '登录',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res){
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  User.findOne({
    name: req.body.name
  }, function(err, user){
    if (err) {
      console.log(err);
    }
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

router.get('/signup', checkNotLogin);
router.get('/signup', function(req, res){
  res.render('signup', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/signup', checkNotLogin);
router.post('/signup', function(req, res){
  var name = req.body.name,
      password = req.body.password,
      passwordre = req.body.passwordrep,
      md5 = crypto.createHash('md5');
  if (passwordre !== password){
    req.flash('error', '两次输入的密码不一样!');
    return res.redirect('/signup');
  }
  password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    name: name,
    email: req.body.email,
    password: password
  });
  User.findOne({
    name: newUser.name
  }, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/signup');
    }
    newUser.save(function(err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/signup');
      }
      req.session.user = user;
      req.flash('success', ' 注册成功!');
      res.redirect('/');
    });
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res){
  req.session.user = null;
  req.flash('success', '退出成功!');
  res.redirect('/');
});

//用户上传图像
router.post('/new', checkLogin);
router.post('/new', upload.single('fulAvatar'),function(req, res) {
   //获取临时存储位置
  var tmp_path = req.file.path,
      //获取文件名称
      file_name = req.file.filename,
      //获取文件的mime类型以修改扩展名
      mimeType = req.file.mimetype,
      data = {
        userId: req.session.user._id,
        userName: req.session.user.name,
        info: req.body.text,
        tag: req.body.tag.split(' ')
      };
  imgUpload.imgUpload(tmp_path, file_name, mimeType, data, req, res);
});

router.get('/u/:id', checkLogin);
router.get('/u/:id', function(req, res) {
  var userid = req.params.id;
  User.findById({
    _id: userid
  }, function(err, user) {
    if (!user) {
      req.flash('error', '用户不存在!');
      return res.redirect('/');
    }
    Images.find({
      userId: userid
    }, function(err, images) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        user: req.session.user,
        currentUser: user,
        images: images,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});

router.post('/u/:id', checkLogin);
router.post('/u/:id', function(req, res){
  var newName = req.body.newName,
      email = req.body.email,
      text = req.body.text;
  User.update({
    _id: req.session._id
  }, {
    $set: {
      name: newName,
      email: email,
      text: text
    }
  }, function (err) {
    if (err) {
      console.log(err);
    }
    req.session.user = null;
    req.flash('success', '编辑成功!');
    res.redirect('/login');
  });
});

//用户浏览记录页面
router.get('/u/:id/history', checkLogin);
router.get('/u/:id/history', function(req, res) {
  var userid = req.params.id,
      currentUser = req.session.user;
  User.findOne({
    _id: userid
  }, function(err, user) {
    if (!user){
      req.flash('error', '用户不存在!');
      return res.redirect('/');
    }
    History.find({
      userId: req.session.user._id
    }, function (err, his) {
      if (err) {
        console.log(err);
      }
      var hisArray = [];
      var hisAsync = function () {
        async.mapSeries(his, function (e, callback) {
          Images.findById(e.imageId, function (err, img) {
            if (err) {
              console.log(err);
            }
            hisArray.push(img);
            callback();
          });
        }, function (err) {
          if (err) {
            console.log(err);
          }
          res.render('history', {
            title: user.name,
            user: currentUser,
            history: hisArray,
            currentUser: user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
          });
        });
      };
      hisAsync(function (err) {
        if (err) {
          console.log(err);
        }
      })
    });
  });
});

router.get('/u/edit/:id/:imageName', checkLogin);
router.get('/u/edit/:id/:imageName', function(req, res) {
  var currentUser = req.session.user;
  User.findOne({
    _id: req.params.id
  }, function(err, user) {
    if (!user) {
      req.flash('error', '用户不存在!');
      return res.redirect('/');
    }
    res.render('edit', {
      title: user.name,
      user: currentUser,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/u/edit/:id/:imageId', checkLogin);
router.post('/u/edit/:id/:imageId', function(req, res){
  var tags = [req.body.tag1, req.body.tag2, req.body.tag3];
  Images.update({
    userId: req.session.userId,
    imageId: req.params.imageId
  }, {
    $set: {
      userId: req.session.userId,
      imageId: req.params.imageId,
      info: req.body.info,
      tag: tags
    }
  }, function (err) {
    if (err) {
      console.log(err);
    }
    req.flash('success', '添加成功!');
    res.redirect('/u/' + req.params.name);
  });
});

router.get('/info/:imageId', checkLogin);
router.get('/info/:imageId', function(req, res){
  var page = req.query.page ? parseInt(req.query.page) : 1;
  Images.findById(req.params.imageId, function (err, image) {
    if (err) {
      console.log(err);
    }
    var newHistory = new History({
      userId: req.session.user._id,
      imageId: req.params.imageId
    });
    newHistory.save(function(err){
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      Images.findById(req.params.imageId, function (err, img) {
        if (err) {
          console.log(err);
        }
        Images.find({
          tag: img.tag
        }).count().exec(function (err, total) {
          if (err) {
            console.log(err);
          }
          Images.find({
            tag: img.tag
          }).skip((page - 1) * 30).limit(30).exec(function (err, images) {
            if (err) {
              console.log(err);
            }
            res.render('info', {
              title: 'info',
              image: image,
              images: images,
              user: req.session.user,
              page: page,
              isFirstPage: (page - 1) == 0,
              isLastPage: ((page - 1) * 30 + images.length) == total,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
            });
          });
        });
      });
    });
  });
});

router.get('/remove/:imageId',checkLogin);
router.get('/remove/:imageId', function(req, res){
  var currentUser = req.session.user._id;
  Images.remove({
    userId: currentUser,
    _id: req.params.imageId
  }, function(err){
    if (err){
      req.flash('err', error);
      return res.redirect('/' + currentUser);
    }
    req.flash('success', '删除成功!');
    res.redirect('/u/' + req.session.user.name);
  });
});

router.get('/tags/:tag', checkLogin);
router.get('/tags/:tag', function(req, res){
  var page = req.query.page ? parseInt(req.query.page) : 1;
  Images.find({
    tag: req.params.tag
  }).count().exec(function (err, total) {
    if (err) {
      console.log(err);
    }
    Images.find({
      tag: req.params.tag
    }).skip((page - 1) * 30).limit(30).exec(function (err, tags) {
      if (err) {
        console.log(err)
      }
      res.render('tag', {
        title: 'tag',
        tags: tags,
        user: req.session.user,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 30 + tags.length) == total,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});

router.get('/search', checkLogin);
router.get('/search', function(req, res){
  var pattern = new RegExp("^.*" + req.query.keyword + ".*$", "i"),
      img = [];
  Images.find({
    info: pattern
  }, function(err, ir){
    if (err){
      req.flash('error', err);
      return res.redirect('/');
    }
    ir.forEach(function (e1) {
      img.push(e1);
    });
    Images.find({
      tag: pattern
    }, function (err, tr) {
      if (err) {
        console.log(err);
      }
      tr.forEach(function (e2) {
        img.push(e2);
      });
      res.render('search', {
        title: "搜索结果",
        searchs: img,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});

//图像检索界面
router.post('/imgsearch', checkLogin);
router.post('/imgsearch', upload.single('imgsearch'), function(req, res){
  //获取临时存储位置
  var tmp_path = req.file.path;
  //获取文件名称
  var file_name = req.file.filename;
  //获取文件的mime类型以修改扩展名
  var mimeType = req.file.mimetype;
  imgUpload.imgSearch(tmp_path, file_name, mimeType, req, res);
});

//返回图像检索结果
router.get('/results', checkLogin);
router.get('/results', function(req, res){
  res.render('results', {
    title: "搜索结果",
    user: req.session.user,
    results: req.session.searchPath,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

//用于站内开发测试
router.get('/test', function(req, res){
  res.render('test', {
    title:'test'
  });
});
router.post('/file-upload', upload.single('img'),function(req, res){

});

//爬虫页面
router.get('/admin', function(req, res){
  res.render('admin', {
    title: "admin",
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/admin', function(req, res){
  var t_url = req.body.url;
  var newProxy = new Proxy(t_url);
  newProxy.startproxy(function(err){
    if (err){
      req.flash('error', err);
      return res.redirect('/');
    }
  });
});

module.exports = router;


function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录!');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登录!');
    res.redirect('back');
  }
  next();
}