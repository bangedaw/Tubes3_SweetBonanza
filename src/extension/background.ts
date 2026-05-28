// declare const chrome: any; 
// cara install : 
// 1. npm init -y
// 2. npm install -D typescript vite @types/chrome
// 3. npx tsc --init
// Cara build file dist
// npm run build
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});