"use client";
import { CreateRoom } from "@/components/CreateRoom";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  SignOutButton,
  SignUp,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, getToken } = useAuth();
  useEffect(() => {
    const checkClerk = async () => {
      const token = await getToken();
      console.log("Token: ", token);
      const res = await fetch("http://localhost:8080/encrypted", {
        headers: { Authorization: `Bearer ${token}` }, // Include the session token as a Bearer token in the Authorization header
      }).then((res) => res.json());
      const data = await res;
      console.log(data);
    };
    checkClerk();
  }, [isSignedIn, getToken]);

  return (
    <div className="h-[100vh] flex items-center justify-center">
      <SignedOut>
        <div className="text-center  bg-slate-700/90 m-2 p-2 rounded">
          <SignInButton></SignInButton>
        </div>
        <div className="text-center  bg-slate-700/90 m-2 p-2 rounded">
          <SignUpButton></SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton></UserButton>
        <SignOutButton></SignOutButton>
        <CreateRoom />
      </SignedIn>
    </div>
  );
}
