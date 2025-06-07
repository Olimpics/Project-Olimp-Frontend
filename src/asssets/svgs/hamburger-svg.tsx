import * as React from "react";

const HamburgerSvg = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <button>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="emoji"
      fill="#000"
      viewBox="0 0 72 72"
      {...props}
    >
      <g id="SVGRepo_iconCarrier">
        <g
          id="line"
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          strokeWidth="2"
        >
          <path d="M16 26h40M16 36h40M16 46h40"></path>
        </g>
      </g>
    </svg>
  </button>
);

export default HamburgerSvg;
