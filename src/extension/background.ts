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

type FetchImageRequest = {
  type: "SWEETBONANZA_FETCH_IMAGE";
  url: string;
};

type CaptureVisibleTabRequest = {
  type: "SWEETBONANZA_CAPTURE_VISIBLE_TAB";
};

type RuntimeResponse =
  | {
      ok: true;
      dataUrl: string;
    }
  | {
      ok: false;
      error: string;
    };

function isRuntimeRequest(message: unknown): message is FetchImageRequest | CaptureVisibleTabRequest {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const type = (message as { type?: unknown }).type;
  if (type === "SWEETBONANZA_CAPTURE_VISIBLE_TAB") {
    return true;
  }

  return (
    type === "SWEETBONANZA_FETCH_IMAGE" &&
    typeof (message as FetchImageRequest).url === "string"
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    credentials: "omit",
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = await response.arrayBuffer();
  return `data:${contentType};base64,${arrayBufferToBase64(buffer)}`;
}

function captureVisibleTab(sender: chrome.runtime.MessageSender): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(sender.tab?.windowId, { format: "png" }, (dataUrl) => {
      const errorMessage = chrome.runtime.lastError?.message;
      if (errorMessage || !dataUrl) {
        reject(new Error(errorMessage || "Screenshot tab aktif tidak tersedia."));
        return;
      }

      resolve(dataUrl);
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse: (response: RuntimeResponse) => void) => {
  if (!isRuntimeRequest(message)) {
    return false;
  }

  const responsePromise =
    message.type === "SWEETBONANZA_FETCH_IMAGE"
      ? fetchImageAsDataUrl(message.url)
      : captureVisibleTab(sender);

  responsePromise
    .then((dataUrl) => sendResponse({ ok: true, dataUrl }))
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Gambar tidak dapat diambil.";
      sendResponse({ ok: false, error: message });
    });

  return true;
});
