const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config"); // required for jwt
const { check, validationResult } = require("express-validator/check") // these methods are used to validate the fields

const User = require("../../models/User")
router.get('/', (req, res) => res.send("User route"));

// mention the errors array as middleware in the request, and it will be populated in error array as defined below.
router.post('/', [check("name", "Name is required!").not().isEmpty(), 
				  check("email", "Please enter a valid email").isEmail(),
				  check("password", "Please enter password with 6 or more chars").isLength({ min: 6 })], async (req, res) => { // using async await here
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array() });
	}
	// pull out only required vars from req.body as below
	const { name, email, password } = req.body;	
	try{
		let user = await User.findOne({ email });
		
		if(user){
			return res.status(400).json({ errors: [{ msg: "User already exists" }] }); // need to add return otherwise error will be printed in console log
		}
		const avatar = gravatar.url(email, { s:200, r:"pg", d:"mm" })
		
		// crate an user instance
		user = new User({ name, email, avatar, password })
		
		// before saving hash the password, create a salt and blend it with password using bcrypt js
		const salt = await bcrypt.genSalt(10); // create salt using bcrypt, here the value 10 is recommended value from bcrypt
		
		user.password = await bcrypt.hash(password, salt) // hash it with password using bcrypt and assign to user.password
		
		//where ever we are getting promisses, put await over there
		await user.save(); // this will give promise from the db you can use this id to create payload for jwt
		
		const payload = { user:{ id: user.id } }; // take from promis from above step
		
		jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 3600 }, (err, token) => {  // import config package
			if(err) throw err; 
			res.send({ token });
		});

	}catch(err){
		console.error(err.message);
		res.status(500).send("Server error")
	}
});

module.exports = router;