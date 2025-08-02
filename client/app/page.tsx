"use client";
import Navbar from "@/components/Navbar";
import { Highlight } from "@/components/ui/hero-highlight";
import { NavbarButton } from "@/components/ui/resizable-navbar";
import { Vortex } from "@/components/ui/vortex";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/room");
  };
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
          className=" text-3xl md:text-6xl lg:text-8xl max-w-2xl md:max-w-2xl lg:max-w-6xl leading-relaxed lg:leading-snug text-center mx-auto mt-40  font-bold text-white/90
          "
        >
          Why Just Talk When You Can Have
          <span className="mx-2">
            <Highlight>Charcha</Highlight>
          </span>
          ?
          <div className=" text-xl md:text-2xl lg:text-3xl text-normal text-wrap max-w-4xl mx-auto text-white/75 mt-8">
            <span className="text-blue-500 ">Charcha &nbsp;</span>
            is your all-in-one space for meetings, podcasts, and live shows —
            with professional level Audio & Video recording built-in.
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <NavbarButton variant="primary" onClick={handleClick}>
            Start Charcha
          </NavbarButton>
          <Link
            href={"#demo"}
            className="px-4 py-2 rounded-md button text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-transparent shadow-none dark:text-white"
          >
            Watch demo
          </Link>
        </div>
      </Vortex>
    </div>
  );
}
