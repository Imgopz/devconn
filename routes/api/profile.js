const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Profile = require("../../models/Profile");
const User = require("../../models/User");



// get profile, private route
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate("user", [ "name", "avatar" ]);
		
		if(!profile) {
			return res.status(400).json( { msg: "There is no profile for this user."});
		}
		
		res.json(profile);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// add or update profile, private route
// Whenever a profile is submitted, initally we check for all the fields' availability if not populate the errors to the errors 
//..array using validator express package by adding the middleware, if everything okay, we will get all the fields from 
//..request.body and create object then save it to the db - this is the complete flow.. catch block will take care of server errors
router.post("/", [ auth, [ check("status", "Status is required").not().isEmpty(),
						   check("skills", "Skills are required").not().isEmpty()]], async (req, res) => {
	const errors = validationResult(req);
	
	if(!errors.isEmpty()) {
		return res.status(400).json( { errors: errors.array() });
	}
	
	const {
		company,
		website,
		location,
		bio,
		status,
		githubusername,
		skills,
		youtube,
		facebook,
		twitter,
		instagram,
		linkedin
	} = req.body;
	
	// build profile object
	const profileFields = {};
	
	profileFields.user = req.user.id;
	
	if(company) profileFields.company = company;
	if(website) profileFields.website = website;
	if(bio) profileFields.bio = bio;
	if(status) profileFields.status = status;
	if(githubusername) profileFields.githubusername = githubusername;
	if(skills){ profileFields.skills = skills.split(',').map(skill => skill.trim()) };
	
	// build social media object
	profileFields.social = {}; // already profileFields has been initialized just add social object by "." (dot) notation
	if(youtube) profileFields.social.youtube = youtube;
	if(facebook) profileFields.social.facebook = facebook;
	if(twitter) profileFields.social.twitter = twitter;
	if(instagram) profileFields.social.instagram = instagram;
	if(linkedin) profileFields.social.linkedin = linkedin;
	
	// find profile, if its there update, not there then create
	try {
		let profile = await Profile.findOne( { user: req.user.id } );
		
		if(profile){
			profile = await Profile.findOneAndUpdate( { user: req.user.id }, { $set: profileFields }, { new: true } );
			return res.json(profile);
		};
		
		// Create new profile by setting instance of profile fields
		profile = new Profile(profileFields);
		
		await profile.save();
		
		return res.json(profile);		
		
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
	
	
});


module.exports = router;