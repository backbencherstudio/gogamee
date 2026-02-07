import React, { Suspense } from "react";
import DateManagement from "./components/DateManagement";

export default function ManageDatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <DateManagement />
      </Suspense>
    </div>
  );
}
