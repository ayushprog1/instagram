import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Signup from './components/signup'
import Login from './components/login'
import Mainlayout from './components/Mainlayout'
import Home from './components/home'
import Profile from './components/profile'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element:<ProtectedRoutes><Mainlayout/></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element:<ProtectedRoutes><Home /></ProtectedRoutes> 
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes><Profile /></ProtectedRoutes> 
      },
      {
        path: '/account/edit',
        element:<ProtectedRoutes><EditProfile /></ProtectedRoutes> 
      },
      {
        path: '/chat',
        element:<ProtectedRoutes> <ChatPage /></ProtectedRoutes> 
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  }
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  
  //console.log('frontend hi');
  useEffect(() => {
    if (user) {
      const socketio = io(process.env.URL, {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      console.log("frontend ke taraf");
      dispatch(setSocket(socketio));

      socketio.on('connect', () => {
        console.log('Socket connected:', socketio.id);
    });

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);
  

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
