import deploymentConfig from '../deployment-runtime/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...deploymentConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./static-websites/components/**/*.{js,ts,jsx,tsx}",
  ]
};
