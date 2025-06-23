"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = async () =>{
  const router = useRouter();
  useEffect(()=>{
    router.push("/create");
  },[router]);
  return <></>
}
export default Home;