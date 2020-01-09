const jwt = require("jsonwebtoken");
const config = require("config");

module.exports =  function(req, res, next){
	// get token from header
	const token = req.header("x-auth-token");
	
	// no token
	if(!token){
		return res.status("401").json({ msg: "No token, authentication denied" });
	}
	
	// verify token
	try{
		const decode = jwt.verify(token, config.get("jwtSecret"));
		
		req.user = decode.user;
		next();
		
	}catch(err){
		return res.status("401").json({ msg: "Token is not Valid" });
	}
}