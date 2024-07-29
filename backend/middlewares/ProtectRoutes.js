import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const protectedRoute = async(req,res,next) =>{
   try{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({error: "unauthorized no token provided"});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.userId).select("-password");

    if(!user){
        return res.status(404).json({error:"user not found"});
    }
    req.user = user;
    next(); 

   }catch(error){
       console.log("error in protect middle ware", error.message);
       return res.status(500).json({error: "internal server error"});
   }

   

   
}