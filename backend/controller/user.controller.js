import {user} from "../models/user.model.js";
import {Post} from "../models/post.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req,res) => {
    try{
        const {username,email,password} = req.body;

        if(!username || !email || !password){
            return res.status(401).json({
                message:"something is missing,please check!",
                success:false,
            });
        }
        const existinguser = await user.findOne({email});
        if(existinguser){
            return res.status(401).json({
                message:"try other email",
                success:false,
            });
        }
        
        const hashedpassword =await  bcrypt.hash(password,10);
        await user.create({
            username,
            email,
            password:hashedpassword
        })
        return res.status(201).json({
            message:"Account created successfuly",
            success:true,
        });


    }catch (error){
        console.log(error);
    }
}

export const login = async (req,res) => {
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(401).json({
                message:"something is missing,please check!",
                success:false,
            });
        }

        const existinguser = await user.findOne({email});
        if(!existinguser){
            return res.status(401).json({
                message:"Incorrect email or password",
                succcess:false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, existinguser.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false,
            });
        };

        //populate each post if in a post array
        const populatedposts = await Promise.all(
            existinguser.posts.map( async(postId) => {
                const post = await Post.findById(postId);
                if( post && post.author.equals(existinguser._id)){
                    return post;
                }
                return null;
            })
        ) 

        const userData= {
            _id: existinguser._id,
            username: existinguser.username,
            email: existinguser.email,
            profilepicture: existinguser.profilepicture,
            bio: existinguser.bio,
            gender: existinguser.gender,
            followers: existinguser.followers,
            following: existinguser.following,
            posts: populatedposts,
        }

        const token = await jwt.sign({userId:existinguser._id},process.env.SECRET_KEY,{expiresIn:'1d'});
        return res.cookie('token',token,{httpOnly:true, sameSite:'strict', maxAge: 1*24*60*60*1000}).json({
            message: `welcome back ${existinguser.username}`,
            success:true,
            userData
        });

    }catch (error){
        console.log(error);
    }
};

export const logout = async(_,res) => {
    try {
        return res.cookie('token',"",{maxAge:0}).json({
            message:'log out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
        
    }
};

export const getprofile = async(req,res) => {
    try {
        const userId = req.params.id;
        let User = await user.findById(userId).populate({path:'posts',createdAt:-1}).populate('bookmarks').select('-password');
        return res.status(200).json({
            User,
            success:true
        });
        
    } catch (error) {
        console.log(error);
        
    }
};

export const editprofile =async(req,res) =>{
    try {
        const userId = req.id;
        const {bio,gender} = req.body;
        const profilepicture = req.file;
        let cloudResponse;

        if(profilepicture){
            const fileUri = getDataUri(profilepicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const User =await user.findById(userId).select('-password');
        if(!User){
            return res.status(404).json({
                message:'user not found',
                success:false
            })
        };

        if(bio) User.bio = bio;
        if(gender) User.gender =gender;
        if(profilepicture) User.profilepicture = cloudResponse.secure_url;

        await User.save();
        return res.status(200).json({
            message:'profile updated successfully',
            success: true,
            User
        });

    } catch (error) {
        console.log(error);
    }
};

export const getSuggestedUser = async(req,res) => {
    try {
        const suggestedUsers = await user.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUsers){
            return res.status(400).json({
                message:'currently no user find'
            })
        };
        return res.status(200).json({
            success:true,
            users:suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};

export const followorunfollow = async(req,res) => {
    try {
        const followkarnewala = req.id; //patel
        const jiskofollowkarunga = req.params.id; //shivani
        if(followkarnewala===jiskofollowkarunga){
            return res.status(400).json({
                message:'cannot follow yourself',
                success:false
            });
        }

        const User = await user.findById(followkarnewala);
        const targetUser = await user.findById(jiskofollowkarunga);

        if(!User || !targetUser){
            return res.status(400).json({
                message:'user not found',
                success:false
            });
        }

        //mai check karunga follow karna ya unfollow
        const isFollowing = User.following.includes(jiskofollowkarunga);
        if(isFollowing){
            //unfollow
            await Promise.all([
                user.updateOne({_id:followkarnewala}, {$pull: {following : jiskofollowkarunga}}),
                user.updateOne({_id:jiskofollowkarunga}, {$pull: {followers : followkarnewala}}),
            ])
            return res.status(200).json({message:'unfollowed successfully',success:true});

        }else{
            //follow
            await Promise.all([
                user.updateOne({_id:followkarnewala}, {$push: {following : jiskofollowkarunga}}),
                user.updateOne({_id:jiskofollowkarunga}, {$push: {followers : followkarnewala}}),
            ])
            return res.status(200).json({message:'followed successfully',success:true});
        }

    } catch (error) {
        console.log(error);
        
    }
};

