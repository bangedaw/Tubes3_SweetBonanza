export const OCR_ENABLED_STORAGE_KEY = "sweetbonanza.ocrEnabled";

type ChromeStorageLocal = {
  get: (keys: string, callback: (items: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
};

type ChromeRuntime = {
  lastError?: {
    message?: string;
  };
};

type ChromeApi = {
  runtime?: ChromeRuntime;
  storage?: {
    local?: ChromeStorageLocal;
  };
};

function getChromeApi(): ChromeApi | undefined {
  return (globalThis as { chrome?: ChromeApi }).chrome;
}

export function readOcrEnabled(): Promise<boolean> {
  const chromeApi = getChromeApi();
  const storage = chromeApi?.storage?.local;

  if (!storage) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    storage.get(OCR_ENABLED_STORAGE_KEY, (items) => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      resolve(items[OCR_ENABLED_STORAGE_KEY] === true);
    });
  });
}

export function writeOcrEnabled(enabled: boolean): Promise<void> {
  const chromeApi = getChromeApi();
  const storage = chromeApi?.storage?.local;

  if (!storage) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    storage.set({ [OCR_ENABLED_STORAGE_KEY]: enabled }, () => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      resolve();
    });
  });
}
