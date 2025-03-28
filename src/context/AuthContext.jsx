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
                return {succes: false, error: error.message}
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
        email = email.toLowerCase();

        const {data, error} = await supabase.auth.resetPasswordForEmail({
            email: email,
        });
    }

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event == "PASSWORD_RECOVERY") {
                const newPassword = prompt("What would you like your new"
                        + " password to be?");
                const { data, error } = await supabase.auth
                        .updateUser({ password: newPassword })
            if (data) console.log("Password updated successfully!")
            if (error) console.log("There was an error updating your "
                    + "password")
            }
        })
    },[])
 


    return(
        <AuthContext.Provider value={{ session , signUpNewUser, signOut, signInUser, sendForgotPasswordEmail }}>{children}</AuthContext.Provider>
    )
};

export const UserAuth = () => {
    return useContext(AuthContext);
}
