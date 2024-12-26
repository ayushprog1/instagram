import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './comment'
import { toast } from 'sonner'
import axios from 'axios'
import { setPosts } from '@/redux/postSlice'

const CommentDialog = ({ open, setOpen }) => {
    const [text, setText] = useState("");
    const { SelectedPost ,posts } = useSelector(store => store.post);
    const [comment, setComment] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if(SelectedPost){
            setComment(SelectedPost?.comments);
        }
    }, [SelectedPost]);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        }
        else {
            setText("");
        }
    }


    const sendMessageHandler = async () => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/post/${SelectedPost._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                const updateCommentData = [res.data.comment , ...comment];
                setComment(updateCommentData);

                const updatedpostdata = posts.map(p =>
                    p._id == SelectedPost._id ? { ...p, comments: updateCommentData } : p
                );
                dispatch(setPosts(updatedpostdata));

                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-5xl p-0 flex flex-col">
                <div className='flex flex-1'>
                    <div className='w-1/2'>
                        <img
                            src={SelectedPost?.image}
                            alt="post_img"
                            className='w-full h-full object-cover rounded-l-lg'
                        />
                    </div>
                    <div className='w-1/2 flex flex-col justify-between'>
                        <div className='flex items-center justify-between p-4'>
                            <div className='flex gap-3 items-center'>
                                <Link>
                                    <Avatar>
                                        <AvatarImage src={SelectedPost?.author?.profilepicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <Link className='font-semibold text-xs'>{SelectedPost?.author?.username}</Link>
                                    {/*<span className='text-gray-600 text-sm'>Bio here</span>*/}
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild >
                                    <MoreHorizontal className='cursor-pointer' />
                                </DialogTrigger>
                                <DialogContent className='flex flex-col items-center text-sm text-center'>
                                    <div className='cursor-pointer w-full text-[#ED4956] font-bold'>
                                        unfollow
                                    </div>
                                    <div className='cursor-pointer w-full'>
                                        Add to favorites
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <hr />
                        <div className='flex-1 overflow-y-auto max-h-96 p-4'>
                            {
                                comment.map((comment) => <Comment key={comment._id} comment={comment} />)
                            }
                        </div>
                        <div className='p-4'>
                            <div className='flex items-center gap-2'>
                                <input type='text' onChange={changeEventHandler} placeholder="Add a comment..." className='w-full outline-None border border-gray-300 p-2 rounded ' />
                                <Button disabled={!text.trim()} onClick={sendMessageHandler} variant='outline' >Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CommentDialog