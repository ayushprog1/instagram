import {Message} from "../models/message.model.js";
import {Conversation} from "../models/conversation.model.js";
import { getReceiverSocketId } from "../socket/socket.js";

export const sendmessage = async(req,res) =>{
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {textMessage :message} = req.body;

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        });
        //establise conversation if not started
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId,receiverId]
            })
        };

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        
        if(newMessage) conversation.messages.push(newMessage._id);
        
        await Promise.all([conversation.save(),newMessage.save()]);

        //implement socket io for real time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('new message', newMessage);
        }

        return res.status(200).json({success:true,newMessage});
    } catch (error) {
        console.log(error);
        
    }
};

export const getmessage = async(req,res) => {
    try {
        const senderId =req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate('messages'); 
        if(!conversation) return res.status(200).json({success:true, messages:[]});

        return res.status(200).json({success:true, messages:conversation?.messages});

    } catch (error) {
        console.log(error);
        
    }
};

