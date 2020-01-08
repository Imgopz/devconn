const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check") // these methods are used to validate the fields

router.get('/', (req, res) => res.send("User route"));

// mention the errors array as middleware in the request, and it will be populated in error array as defined below.
router.post('/', [check("name", "Name is required!").not().isEmpty(), 
				  check("email", "Please enter a valid email").isEmail(),
				  check("password", "Please enter password with 6 or more chars").isLength({ min: 6 })], (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array() });
	}
	res.send("User route")
});

module.exports = router;