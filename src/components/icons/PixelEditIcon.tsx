import type { SVGProps } from 'react';

export function PixelEditIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M2 10L0 12L0 16H4L6 14L13 7L9 3L2 10Z" />
      <path d="M10 2L14 6L15 5L11 1L10 2Z" />
    </svg>
  );
}
