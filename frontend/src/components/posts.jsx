import React from 'react'
import Post from './post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const {posts} = useSelector(store=> store.post); 
  return (
    <div>
        {
            //[1,2,3,4].map((item,index) => <Post key={index}/>)
          posts.map((post)=><Post key={post._id} post={post}/>)
        }
    </div>
  )
}

export default Posts