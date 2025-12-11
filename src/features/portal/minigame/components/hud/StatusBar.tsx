import React from "react";
import { Timer } from "../hud/Timer";
import { Lives } from "../hud/Lives";
import giantBalls from "public/world/portal/images/GiantRedChristmasOrnament.webp";

export const StatusBar: React.FC = () => {
    return (
        <>
            <div className="flex flex-row w-full flex-wrap items-center justify-center">
               <div className="flex flex-row w-full justify-between pt-6 px-6 bg-[#265c42] rounded-t-[2.5rem] pb-4">
                 <div className="flex flex-col gap-4">
                   <Timer />
                   <Lives />
                 </div>
                 <img className="w-[2rem] md:w-[3rem] h-full" src={giantBalls} />
               </div>
             </div>
        </>
    )
}