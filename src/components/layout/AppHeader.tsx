"use client";

export function AppHeader() {
  return (
    <header className="bg-header-bg text-header-fg p-3 shadow-md flex items-center pixel-border border-b-4 border-foreground">
      {/* Custom Pixel Art Style Logo */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 8 8" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="mr-3 text-header-fg" 
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
        aria-label="Pixel art logo"
      >
        <rect x="3" y="0" width="2" height="1" fill="currentColor"/>
        <rect x="2" y="1" width="1" height="1" fill="currentColor"/>
        <rect x="5" y="1" width="1" height="1" fill="currentColor"/>
        <rect x="1" y="2" width="1" height="1" fill="currentColor"/>
        <rect x="3" y="2" width="2" height="1" fill="currentColor"/>
        <rect x="6" y="2" width="1" height="1" fill="currentColor"/>
        <rect x="0" y="3" width="1" height="2" fill="currentColor"/>
        <rect x="2" y="3" width="1" height="1" fill="currentColor"/>
        <rect x="5" y="3" width="1" height="1" fill="currentColor"/>
        <rect x="7" y="3" width="1" height="2" fill="currentColor"/>
        <rect x="1" y="5" width="1" height="1" fill="currentColor"/>
        <rect x="3"  y="5" width="2" height="1" fill="currentColor"/>
        <rect x="6" y="5" width="1" height="1" fill="currentColor"/>
        <rect x="2" y="6" width="1" height="1" fill="currentColor"/>
        <rect x="5" y="6" width="1" height="1" fill="currentColor"/>
        <rect x="3" y="7" width="2" height="1" fill="currentColor"/>
      </svg>
      <h1 className="text-2xl font-headline tracking-wider uppercase">
        Consultas & Traductor
      </h1>
    </header>
  );
}
