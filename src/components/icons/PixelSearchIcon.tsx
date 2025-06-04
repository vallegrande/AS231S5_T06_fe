import type { SVGProps } from 'react';

export function PixelSearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="square"
      {...props}
    >
      {/* Circle part */}
      <path d="M6 2H10V3H12V4H13V5H14V7H13V8H12V9H10V10H8V9H6V8H5V7H4V5H5V4H6V2Z" fill="currentColor" stroke="none" />
      {/* Handle part */}
      <path d="M12 11H14V12H15V14H16V16H15V15H14V13H12V11Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
