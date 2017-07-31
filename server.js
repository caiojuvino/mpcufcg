var http = require('http');
var https = require('https');
var querystring = require('querystring');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

app.use(express.static('views'));

app.engine('html', require('ejs').renderFile);

var hostLocal = 'http://custom-env-1.kkwrfef5rx.us-west-2.elasticbeanstalk.com'; //'http://localhost:8080/blindMapWeb';

app.use(session({
	secret: 'ssshhhhh',
	resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var sess;

app.get('/',function(req,res){
	res.render('index.html');
});

app.get('/googleMaps', function(req, res, next) {
	https.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-7.2147,-35.9088&radius=350&key=AIzaSyDaye__0xpuBSZ8DYhBB8Hr3cL8G6FxnHU', (response) => {
		var body = '';
		
		response.on('data', (d) => {	
			body += d;
		});
		
		response.on('end', function(){
			var json = JSON.parse(body);
			res.json(json);
		});
		
	}).on('error', (e) => {
		console.error(e);
	});
});

app.get('/dadosOficiais', function(req2, res, next) {

	request.post(hostLocal + '/getTodosDadosOficiais',
		function(err, httpResponse, body) {
			console.log(`Status: ${httpResponse.statusCode} - ${httpResponse.statusMessage}`);

			var json = JSON.parse(body);
			res.json(json);
		}
	);

});

app.get('/barreiras', function(req2, res, next) {

	request.get(hostLocal + '/getTodasBarreirasProcessadas',
		function(err, httpResponse, body) {
			console.log(`Status: ${httpResponse.statusCode} - ${httpResponse.statusMessage}`);

			var json = JSON.parse(body);
			//console.log(json)
			res.json(json);
		}
	);
	
});


app.get('/atualizarBarreirasDisponiveis', function(req2, res, next) {

	const postData = querystring.stringify({
		'idsBarreiras': req2.query.idsBarreiras,
		'idsOficiais': req2.query.idsOficiais
	});
	

	request.post(`${hostLocal}/atualizarBarreirasDisponiveis?${postData}`,
		function(err, httpResponse, body) {
			console.log(`Status: ${httpResponse.statusCode} - ${httpResponse.statusMessage}`);
			console.log('commit SERVER');

			//var json = JSON.parse(body);
			//res.json(json);
			res.end();
		}
	);

});

app.get('/teste', function(req2, res, next) {

	const postData = querystring.stringify({
		'idGrupo': req2.query.id
	});
	

	request.post(`${hostLocal}/getGrupoDeBarreiras?${postData}`,
		function(err, httpResponse, body) {
			console.log(`Status: ${httpResponse.statusCode} - ${httpResponse.statusMessage}`);

			var json = JSON.parse(body);
			res.json(json);
		}
	);

});

app.get('/login',function(req,res){
	console.log('/login');
	sess = req.session;
	
	if(checkPass()) {
		res.redirect('/admin');
	} else {
		res.render('login.html');
	}
});

app.post('/login',function(req,res){
	console.log('/login post');
	sess = req.session;
	sess.email=req.body.email;
	sess.password=req.body.pass;
	
	if(checkPass()) {
		res.end('done');
	} else {
		res.end('else');
	}
});

app.get('/admin', function(req, res){
	console.log('/admin');
	sess = req.session;
	
	if(checkPass()) {	
		res.render('admin.html');
		console.log('/admin email and pass ok');	
	} else {
		res.render('login_first.html');
		console.log('/admin fail');
	}
});

function checkPass(){
		return sess.email == 'mpcadmin' && sess.password == '{adminmpc}';
}

app.get('/logout', function(req, res){
	console.log('finish --------------------------');
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

app.listen(3000, function(){
	console.log('App started on PORT 3000\n');
});