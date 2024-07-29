import Post from "../models/post.model.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { v2 as cloudinary } from "cloudinary";
import { json, response } from "express";

export const CreatePost = async (req, res, next) => {
try {

    const {text} = req.body;
    let {img} = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId)
    if(!user) return res.status(404).json({message: "User not found"})

        if(!img && !text){
            return res.status(404).json({error: "post must have text or image"});
        }

        if(img){
            const uploadeResponse = await cloudinary.uploader.upload(img);
            img =  uploadeResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            text,
            img,
        })

        await newPost.save();
        res.status(201).json(newPost)
     
}

catch(error){
   res.status(500).json("error:", error.message)
   console.log("errro in createPost method", error);
}
}

export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.Status(404).json({error: "Psot not found"});
        }
         if(post.user.toString() !== req.user._id.toString()){
          return res.status(401).json({error: "your are not authorized to delete this post"});
         }

         if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId)
         }
         await Post.findByIdAndDelete(req.params.id);
         res.status(200).json({message: "post deleted successfully"})
    }
    catch(error){
        res.status(500).json("internal sever error")
        console.log("error in deletePost", error.message);
    }
}

export const commentOnPost = async (req, res, next) => {
    try{
     const userId = req.user._id;
     const {text} = req.body;
     const postId = req.params.id;


     if(!text){
        return res.status(404).json({error:"text field is required"});
     }

     const post = await Post.findById(postId);

     if(!post){
        return res.status(404).json({error:"post not found"});
     }

     const comment = {user: userId, text}

     post.comments.push(comment)
     await post.save();

    res.status(200).json(post);

    }catch(error){
        res.status(500).json("internal sever error");
        console.log("error in commentOnPost :",err.message);
    }
}

export const likeUnlikePost = async (req, res, next) => {
    try{
      const userId = req.user._id;
      const {id:postId} = req.params;

      const post = await Post.findById(postId);
      console.log(post);

      if(!post){
        return res.status(404).json("post is not found");
    }
        let userLikePost = post.likes.includes(userId);

        if(userLikePost){
            await Post.updateOne({_id: postId}, {$pull:{likes: userId}});
            await User.updateOne({_id: userId}, {$pull:{likedPosts: postId}});

            const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString())

            res.status(200).json(updatedLikes);
        } else{
            post.likes.push(userId);
            await User.updateOne({_id: userId}, {$push:{likedPosts: postId}});
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type:"like",

            })
            await notification.save();
            const updatedLikes = post.likes
            res.status(200).json(updatedLikes);
        }

    }
    catch{
     res.status(500).json("internal sever error");
     console.log("error in likeUnlikePost :",err.message);
    }
}

export const getAllPosts = async (req, res) => {

    try{
        const posts = await Post.find().sort({ createdAt: -1}).populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        })
        

    if(posts.length === 0) {
        return res.status(200).json([])
    }

    res.status(200).json(posts)

    }catch(error){
        res.status(500).json("internal sever error");
        console.log("error in get all posts :",error.message);
       }
    
}

export const getLikedPosts = async (req, res) =>{
    const userId = req.params.id;

  try{
   const user = await User.findById(userId);
  

   if(!user)  return res.status(404).json({error:"user not found"});

   
   const likedPosts = await Post.find({_id:{$in: user.likedPosts}}).populate({
    path: 'user',
    select: "-password"
   }).populate({
    path: "comments.user",
    select:"-password",
   });

   res.status(200).json(likedPosts);
  } catch(error){
    res.status(500).json("internal sever error");
     console.log("error in getAllLikedPosts :",error.message);
  }
}

export const getFollowingPosts = async (req, res) => {
    try{
    

        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found"})
            const following = user.following
        const feedposts = await Post.find({user: { $in: following }}).sort({createdAt: -1}).populate({
            path:"User",
            select:"-password",
        }).populate({
            path:"comment.user",
            select:"-password",
        })

        res.status(200).json(feedposts)

    }catch(error){
        console.log("error in the follwoing method", error.message);
         res.status(500).json({error:"Interval server error"})
    }
}

export const getUsersPosts = async(req,res) => {
    try{
     const {username} = req.params;
     const user = await User.findOne({username})
     if(!user) return res.status(404).json({error:"User not found"});

     const posts = await Post.find({user: user._id}).sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"
     }).populate({
        path:"comments.user",
        select:"-password",
     })

     res.status(200).json(posts);
    }
    catch(error){
           res.status(500).json("error in internal server")
           console.log("error in the get usersPosts", error.message);
    }

}
