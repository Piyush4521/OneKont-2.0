"use client";

import dynamic from "next/dynamic";

// This is where we safely import the MapClient with SSR disabled
const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-200 dark:bg-slate-900 animate-pulse rounded-3xl flex items-center justify-center text-slate-600 dark:text-slate-400">
      Loading Map Data...
    </div>
  ),
});

type MapWrapperProps = {
  className?: string;
};

export default function MapWrapper({ className = "h-[80vh]" }: MapWrapperProps) {
  return (
    <div className={className}>
      <MapClient className="h-full" />
    </div>
  );
}
