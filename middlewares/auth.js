const jwt = require("jsonwebtoken");

module.exports = (req,res,next) =>{
    let token = req.header("Authorization");
    if(!token) return res.status(401).send("Access denied. no token provided");

    try{
        let payload = jwt.verify(token, process.env.secertKey);
        req.payload = payload;
        next();

    }
    catch (error){
        res.status(401).send("Invalid token");
    }
}