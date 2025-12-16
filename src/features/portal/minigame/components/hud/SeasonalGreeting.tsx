import React, { useEffect } from "react";
import { SNOW } from "../../Constants";

export const SeasonalGreeting: React.FC = () => {
    useEffect(() => { 
        SNOW(); 
    }, []);
    
    return (
        <>
            <div className="fixed inset-0 z-50">
                <div className="flex flex-col w-full h-screen items-center justify-center backdrop-blur-sm">
                    <div className="border-[1rem] md:border-[1.5rem] border-[#265c42] bg-[#265c42] rounded-[2rem] ">
                        <div className="p-3 rounded-[2rem]"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
                            }}
                        >
                            <div className="flex flex-col md:flex-row gap-[2rem] md:gap-[3rem] items-center justify-center text-[4rem] md:text-[12rem] text-[#265c42] bg-[#a22633] p-[3rem] md:p-[6rem] rounded-[2rem] [-webkit-text-stroke:2px_#ffffff]">
                                <span>
                                    HAPPY
                                </span>
                                <span>
                                    HOLIDAYS!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}