const express = require("express");
const router = express.Router();
const request = require("request"); // to make request to external API. here its git hub
const config = require("config"); // get all the secret config here, in this case we are getting github id, secret
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

// to get all profiles
router.get("/", async(req, res) => {
	try {
		const profiles = await Profile.find().populate("user", ["name", "avatar"]);
		res.json(profiles);
 	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// to get profile by id
router.get("/user/:user_id", async(req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate("user", ["name", "avatar"]);
		
		if(!profile){
			return res.status(400).json({ msg: "Profile not found!" });
		}
		
		res.json(profile);
 	} catch (err) {
		console.error(err.message);
		if(err.kind === "ObjectId"){
			return res.status(400).json({ msg: "Profile not found!" });
		}
		res.status(500).send("Server Error");
	}
});

// delete profile/user : private - adding middleware
router.delete("/", auth, async(req, res) => {
	try {
		await Profile.findOneAndRemove( { user: req.user.id });
		await User.findOneAndRemove( { _id: req.user.id} );
		
		res.send( { msg: "User has been removed!"})
 	} catch (err) {
		console.error(err.message);
		if(err.kind === "ObjectId"){
			return res.status(400).json({ msg: "Profile not found!" });
		}
		res.status(500).send("Server Error");
	}
});

// update experience - private obviously
router.put("/experience", [ auth, [ check("title", "Title is required").not().isEmpty(),
								    check("company", "Company is required").not().isEmpty(),
								    check("location", "Location is required").not().isEmpty(),
								    check("from", "From date is required").not().isEmpty() ] ], async(req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array() });
	}
	
	const {
		title,
		company,
		location,
		from,
		to,
		current,
		description
	} = req.body;
	
	const newExp = {
		title, // title: title from req.
		company,
		location,
		from,
		to,
		current,
		description
	}
	
	try {
		const profile = await Profile.findOne( { user: req.user.id } );
		
		profile.experience.unshift(newExp);
		
		await profile.save();
		
		res.json(profile);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
	
});

//delete experience
router.delete("/experience/:exp_id", auth, async(req, res)=>{
	try{
		//find profile by user id
		const profile = await Profile.findOne({ user: req.user.id });
		
		// get the removeIndex by req params
		const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
		
		profile.experience.splice(removeIndex, 1);
		
		await profile.save();
		
		res.json(profile);
		
	}catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// update education
router.put("/education", [ auth, [ 	check("school", "School is required").not().isEmpty(),
								    check("degree", "Degree is required").not().isEmpty(),
								  	check("fieldofstudy", "Field of study is required").not().isEmpty(),
								    check("from", "From date is required").not().isEmpty() ] ], async(req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array() });
	}
	
	const {
		school,
		degree,
		fieldofstudy,
		from,
		to,
		current,
		description
	} = req.body;
	
	const newEdu = {
		school,
		degree,
		fieldofstudy,
		from,
		to,
		current,
		description
	}
	
	try {
		const profile = await Profile.findOne( { user: req.user.id } );
		
		profile.education.unshift(newEdu);
		
		await profile.save();
		
		res.json(profile);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
	
});


//delete education
router.delete("/education/:edu_id", auth, async(req, res)=>{
	try{
		//find profile by user id
		const profile = await Profile.findOne({ user: req.user.id });
		
		// get the removeIndex by req params
		const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
		
		profile.education.splice(removeIndex, 1);
		
		await profile.save();
		
		res.json(profile);
		
	}catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// get github repository for given user
router.get("/github/:username", (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get("githubClientId")}&client_secret=${config.get("githubSecret")}`,
			method: "GET",
			headers: {'user-agent':'node.js'}
		}
		
		request(options, (error, response, body) => {
			if(error) console.error(error);
			
			if(response.statusCode != 200){
				return res.status(404).json({ msg: "No git profile found" });
			}
			
			res.json(JSON.parse(body)); // to parse the result
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

module.exports = router;