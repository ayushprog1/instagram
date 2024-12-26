import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import {Post} from "../models/post.model.js";
import {user} from "../models/user.model.js";
import {Comment} from "../models/comment.model.js"; 
import { getReceiverSocketId , io } from "../socket/socket.js";

export const addnewpost = async(req,res)=> {
    try {
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id;

        if(!image) return res.status(401).json({message:'image required'});

        //image upload
        const optimizedImageBuffer= await sharp(image.buffer)
        .resize({width:800,height:800,fit:'inside'})
        .toFormat('jpeg',{quality:80})
        .toBuffer();

        //file to datauri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post =await Post.create({
            caption,
            image:cloudResponse.secure_url,
            author:authorId
        });
        const User = await user.findById(authorId);
        if(User){
            User.posts.push(post._id);
            await User.save();
        }

        await post.populate({path:'author',select:'-password'});

        return res.status(201).json({
            message:'New post added',
            post,
            success:true
        });

    } catch (error) {
        console.log(error);
    }
}

export const getAllPost = async(req,res) =>{
    try {
        const posts = await Post.find().sort({createdAt:-1})
        .populate({path:'author', select:'username profilepicture'})
        .populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilepicture'
            }

        })

        return res.status(200).json({
            posts,
            success:true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getUserPost = async(req,res)=>{
    try {
        const authorId = req.id;
        const posts = await Post.find({author:authorId}).sort({createdAt:-1})
        .populate({path:'author', select:'username profilepicture'})
        .populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilepicture'
            }

        })

        return res.status(200).json({
            posts,
            success:true
        });
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async(req,res)=>{
    try {
        const likekarnewala = req.id;
        const postid = req.params.id;
        const post = await Post.findById(postid);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        //like logic
        await post.updateOne({ $addToSet : {like:likekarnewala}});
        await post.save();

        //implementation socket io for real time notification
        const User = await user.findById(likekarnewala).select('username profilepicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId!== likekarnewala){
            //emit  a notification event
            const notification ={
                type: 'like',
                userId: likekarnewala,
                userDetails:User,
                postid,
                message:'your post was liked'
            }

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notifiaction',notification);
        }

        return res.status(200).json({message:'post liked',success:true});

    } catch (error) {
        console.log(error);
    }
};
export const dislikePost = async(req,res)=>{
    try {
        const dislikekarnewala = req.id;
        const postid = req.params.id;
        const post = await Post.findById(postid);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        //like logic
        await post.updateOne({ $pull : {like :dislikekarnewala}});
        await post.save();

        //implementation socket io for real time notification
        const User = await user.findById(dislikekarnewala).select('username profilepicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId!== dislikekarnewala){
            //emit  a notification event
            const notification ={
                type: 'dislike',
                userId: dislikekarnewala,
                userDetails:User,
                postid,
                message:'your post was disliked'
            }

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notifiaction',notification);
        }

        return res.status(200).json({message:'post Disliked',success:true});

    } catch (error) {
        console.log(error);
    }
};

export const addComment = async(req,res) =>{
    try {
        const postid = req.params.id;
        const commentkarnewala = req.id;

        const {text} = req.body;

        const post = await Post.findById(postid);

        if(!text) return res.status(400).json({message:'text is required' , success:false});

        const comment =await Comment.create({
            text,
            author:commentkarnewala,
            post:postid
        })

        await comment.populate({
            path:'author',
            select:'username  profilepicture'
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:'comment added',
            comment,
            success:true
        });

    } catch (error) {
        console.log(error);
    }
};

export const getcommentsofpost = async(req,res) =>{
    try {
        const postid = req.params.id;

        const comments = await Comment.find({post:postid}).populate('author','username profilepicture');

        if(!comments) return res.status(404).json({message:'no comment found for this post',success:false});

        return res.status(200).json({success:true,comments});
    } catch (error) {
        console.log(error);
        
    }
};

export const deletepost = async(req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        //check login user is owner of post 
        if(post.author.toString() !== authorId ) return res.status(403).json({message:'unauthorized'});

        //delete post
        await Post.findByIdAndDelete(postId);

        //delete post from user 
        let User = await user.findById(authorId);
        User.posts = User.posts.filter(id => id.toString() !== postId);
        await User.save();
        
        //delete associated comment
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            message:'post delete successfully',
            success:true,
        });

    } catch (error) {
        console.log(error);
    }
};

export const bookmarkspost = async(req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'post not found',success:false});

        const User = await user.findById(authorId);
        if(User.bookmarks.includes(postId)){
            //already bookmarked -> remove from bookmarked
            await User.updateOne({$pull:{bookmarks:post._id}});
            await User.save();
            return res.status(200).json({type:'unsaved',message:'unbookmarked',success:true}); 
        }
        else{
            //bookmarke karna padega
            await User.updateOne({$addToSet:{bookmarks:post._id}});
            await User.save();
            return res.status(200).json({type:'saved',message:'post bookmarked successfully',success:true});
        }
    } catch (error) {
        console.log(error);
    }
};