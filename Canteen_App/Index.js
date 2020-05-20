var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const { request } = require('https');

const {
    sess_name='sid',
    sess_secret='rahulanand',
    sess_life=3600*1000
} =process.env


var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'food_order_portal'
});



var app = express();
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/')));


app.use(session({
	secret: sess_secret,
	resave: false,
    saveUninitialized: false,
    name: sess_name,
    cookie:{
        maxAge:sess_life,
        sameSite:true,
        secure:false
    }
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const redirectlogin =(req,res,next)=>{
    if(!req.session.userId){
        res.redirect('/');
    }
    else{
        next();
    }
}

const redirecthome =(req,res,next)=>{
    if(req.session.userId){
        res.redirect('/home');
    }
    else{
        next();
    }
}



app.get('/',redirecthome, function(req, res) {
    res.sendFile(path.join(__dirname + '/template/login.html'));
});

app.get('/Signup',redirecthome, function(req,res){
    res.sendFile(path.join(__dirname + '/template/Signup.html'));
});

app.get('/home',redirectlogin, function(req,res){
    
    res.render(path.join(__dirname + '/template/home.ejs'),{name:req.session.userId,phone:req.session.phone})
})

app.get('/logout',redirectlogin, function(req,res){
    req.session.destroy(err=>{
        if(err){
            return res.redirect('/');
        }
        res.clearCookie(sess_name);
        res.redirect('/');
    })
})

app.post('/login',function(req,res){
    var mob=req.body.mob_no;
    var pass=req.body.password;
    if(req.body.Domain=='Shopkeeper'){
    connection.query('Select * from admin where phone_no=? and password=?',[mob,pass],function(err1,res1,fields1){
        
        if(res1.length==1){
            Object.keys(res1).forEach(function(key) {
                var row=res1[key];
                //console.log(row.username);
                req.session.userId= row.username;
                req.session.phone=row.phone_no;
              }); 
              req.session.domain='shopkeeper'; 
              //console.log(req.session.userId);
              res.redirect('/home')
              
        }
        else{
         return res.redirect('/');
        }
    }
    )
    }
    else{
        connection.query('Select * from user where phone_no=? and password=?',[mob,pass],function(err1,res1,fields1){
            if(res1.length==1){
                Object.keys(res1).forEach(function(key) {
                    var row=res1[key];
                    req.session.userId= row.username;
                    req.session.phone=row.phone_no;
                  });
                  req.session.domain='user'; 

                  res.redirect('/home')
                  
            }
            else{
             return res.redirect('/');
            }
        }
        )
    }
});

app.post('/signup',function(req,resp){
    if(req.body.res_code===req.body.Conf_res_code){
        var mob=req.body.mob_no;
        if(req.body.Domain==='Shopkeeper'){
        connection.query('Select * from admin where phone_no=?',[mob],function(err,res1,fields){
            if(res1.length===0){
                connection.query('Insert into admin(username,password,phone_no) values(?,?,?)',[req.body.UserName,req.body.res_code,mob],function(err1,res2,fields1){
                    
                });
                req.session.userId= req.body.UserName;
                    req.session.phone= mob; 
                resp.redirect('/home');

            }
            else{
                resp.redirect('/Signup');
            }
        });
    }
    else{
        connection.query('Select * from user where phone_no=?',[mob],function(err,res1,fields){
            
            if(res1.length===0){
                connection.query('Insert into user(username,password,phone_no) values(?,?,?)',[req.body.UserName,req.body.res_code,mob],function(err1,res2,fields1){
                   
                });
                req.session.userId= req.body.UserName;
                req.session.phone= mob; 
            resp.redirect('/home');
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

