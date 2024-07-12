import React from "react";
import { BsChatDots, BsBoxArrowInRight } from 'react-icons/bs';

const Navbar = () => {
  return (
    <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#6a5acd]/50 bg-[#08061417] backdrop-blur-md z-50 px-10">
      <div className="w-full h-full flex flex-row items-center justify-between m-auto px-[10px]">
        
        {/* Left section */}
        <a href="#about-me" className="flex items-center gap-5">
          <BsChatDots size={30}/>
          <span className="font-bold hidden md:block text-gray-300">
            ChatP2P
          </span>
        </a>

        {/* Middle section */}
        <div className="w-[500px] ml-5 h-full flex flex-row items-center justify-between md:mr-20">
          <div className="flex items-center justify-between w-full h-auto border border-[#facc0061] bg-[#2221205e] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200">
            <a href="#about-me" className="cursor-pointer">
              Chat
            </a>
            <a href="#skills" className="cursor-pointer">
              Home
            </a>
            <a href="#projects" className="cursor-pointer">
              Login
            </a>
          </div>
        </div>

        {/* Right section */}
        <a href="#about-me" className="flex items-center gap-5">
          <span className="font-bold hidden md:block text-gray-300">
            LogIn
          </span>
          <BsBoxArrowInRight size={30}/>
        </a>
        
      </div>
    </div>
  );
};

export default Navbar;
