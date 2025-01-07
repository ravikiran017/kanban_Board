import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { firestore } from "./firebase";

// Firebase Registration & Home Screen
const Home = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('home');
  const [userName, setUserName] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login page after logout
    } catch (error: any) {
      toast.error("Error logging out:", error.message);
    }
  };


  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        // Try fetching user name from Firestore (the name field in users collection)
        const userRef = doc(firestore, "users", user.uid); // Fetch user document using uid
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // Set user name from Firestore
          setUserName(userDoc.data()?.name || "User"); // Assuming 'name' field in Firestore
        } else {
          // Fallback to Firebase Authentication displayName if no Firestore data
          setUserName(user.displayName || "User");
        }
      }
    };

    fetchUserName();
  }, [auth.currentUser]); // Re-run effect when the current user changes

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("home");
    } else if (location.pathname === "/addTask") {
      setActiveTab("addTask");
    } else if (location.pathname === "/editTask") {
      setActiveTab("editTask");
    }
  }, [location.pathname]);

  return (
    <div className="bg-[#282c34] p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        {/* Display user name */}
        <p className="text-white font-bold py-2 px-1"
        style={{fontSize:"30px"}}
        >
          Kanban Board</p>
      </div>
      <div className="flex space-x-3">
        <Link to="/home">
          <p
            className={`cursor-pointer px-2 py-2 rounded ${
              activeTab === 'home' ? 'bg-gray-200 text-gray-700' : 'text-gray-200 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </p>
        </Link>
        <Link to="/addtask">
          <p
            className={`cursor-pointer px-2 py-2 rounded ${
              activeTab === 'addTask' ? 'bg-gray-200 text-gray-700' : 'text-gray-200 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('addTask')}
          >
            Add Task
          </p>
        </Link>
        <Link to="/task">
          <p
            className={`cursor-pointer px-2 py-2 rounded ${
              activeTab === 'task' ? 'bg-gray-200 text-gray-700' : 'text-gray-200 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('task')}
          >
            Task
          </p>
        </Link>
        <p className="text-white font-bold py-2  px-2 mr-5"
        >{userName}</p>
        <button
          className="bg-red-500 text-white font-semibold px-1 rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
