import { setSuggestedUser } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetSuggestedUser = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchsuggestedUsers = async () => {
            try {
                const res = await axios.get('https://instagram-zo7q.onrender.com/api/v1/user/suggested', { withCredentials: true });
                if (res.data.success) {
                    //console.log(res.data);
                    dispatch(setSuggestedUser(res.data.users));
                }

            } catch (error) {
                console.log(error);
            }
        }
        fetchsuggestedUsers();
    }, []);
};

export default useGetSuggestedUser;