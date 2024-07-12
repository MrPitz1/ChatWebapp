import React from "react";

const Hero = () => {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden" id="about-me">
      <video
        autoPlay
        muted
        loop
        className="absolute object-cover w-full h-full"
      >
        <source src="/blackhole.webm" type="video/webm" />
        {/* Provide fallback content for browsers that do not support the <video> element */}
        Your browser does not support the video tag.
      </video>

      <div className="relative flex flex-col justify-center items-center h-full px-20">
        <div className="w-full mx-auto text-left text-white z-20
                    lg:max-w-[60%] xl:max-w-[60%]">
          <div className="text-4xl font-bold">
            <span>
              Providing a
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-600">
                {" "}
                Peer to Peer{" "}
              </span>
              chat application experience
            </span>
          </div>

          <p className="text-lg text-gray-400 my-5">
            Implementing a Peer to Peer Chat application with group chats, anonym chats, or account chats bla bla
          </p>

          <a href="#" className="py-2 px-6 bg-orange-400 hover:bg-orange-600 text-black rounded-lg inline-block">
            Chat Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
