import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const Loading = ({ text = 'Loading...', fullScreen = false }) => {
  const loadingContent = (
    <div className="flex flex-col items-center justify-center p-4">
      <AiOutlineLoading3Quarters className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="mt-2 text-sm text-gray-500">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {loadingContent}
      </div>
    );
  }

  return loadingContent;
};

export default Loading; 