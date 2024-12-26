import React, { useRef, useState } from 'react'
import {Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({open,setOpen}) => {
  const imgRef =useRef();
  const [file,setFile]= useState("");
  const [caption,setCaption]=useState("");
  const [imagePreview, setImagePreview] =useState("");
  const [loading , setloading] = useState(false);
  const {user} = useSelector(store => store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();
  
  const fileChangeHandler = async(e)=>{
    const file = e.target.files?.[0];
    if(file){
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }
  
  const createPostHandler = async(e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if(imagePreview) formData.append("image",file);
    try {
      setloading(true);
      const res = await axios.post('http://localhost:8000/api/v1/post/addpost',formData,{
        headers: {
          'Content-Type':'multipart/form-data'
        },
        withCredentials:true
      });
      if(res.data.success){
        dispatch(setPosts([res.data.post , ...posts])); //[1]->[1,2]
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
        toast.error(error.response.data.message);
    }
    finally{
      setloading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={()=>setOpen(false)}>
        <DialogHeader className="text-center font-semibold">create a post</DialogHeader>
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilepicture} alt="img"/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-xs'>{user?.username}</h1>
            <span className='text-gray-600 text-xs'>Bio here...</span>
          </div>

        </div>
        <Textarea value={caption} onChange={(e)=>setCaption(e.target.value)} className="focus-visible:ring-transparent border-none" placeholder="Write a caption..."/>
        {
          imagePreview && (
            <div className='w-full h-64 flex items-center justify-center'>
              <img src={imagePreview} alt="preview_image" className='object-cover h-full w-full rounded-md'/>
            </div>
          )
        }
        <input ref={imgRef } type='file' className='hidden' onChange={fileChangeHandler}/>
        <Button onClick={()=> imgRef.current.click()} className='w-fix mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>Select from computer</Button>
        {
          imagePreview && (
            loading ? (
              <Button>
                <Loader2 className='mr-2 h-2 w-4 animate-spin '/>
                Please wait
              </Button>
            ):(
              <Button onClick={createPostHandler} type='submit' className='w-full '>Post</Button>
            )
          )
        }
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost