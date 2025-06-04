import type { SVGProps } from 'react';

export function PixelTrashIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M2 4H14V6H12V14H4V6H2V4Z" />
      <path d="M6 0H10V2H6V0Z" />
      <path d="M6 6H8V12H6V6Z" />
      <path d="M10 6H12V12H10V6Z" />
    </svg>
  );
}
