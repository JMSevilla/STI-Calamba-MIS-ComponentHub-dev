import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Path } from "../router/path";

function isMobileAgent(){
    const mobileUserAgents = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i,
    ];
    return mobileUserAgents.some((mobileUserAgents) => 
        navigator.userAgent.match(mobileUserAgents)
    );
}

const MobilePrevention : React.FC = () => {
    const [isMobile, setIsMobile] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        if(isMobileAgent()) {
            return 
        } else {
            return navigate(Path.login.path)
        }
    }, [isMobile])
    return (
        <>
            <Typography variant='button'>
                The system is not available on mobile device
            </Typography>
        </>
    )
}

export default MobilePrevention