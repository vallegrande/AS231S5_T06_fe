import type { SVGProps } from 'react';

export function PixelRestoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="currentColor" 
      stroke="none" 
      {...props}
    >
      {/* Arrowhead */}
      <path d="M4 4H6V0H4V4Z" />
      <path d="M2 6H4V4H2V6Z" />
      <path d="M0 8H2V6H0V8Z" />
      {/* Arc Path */}
      <path d="M2 8H4V10H6V12H8V14H12V12H10V10H8V8H6V6H4V8H2Z" />
    </svg>
  );
}
