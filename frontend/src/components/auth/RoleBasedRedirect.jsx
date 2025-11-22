// src/components/auth/RoleBasedRedirect.jsx
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext"; // Adjust path as needed

const RoleBasedRedirect = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (user) {
            // Check for Admin/Developer
            if (user.role === "admin" || user.role === "developer") {
                navigate("/admin", { replace: true });
                return;
            }
            
            // Check for Agent (handling your nested user.user structure)
            if (user.user && user.user.role === "agent") {
                navigate("/agent", { replace: true });
                return;
            }
            
            // Fallback for any other authenticated user role
            navigate("/dashboard", { replace: true }); 
        } 
        // If 'user' is null, ProtectedRoute handles redirect to /login
    }, [user, navigate]);

    // Render a spinner while checking the user and redirecting
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-[spin_0.6s_linear_infinite] mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
    );
};

export default RoleBasedRedirect;
