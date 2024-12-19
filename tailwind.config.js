import { mtConfig } from "@material-tailwind/react";

/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",

    "./src/**/*.{js,ts,jsx,tsx}",

    "./node_modules/@material-tailwind/react/**/*.{js,ts,jsx,tsx}",
  ],
  
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "480px",
        'print': {'raw': 'print'},
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        equalize: {
          "0%, 100%": {
            height: "64px",
          },
          "50%": {
            height: "32px",
          },
        },
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out",
      },
      backgroundColor: {
        'print-white': '#ffffff',
        'print-gray': '#f9fafb',
      }
    },
    
  },
  

  plugins: [mtConfig],
};
