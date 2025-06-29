"use client";
import { CreateRoom } from "@/components/CreateRoom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
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
