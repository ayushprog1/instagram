import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption:{type:String, default:''},
    image:{type:String, required:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    like:[{type:mongoose.Schema.Types.ObjectId, ref:'user'}],
    comments:[{type:mongoose.Schema.Types.ObjectId, ref:'Comment'}]
});
export const Post = mongoose.model('Post', postSchema);