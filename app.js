var Encrypt = require('./crypto.js');
var express = require('express');
var http = require('http');
var app = express();
var dir = "/v1";
var cookie = null;
var user = {};
var jsessionid = randomString('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKMNOPQRSTUVWXYZ\\/+',176) + ':' + (new Date).getTime(); 
var nuid = randomString('0123456789abcdefghijklmnopqrstuvwxyz',32);
function randomString(pattern, length){
  return Array.apply(null, {length: length}).map(() => (pattern[Math.floor(Math.random() * pattern.length)])).join('');
}

var baseCookie=`JSESSIONID-WYYY=${jsessionid}; _iuqxldmzr_=32; _ntes_nnid=${nuid},${(new Date).getTime()}; _ntes_nuid=${nuid}`;
function createWebAPIRequest(path, data, c, response, method) {
	method = method ? method : "POST"
	var music_req = '';
	var cryptoreq = Encrypt(data);
	var http_client = http.request({
		hostname: 'music.163.com',
		method: method,
		path: path,
		headers: {
			'Accept': '*/*',
			'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
			'Connection': 'keep-alive',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Referer': 'http://music.163.com',
			'Host': 'music.163.com',
			'Cookie': cookie,
			'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/602.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/602.1'
		}
	}, function(res) {
		res.on('error', function(err) {
			response.status(502).send('fetch error');
		});
		res.setEncoding('utf8');
		if(res.statusCode != 200) {
			createWebAPIRequest(path, data, c, response, method);
			return;
		} else {
			res.on('data', function(chunk) {
				music_req += chunk;
			});
			res.on('end', function() {
				if(music_req == '') {
					createWebAPIRequest(path, data, c, response, method);
					return;
				}
				if(res.headers['set-cookie']) {
					cookie =baseCookie +';'+ res.headers['set-cookie'];
					response.send({
						code: 200,
						i: JSON.parse(music_req)
					});
					user = JSON.parse(music_req)
					return;
				}
				response.send(music_req);
			})
		}
	});
	http_client.write('params=' + cryptoreq.params + '&encSecKey=' + cryptoreq.encSecKey);
	http_client.end();
}

function createRequest(path, method, data, callback) {
	var ne_req = '';
	var http_client = http.request({
		hostname: 'music.163.com',
		method: method,
		path: path,
		headers: {
			'Referer': 'http://music.163.com',
			'Cookie': 'appver=1.5.6',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			ne_req += chunk;
		});
		res.on('end', function() {
			callback(ne_req);
		})
	});
	if(method == 'POST') {
		http_client.write(data);
	}
	http_client.end();
}

//歌词
app.get(dir + '/lyric', function(request, response) {
	var id = request.query.id;
	createRequest('/api/song/lyric?os=osx&id=' + id + '&lv=-1&kv=-1&tv=-1', 'GET', null, function(res) {
		response.setHeader("Content-Type", "application/json");
		response.send(res);
	});
});

//分类歌单
app.get(dir + '/playlist', function(request, response) {
	var data = {
		'offset': request.query.offset,
		'order': request.query.order || 'hot',
		'limit': request.query.limit,
		'cat': request.query.type,
		"csrf_token": ""
	}
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/playlist/list', data, cookie, response);
});

//评论
app.get(dir + '/music/comments', function(request, response) {
	var id = request.query.id;
	var limit = request.query.limit;
	var offset = request.query.offset;
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		"rid": id,
		"offset": offset,
		"limit": limit,
		"total": false,
		"csrf_token": ""
	};
	createWebAPIRequest('/weapi/v1/resource/comments/R_SO_4_' + id, data, cookie, response)
});

//单曲详情
app.get(dir + '/music/detail', function(request, response) {
	var id = parseInt(request.query.id);
	var data = {
		"id": id,
		'c': JSON.stringify([{
			id: id
		}]),
		"ids": '[' + id + ']',
		"csrf_token": ""
	};
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/weapi/v3/song/detail', data, cookie, response)
});

//单曲播放地址
app.get(dir + '/music/url', function(request, response) {
	var id = parseInt(request.query.id);
	var br = parseInt(request.query.br);
	var data = {
		"ids": [id],
		"br": br,
		"csrf_token": ""
	};
	createWebAPIRequest('/weapi/song/enhance/player/url', data, null, response)
});

//用户详情
app.get(dir + '/user/detail', function(request, response) {
	var id = parseInt(request.query.id);
	var data = {
		"csrf_token": ""
	};
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	createWebAPIRequest('/api/v1/user/detail/' + id, data, cookie, response, 'GET')
});

//歌单详情
app.get(dir + '/playlist/detail', function(request, response) {
	var cookie = request.get('Cookie') ? request.get('Cookie') : (request.query.cookie ? request.query.cookie : '');
	var data = {
		"id": request.query.id,
		"offset": request.query.offset || '0',
		"total": false,
		"n": request.query.limit || 20,
		"limit": request.query.limit || 20,
		"csrf_token": ""
	};
	createWebAPIRequest('/weapi/v3/playlist/detail', data, cookie, response)
});

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

const port = 3000
var server = app.listen(port, function() {
	console.log("API服务器启动启动,监听端口:" + port);
});
