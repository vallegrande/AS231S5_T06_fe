import type { SVGProps } from 'react';

export function PixelTranslateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      stroke="none"
      {...props}
    >
      {/* 'A' character */}
      <path d="M3 14H5V10H7V14H9V8H7V9H5V8H3V14Z" />
      <path d="M5 6H7V7H5V6Z" />
      {/* Arrow */}
      <path d="M10 9H14V7L17 10L14 13V11H10V9Z" />
      {/* 'B' character (like a simple Kanji character) */}
      <path d="M11 3H13V5H11V3Z" />
      <path d="M15 3H17V5H15V3Z" />
      <path d="M11 6H17V8H11V6Z" />
      <path d="M11 13H13V15H11V13Z" />
      <path d="M15 13H17V15H15V13Z" />
    </svg>
  );
}
