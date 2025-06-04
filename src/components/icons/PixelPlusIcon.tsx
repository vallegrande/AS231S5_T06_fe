import type { SVGProps } from 'react';

export function PixelPlusIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M6 0H10V6H16V10H10V16H6V10H0V6H6V0Z" />
    </svg>
  );
}
