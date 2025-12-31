"use client";

import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    globalThis.location?.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <WifiOff className="size-8 text-gray-500" />
      </div>
      <h1 className="mt-6 font-semibold text-2xl">You&apos;re offline</h1>
      <p className="mt-2 text-center text-gray-500">
        Please check your internet connection and try again.
      </p>
      <button
        type="button"
        onClick={handleRetry}
        className="mt-6 inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-white dark:bg-gray-100 dark:text-gray-900"
      >
        <RefreshCw className="mr-2 size-4" />
        Retry
      </button>
    </div>
  );
}
