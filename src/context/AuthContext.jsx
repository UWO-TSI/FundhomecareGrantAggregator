import { createContext, useEffect, useState, useContext  } from "react";
import supabase from "../supabase-client";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const[session, setSession] = useState(undefined);
    const [userRole, setUserRole] = useState(null);

    // Function to fetch and set user role based on user ID
    const fetchAndSetUserRole = async (userId) => {
        if (!userId) {
            setUserRole(null);
            return;
        }
        try {
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('role')
                .eq('user_id', userId)
                .single();

            if (userError) {
                console.error("Error fetching user role for session: ", userError);
                setUserRole(null); // Or handle error as appropriate
                return;
            }
            if (userData) {
                setUserRole(userData.role);
            } else {
                console.warn("User role not found for active session.");
                setUserRole(null);
            }
        } catch (e) {
            console.error("Exception fetching user role for session: ", e);
            setUserRole(null);
        }
    };

    // Sign up
    const signUpNewUser = async ( email, password ) =>{
        email = email.toLowerCase();

        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error){
            console.error("There was a problem creating your account", error);
            return { success: false, error };
        }
            return { success: true, data };
    };

    // Sign in
    const signInUser = async ( email, password ) => {
        console.log("[AuthContext] signInUser: Attempting sign-in for", email);
        try {
            console.log("[AuthContext] signInUser: Calling supabase.auth.signInWithPassword");
            const {data: authData, error: authError} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            console.log("[AuthContext] signInUser: supabase.auth.signInWithPassword completed");

            if (authError){
                console.error("[AuthContext] signInUser: signInWithPassword error: ", authError);
                setUserRole(null); 
                return {success: false, error: authError.message}
            }
            console.log("[AuthContext] signInUser: signInWithPassword success. User data: ", authData.user);

            if (authData && authData.user) {
                console.log("[AuthContext] signInUser: Attempting to fetch role for user ID:", authData.user.id);
                const { data: userData, error: userError } = await supabase
                    .from('User')
                    .select('role')
                    .eq('user_id', authData.user.id)
                    .single();
                console.log("[AuthContext] signInUser: Fetch role completed.");

                if (userError) {
                    console.error("[AuthContext] signInUser: Error fetching user role. Supabase error details: ", userError);
                    console.log("[AuthContext] signInUser: Attempting signOut due to role fetch error.");
                    await supabase.auth.signOut(); 
                    console.log("[AuthContext] signInUser: signOut completed after role fetch error.");
                    setUserRole(null); 
                    return { success: false, error: "Failed to retrieve user role. Check console for details." };
                }

                if (userData) {
                    console.log("[AuthContext] signInUser: Role fetched successfully: ", userData.role);
                    setUserRole(userData.role); 
                    return { success: true, data: authData, role: userData.role };
                } else {
                    console.error("[AuthContext] signInUser: User role not found in User table.");
                    console.log("[AuthContext] signInUser: Attempting signOut due to role not found.");
                    await supabase.auth.signOut();
                    console.log("[AuthContext] signInUser: signOut completed after role not found.");
                    setUserRole(null); 
                    return { success: false, error: "User role not found." };
                }
            }
            console.warn("[AuthContext] signInUser: authData or authData.user is null after successful signInWithPassword.");
            setUserRole(null); 
            return { success: false, error: "User authentication failed (no user object)." };
        } catch(error) {
            console.error("[AuthContext] signInUser: Unhandled exception in signInUser: ", error);
            setUserRole(null); 
            return { success: false, error: "An unexpected error occurred during sign in." };
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session: currentSession } }) =>{
            setSession(currentSession);
            if (!currentSession || !currentSession.user) {
                setUserRole(null);
            } 
        })

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            setSession(newSession);
             if (!newSession || !newSession.user) {
                setUserRole(null);
            } 
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    },[])

    // Signout
    const signOut = async () => {
        const {error} = await supabase.auth.signOut();
        if (error) {
            console.error("there was an error ", error);
        }
        setUserRole(null);
    }

    // Forgot password
    const sendForgotPasswordEmail = async ( email ) =>{
        try {
            email = email.toLowerCase();

            const {data, error} = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:5173/update-password',
            });

            if (error){
                console.error("forgot password error ocurred: ", error);
                return {success: false, error: error.message}
            }
            console.log("forgot password success: ", data);
            return { success: true };
        } catch(error) {
            console.error("an error occurred: ", error)
        }

    }

    // OTP Sign In
    const otpSignIn = async (givenToken) =>{
        try {
            const {data, error} = await supabase.auth.verifyOtp({
                token_hash: givenToken,
                type: 'email',
            });

            if (error) {
                console.error("Error verifying OTP: ", error);
                return {success: false, error: error.message}
            }
            console.log("OTP success: ", data);
            return { success: true };
        } catch(error) {
            console.error("An error occurred: ", error)
        }
    }


    // Update password
    const updatePassword = async ( newPassword, token, userEmail ) =>{
        try {
            const {data, error} = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                console.error("Error updating password: ", error);
                return {success: false, error: error.message}
            }
            console.log("Update password success: ", data);
            return { success: true };
        } catch(error) {
            console.error("An error occurred: ", error)
        }
    }

    return(
        <AuthContext.Provider value={{ session, userRole, signUpNewUser, signOut, signInUser, sendForgotPasswordEmail, otpSignIn, updatePassword }}>{children}</AuthContext.Provider>
    )
};

export const UserAuth = () => {
    return useContext(AuthContext);
}
