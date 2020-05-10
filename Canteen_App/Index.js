var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'food_order_portal'
});

var app = express();

app.use(express.static(path.join(__dirname, '/')));


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/template/login.html'));
    
});

app.get('/Signup',function(req,res){
    res.sendFile(path.join(__dirname + '/template/Signup.html'));
});

app.post('/check',function(req,res){
        res.send('Success');
});

app.post('/newuser',function(req,resp){
    if(req.body.res_code===req.body.Conf_res_code && req.body.res_code.length>0 && req.body.mob_no.length===10 && req.body.Userame.length>0){
        var mob=req.body.mob_no;
        if(req.body.Domain==='Shopkeeper'){
        connection.query('Select * from admin where phone_no=?',[mob],function(err,res1,fields){
            //if(err)throw err;
            if(res1.length===0){
                connection.query('Insert into admin(username,password,phone_no) values(?,?,?)',[req.body.UserName,req.body.res_code,mob],function(err1,res2,fields1){
                    resp.send('Success');
                });
            }
            else{
                resp.redirect('/Signup');
            }
        });
    }
    else{
        connection.query('Select * from user where phone_no=?',[mob],function(err,res1,fields){
            //if(err)throw err;
            if(res1.length===0){
                connection.query('Insert into user(username,password,phone_no) values(?,?,?)',[req.body.UserName,req.body.res_code,mob],function(err1,res2,fields1){
                    resp.send('Success');
                });
            }
            else{
                resp.redirect('/Signup');
            }
        });
    }
    }
    else{
        //setTimeout(function(){ alert("Hello"); }, 3000);
        resp.redirect('/Signup');
    }
});

app.listen(3000);

