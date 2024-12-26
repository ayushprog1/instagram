import React from 'react'
import Feed from './feed'
import { Outlet } from 'react-router-dom'
import Rightsidebar from './Rightsidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUser from '@/hooks/useGetSuggestedUser'

const Home = () => {
  useGetAllPost();
  useGetSuggestedUser();
  return (
    <div className='flex'>
      <div className='flex-grow'>
        <Feed/>
        <Outlet/>
      </div>
      <Rightsidebar/>
    </div>
  )
}

export default Home
