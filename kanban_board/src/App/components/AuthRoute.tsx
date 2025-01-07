import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface IAuthRouteProps {
    children: React.ReactNode;
}

const AuthRoute: React.FunctionComponent<IAuthRouteProps> = (props) => {
    const { children } = props;
    const auth = getAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoading(false); // If user is logged in, stop loading and render children
            } else {
                setLoading(false);
                navigate("/login"); // Redirect to login if not authenticated
            }
        });
        return () => unsubscribe(); // Clean up listener on unmount
    }, [auth, navigate]);

    if (loading) return <p>Loading...</p>; // Show loading state while checking auth

    return <div>{children}</div>; // Show children if user is authenticated
};

export default AuthRoute;
