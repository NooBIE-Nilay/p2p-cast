"use client";
import Navbar from "@/components/Navbar";
import { Vortex } from "@/components/ui/vortex";
export default function Home() {
  return (
    <div className="dark:bg-black bg-[#89CFF0]  min-h-screen">
      <Navbar />
      <Vortex
        backgroundColor="transparent"
        rangeY={800}
        particleCount={500}
        baseHue={100}
        className="flex items-center flex-col  px-2 md:px-10   w-full min-h-screen"
      >
        <div
          className=" text-2xl md:text-4xl lg:text-6xl max-w-2xl md:max-w-2xl lg:max-w-6xl leading-relaxed lg:leading-snug text-center mx-auto mt-40  font-bold text-white/90
          "
        >
          Why Just Talk When You Can Have
          <span className="text-blue-600 font-normal ml-2  ">“</span>
          Charcha
          <span className="text-blue-600 font-normal mr-2 ">“</span>?
          <span className="block text-4xl mt-4 text-white/">
            Video Meetings, Podcasts, and Live Streams — All in One.
          </span>
          <div className="block text-2xl text-normal text-wrap max-w-4xl mx-auto text-white/75 mt-8">
            <span className="text-blue-500 ">Charcha &nbsp;</span>
            is your all-in-one space for meetings, podcasts, and live shows —
            with professional level Audio & Video recording built-in.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]">
            Start Charcha
          </button>
          <button className="px-4 py-2  text-white ">Watch demo</button>
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
