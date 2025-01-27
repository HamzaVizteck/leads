import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { auth } from "../config/firebaseConfig"; // Import your Firebase auth
import { updateProfile, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Import your Firestore

interface AuthContextType {
  currentUser: any; // Replace 'any' with the actual user type if available
  setCurrentUser: (user: any) => void; // Adjust the type as needed
}

const AuthContext = createContext<AuthContextType | null>(null); // Set initial context to null

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null); // Adjust type as needed
  const [userName, setUserName] = useState<string>("User"); // Added userName state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user); // Set the current user when authentication state changes
      if (user) {
        handleUserCreation(user); // Call handleUserCreation when user is logged in
      }
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Fetch leads or perform actions that require the user to be logged in
    } else {
      // Handle the case where the user is not logged in
    }
  }, [currentUser]);

  console.log("Current User:", currentUser);

  const handleUserCreation = async (user: User) => {
    // Assuming you have the user's name from your registration form
    setUserName(user.displayName || "User"); // Replace with actual user name

    // Update the user's profile
    await updateProfile(user, {
      displayName: userName,
    });

    // Now you can fetch the user data from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserName(userData.name || "User"); // Set user name from Firestore
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
