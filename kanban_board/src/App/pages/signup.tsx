import { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';  // Import Firestore methods
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { firestore } from '../components/firebase';

const Signup = () => {
  const auth = getAuth();
  const db = firestore;  // Use the Firestore instance
  const navigate = useNavigate();

  const [authing, setAuthing] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Function to handle sign-up with Google
  const signUpWithGoogle = async () => {
    setAuthing(true);

    signInWithPopup(auth, new GoogleAuthProvider())
      .then(async (response) => {
        const user = response.user;
        const userData = {
          uid: user.uid,
          name: user.displayName || name,  // Use Google name or input name
          email: user.email,
          role: "contributor",  // Assigning default role
          createdAt: new Date(),
        };

        // Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), userData)
          .then(() => {
            navigate('/home');
          })
          .catch(() => {
            setError('Failed to store user data.');
          });
      })
      .catch(error => {
        toast.error(error);
        setAuthing(false);
      });
  };

  // Function to handle sign-up with email and password
  const signUpWithEmail = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setAuthing(true);
    setError('');

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (response) => {
        const user = response.user;
        const userData = {
          uid: user.uid,
          name: name,
          email: user.email,
          role: "contributor",  // Assigning default role
          createdAt: new Date(),
        };

        // Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), userData)
          .then(() => {
            navigate('/home');
          })
          .catch(error => {
            toast.error('Error storing user data in Firestore:', error);
            setError('Failed to store user data.');
          });
      })
      .catch(error => {
        toast.error(error);
        setError(error.message);
        setAuthing(false);
      });
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-full bg-[#282c34] flex items-center justify-center"></div>

      <div className="w-full md:w-1/2 h-full bg-[#1a1a1a] flex flex-col p-5 justify-center">
        <div className="w-full flex flex-col max-w-[450px] mx-auto">
          <div className="w-full flex flex-col mb-4 text-white text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">Sign Up</h3>
            <p className="mb-1">Welcome! Please enter your information below to begin.</p>
          </div>

          <div className="w-full flex flex-col">
            <input
              type="text"
              placeholder="User Name"
              className="w-full text-white py-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full text-white py-2 mb-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full text-white py-2 mb-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Re-Enter Password"
              className="w-full text-white py-2 mb-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="w-full flex flex-col mb-1">
            <button
              onClick={signUpWithEmail}
              disabled={authing}
              className="w-full bg-transparent border border-white text-white my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer"
            >
              Sign Up With Email and Password
            </button>
          </div>

          <div className="w-full flex items-center justify-center relative py-2">
            <div className="w-full h-[1px] bg-gray-500"></div>
            <p className="text-lg absolute text-gray-500 bg-[#1a1a1a] px-2">OR</p>
          </div>

          <button
            onClick={signUpWithGoogle}
            disabled={authing}
            className="w-full bg-white text-black font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer mt-1"
          >
            Sign Up With Google
          </button>
        </div>

        <div className="w-full flex items-center justify-center mt-2">
          <p className="text-sm font-normal text-gray-400">
            Already have an account?{' '}
            <span className="font-semibold text-white cursor-pointer underline">
              <Link to="/login">Login</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
