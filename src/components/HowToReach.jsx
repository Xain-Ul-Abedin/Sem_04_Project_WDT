import React, { useRef } from "react";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ImageClipBox = ({ src, clipClass }) => (
    <div className={clipClass}>
        <img src={src} className="h-full w-full object-cover" />
    </div>
);

const HowToReach = () => {
    const parrotRef = useRef(null);

    useGSAP(() => {
        gsap.to(parrotRef.current, {
            y: -20,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
        });
    }, []);

    return (
        <div id="how-to-reach" className="my-20 min-h-96 w-screen px-10">
            <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
                <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-10 px-4 md:px-10 relative z-10">
                    {/* Left Side: Google Map */}
                    <div className="w-full lg:w-1/2 h-80 lg:h-[500px] rounded-2xl overflow-hidden border border-white/20">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3399.946368297754!2d74.32172777626966!3d31.553199645218776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391904b0870f7233%3A0xc6cb51197486e969!2sLahore%20Zoo!5e0!3m2!1sen!2s!4v1707923456789!5m2!1sen!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>

                    {/* Right Side: Information */}
                    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <p className="mb-6 font-general text-[10px] uppercase text-blue-50">
                            Plan Your Visit
                        </p>

                        <AnimatedTitle
                            title="How To <br /> Reach Us"
                            containerClass="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !text-white !leading-[.9] mb-10"
                        />

                        <div className="space-y-6 font-circular-web text-lg text-blue-50 opacity-80">
                            <div>
                                <h4 className="text-white font-bold mb-1 text-xl">Address</h4>
                                <p>
                                    92 Shahrah-e-Quaid-e-Azam, <br /> The Mall, Lahore, Punjab,
                                    Pakistan
                                </p>
                            </div>

                            <div>
                                <h4 className="text-blue-50 font-bold mb-1 text-xl">Timings</h4>
                                <p>
                                    Open 7 Days a Week <br />{" "}
                                    <span className="text-yellow-300">9:00 AM – Sunset</span>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-blue-50 font-bold mb-1 text-xl">Contact</h4>
                                <p>
                                    Phone: <span className="text-green-300">0423-6314684</span>
                                </p>
                                <p>
                                    Email:{" "}
                                    <span className="text-yellow-300">
                                        lahorezoolahore@gmail.com
                                    </span>
                                </p>
                            </div>
                        </div>

                        <Button
                            title="Get Directions"
                            containerClass="mt-10 cursor-pointer bg-white"
                            accentColor="#EDFF66"
                        />
                    </div>
                </div>

                {/* Parrot Image */}
                <div className="absolute -bottom-10 -right-10 hidden md:block z-20 pointer-events-none">
                    <img
                        ref={parrotRef}
                        src="/img/Parrot.png"
                        alt="Parrot"
                        className="w-64 lg:w-80"
                    />
                </div>
            </div>
        </div>
    );
};

export default HowToReach;
