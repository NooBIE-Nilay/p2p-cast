"use client";
import { CreateRoom } from "@/components/CreateRoom";
import Navbar from "@/components/Navbar";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Vortex } from "@/components/ui/vortex";
export default function Home() {
  return (
    <div className="dark:bg-black bg-blue-700/90  min-h-screen">
      <Navbar />
      <Vortex
        backgroundColor="transparent"
        rangeY={800}
        particleCount={500}
        baseHue={100}
        className="flex items-center flex-col justify-center px-2 md:px-10  py-4 w-full min-h-screen"
      >
        <div className="mx-auto max-w-lg py-20 text-2xl font-bold tracking-tight md:text-4xl">
          Video Conferencing, Podcast, Meeting & Live Streaming.
          <br />
          Real Time Communication meets
          <PointerHighlight>
            <span>Quality Recording.</span>
          </PointerHighlight>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]">
            Order now
          </button>
          <button className="px-4 py-2  text-white ">Watch trailer</button>
        </div>
      </Vortex>
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
