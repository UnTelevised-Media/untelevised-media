/* eslint-disable import/prefer-default-export */
'use client';
// Function to get window size
export const getWindowSize = () => {
  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  return { width: 0, height: 0 }; // Default values if window is not defined
};
