import React from 'react';

const ModalWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="h-screen px-1 pb-3">
    <div className="relative h-full overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-md">
      {children}
    </div>
  </div>
);

export default ModalWrapper;
