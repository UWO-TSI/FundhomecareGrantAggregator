import { createContext, useEffect, useState, useContext  } from "react";
import supabase from "../supabase-client";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const[session, setSession] = useState(undefined);

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
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })

            if (error){
                console.error("sign in error ocurred: ", error);
                return {success: false, error: error.message}
            }
            console.log("sign-in success: ", data);
            return { success: true, data };
        } catch(error) {
            console.error("an error occurred: ", error)
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) =>{
            setSession(session);
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })
    },[])

    // Signout
    const signOut = () => {
        const {error} = supabase.auth.signOut();
        if (error) {
            console.error("there was an error ", error);
        }
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

    // Update password
    const updatePassword = async ( newPassword, token ) =>{
        try {
            const {data, error} = await supabase.auth.updateUser({
                password: newPassword,
                token: token,
                type: 'recovery',
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
        <AuthContext.Provider value={{ session , signUpNewUser, signOut, signInUser, sendForgotPasswordEmail, updatePassword }}>{children}</AuthContext.Provider>
    )
};

export const UserAuth = () => {
    return useContext(AuthContext);
}
