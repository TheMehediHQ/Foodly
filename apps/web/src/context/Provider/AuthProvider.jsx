import React, { createContext, useEffect, useState, useCallback } from "react";
import app from "../firebase/firebase.config";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import axiosSecure from "../../api/axios";

export const AuthContext = createContext(null);

const auth = getAuth(app);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const provider = new GoogleAuthProvider();

  const fetchRole = useCallback(async (currentUser) => {
    if (!currentUser) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    try {
      const res = await axiosSecure.get("/users/me");
      if (res.data?.ok && res.data?.data?.role) {
        setRole(res.data.data.role);
      } else {
        setRole("user");
      }
    } catch {
      // Default to user role if unable to fetch
      setRole("user");
    } finally {
      setRoleLoading(false);
    }
  }, []);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const createUserWithLoginGoogle = () => {
    return signInWithPopup(auth, provider);
  };

  const loginUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const profile = (updateData) => {
    return updateProfile(auth.currentUser, updateData);
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    try {
      await axiosSecure.post("/logout");
    } catch {
      // silent
    }
    setUser(null);
    setRole(null);
    setRoleLoading(false);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchRole(currentUser);
      } else {
        setRole(null);
        setRoleLoading(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchRole]);

  const authData = {
    user,
    setUser,
    role,
    isAdmin: role === "admin",
    roleLoading,
    refetchRole: () => fetchRole(user),
    createUser,
    logout,
    loginUser,
    loading: loading || roleLoading,
    setLoading,
    profile,
    createUserWithLoginGoogle,
  };

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};

// Exporting the useAuth hook to be used in other components
export const useAuth = () => {
  return React.useContext(AuthContext);
};

export default AuthProvider;
