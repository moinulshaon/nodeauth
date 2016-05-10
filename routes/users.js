var express = require('express');
var router = express.Router();

var User = require('../models/user');


var passport = require('passport');
var localStrategy = require('passport-local').Strategy; 

/* GET users listing. */
router.get('/', function(req, res, next) {   
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});
router.post('/register', function(req, res, next) {

	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	console.log("req.files " + req.files);

	console.log("req.file " + req.file);

	if ( req.files.profileimage ){

		console.log('uploading image...');

		var profileImageOriginalName = req.files.profileimage.originalname;
		var profileImageName = req.files.profileimage.name;
		var profileImageMime = req.files.profileimage.mimetype;
		var profileImagePath = req.files.profileimage.path;
		var profileImageExt = req.files.profileimage.extension;
		var profileImageSize = req.files.profileimage.size;

	}else{
		var profileImageName = 'noimage.png';
	}

	//form validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Not valid email').isEmail();
	req.checkBody('username','Username field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2','Passwords dont match').equals(req.body.password);

	//validate form

	var errors = req.validationErrors(); 
	if ( errors ){
		res.render('register',{
			errors:errors,
			name:name,
			email:email,
			username:username,
			password:password,
			password2:password2
		});
	}else{

		var newUser = new User({
			errors:errors,
			name:name,
			email:email,
			username:username,
			password:password,
			profileimage: profileImageName
		});

		User.createUser( newUser,function(err,user){
			if ( err ){
				throw err;
			}
			console.log(user);
		} );
		req.flash('success','You are now register, you can log in');

		res.location('/');
		res.redirect('/');
	}

});

passport.serializeUser( function(user,done){
	done(null,user.id);
}  );

passport.deserializeUser( function(id,done){
	User.getUserById( id, function(err,user){
		done(err,user);
	}  );
}  );


passport.use( new localStrategy(
	function (username,password,done){
		User.getUserByUsername(username,function(err,user){
			if ( err )throw err;
			if (!user){
				console.log('Unknown user');
				return done(null,false,{message:'Unknown user'});
			}
			User.comparePassword( password , user.password , function(err,isMatch){
				if ( err )throw err;
				if ( isMatch )return done(null,user);
				else {
					console.log('Invalid password');
					return done(null,false,{message:'Invalid password'});	
				}
			} );
		});
	}
));

router.post('/login', passport.authenticate('local',{
	failureRedirect:'/users/login',
	failureFlash:'invalid username or password'
} ),function(req,res){
	console.log('authentication successfull');
	req.flash('success','you are logged in');
	res.redirect('/');
});


router.get('/login', function(req, res, next) {
  res.render('login',{title:'Log In'});
});
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success ','You have succesfully logged out');
	res.redirect('/users/login');
});

module.exports = router;
