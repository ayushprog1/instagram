import {setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useGetUserprofile = (userId) => {
    const dispatch = useDispatch();
    //const [userProfile , setUserProfile] = useState(null);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/${userId}/profile`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.User));
                }

            } catch (error) {
                console.log(error);
            }
        }
        fetchUserProfile();
    }, [userId]);
};

export default useGetUserprofile;