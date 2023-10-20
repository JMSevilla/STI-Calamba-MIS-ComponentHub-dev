import { Typography } from "@mui/material";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  disableMarginTop?: boolean;
};
const HomeHeroSection = (props: Props) => {
  return (
    <div className="isolate h-screen bg-white">
      <main>
        <div className="relative px-6 lg:px-8">
          <div
            className={
              props.disableMarginTop
                ? "mx-auto max-w-4xl"
                : "mx-auto max-w-4xl py-32 sm:py-48 lg:py-56"
            }
          >
            {props.children}
          </div>
          {/* <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <svg
  className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
  viewBox="0 0 1155 678"
>
  <defs>
    <linearGradient
      id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
      x1="0"
      x2="1"
      y1=".177"
      y2="474.645"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stopColor="#9089FC">
        <animate
          attributeName="offset"
          values="0; 1; 0"
          dur="5s"
          repeatCount="indefinite"
        />
      </stop>
      <stop offset="100%" stopColor="#FF80B5">
        <animate
          attributeName="offset"
          values="0; 1; 0"
          dur="5s"
          repeatCount="indefinite"
        />
      </stop>
    </linearGradient>
  </defs>
  <path
    fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
    fillOpacity=".3"
    d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
  />
</svg>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default HomeHeroSection;
