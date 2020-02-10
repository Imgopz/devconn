const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");


const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const User = require("../../models/User");
// test route
// router.get('/', (req, res) => res.send("Posts route"));

// create post
router.post("/", [ auth, [ check("text", "Post cannot be empty").not().isEmpty() ] ], async (req, res) => {
	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array() });
	}
	
	try {
		const user = await User.findById(req.user.id).select("-password");
		
		const newPost = new Post({
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id
		});
		
		const post = await newPost.save();
		
		res.json(post);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// get all post
router.get("/", auth, async(req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// get post by user id
router.get("/:id", auth, async(req, res) => {
	try {
		const post = await Post.findById(req.params.id).sort({ date: -1 });
		
		if(!post){
			return res.status(404).json({ msg: "Post not found!"})
		}
		
		res.json(post);
	} catch (err) {
		console.error(err.message);
		if(err.kind === "ObjectId"){
			return res.status(404).json({ msg: "Post not found!"})
		}
		res.status(500).send("Server error");
	}
});

// delete post
router.delete("/:id", auth, async(req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		
		if(!post){
			return res.status(404).json({ msg: "Post not found!"})
		}
		
		// check user
		if(post.user.toString() !== req.user.id){
			return res.status(401).json( { msg: "Not authorized"} );
		}
		
		await post.remove()
		
		res.json( { msg: "Post has been removed" } );
;
	} catch (err) {
		console.error(err.message);
		if(err.kind === "ObjectId"){
			return res.status(404).json({ msg: "Posts not found!"})
		}
		res.status(500).send("Server error");
	}
});

// like a post
router.put("/like/:id", auth, async(req, res) => {
	try { 
		const post = await Post.findById(req.params.id);
		
		if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
			return res.status(400).json({ msg: "Post has already been liked!"});
		}
		
		post.likes.unshift({ user: req.user.id });
		
		await post.save();
		
		res.json(post.likes);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});


// unlike a post
router.put("/unlike/:id", auth, async(req, res) => {
	try { 
		const post = await Post.findById(req.params.id);
		
		if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
			return res.status(400).json({ msg: "Post has not been liked yet!"});
		}
		
		// get the remove index
		const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
		
		post.likes.splice(removeIndex, 1);
		
		await post.save();
		
		res.json(post.likes);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// create comment
router.post("/comment/:id", [ auth, [ check("text", "Comment cannot be empty").not().isEmpty() ] ], async (req, res) => {
	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array() });
	}
	
	try {
		const user = await User.findById(req.user.id).select("-password");
		
		const post = await Post.findById(req.params.id);
		
		const newComment = {
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id
		};
		
		post.comments.unshift(newComment);
		
		await post.save();		
		res.json(post.comments);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// delete comment
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
	
	try {		
		const post = await Post.findById(req.params.id);
		
		// pull out the comment from the post
		const comment = post.comments.find( comment => comment.id === req.params.comment_id);
		
		if(!comment){
			return res.status(404).json({ msg: "Comment not found" });
		}
		
		// check user
		if(comment.user.toString() !== req.user.id){
			return res.status(401).json( { msg: "Not authorized"} );
		}
		
		// get the remove index
		const removeIndex = post.comments.map(like => comment.user.toString()).indexOf(req.user.id);
		
		post.comments.splice(removeIndex, 1);
		
		await post.save();		
		
		res.json(post.comments);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});


module.exports = router;