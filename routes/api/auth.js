const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config"); // required for jwt
const { check, validationResult } = require("express-validator/check") // these methods are used to validate the fields

router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error")
	}
});

// Login user
router.post('/', [ check("email", "Please enter a valid email").isEmail(),
				   check("password", "Password is required").exists()], async (req, res) => { // using async await here
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array() });
	}
	// pull out only required vars from req.body as below
	const { email, password } = req.body;	
	try{
		let user = await User.findOne({ email });
		
		if(!user){
			return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] }); // need to add return otherwise error will be printed in console log
		}
	
		const isMatch = await bcrypt.compare(password, user.password); // comparying db password, and req.body password here using bcrypt
		if(!isMatch){
			return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
		}
		
		const payload = { user:{ id: user.id } }; // take from promis from above step
		
		jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 360000 }, (err, token) => {  // import config package
			if(err) throw err; 
			res.send({ token });
		});  // create token and send it back to user and use it to protect the route

	}catch(err){
		console.error(err.message);
		res.status(500).send("Server error")
	}
});

module.exports = router;