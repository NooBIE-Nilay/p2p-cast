"use client";
import { CreateRoom } from "@/components/CreateRoom";
import Navbar from "@/components/Navbar";
export default function Home() {
  return (
    <div>
      <Navbar />

      {/* <SignedOut>
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
        </SignedIn> */}
    </div>
  );
}
