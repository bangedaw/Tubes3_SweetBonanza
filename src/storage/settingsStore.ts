export const OCR_ENABLED_STORAGE_KEY = "sweetbonanza.ocrEnabled";
export const BLUR_ENABLED_STORAGE_KEY = "sweetbonanza.blurEnabled";

type ChromeStorageLocal = {
  get: (keys: string, callback: (items: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
};

type ChromeStorageChange = {
  oldValue?: unknown;
  newValue?: unknown;
};

type ChromeStorageChangedListener = (
  changes: Record<string, ChromeStorageChange>,
  areaName: string
) => void;

type ChromeStorageOnChanged = {
  addListener: (callback: ChromeStorageChangedListener) => void;
  removeListener: (callback: ChromeStorageChangedListener) => void;
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
    onChanged?: ChromeStorageOnChanged;
  };
};

function getChromeApi(): ChromeApi | undefined {
  return (globalThis as { chrome?: ChromeApi }).chrome;
}

function readBooleanSetting(key: string): Promise<boolean> {
  const chromeApi = getChromeApi();
  const storage = chromeApi?.storage?.local;

  if (!storage) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    storage.get(key, (items) => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      resolve(items[key] === true);
    });
  });
}

function writeBooleanSetting(key: string, enabled: boolean): Promise<void> {
  const chromeApi = getChromeApi();
  const storage = chromeApi?.storage?.local;

  if (!storage) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    storage.set({ [key]: enabled }, () => {
      const errorMessage = chromeApi?.runtime?.lastError?.message;
      if (errorMessage) {
        reject(new Error(errorMessage));
        return;
      }

      resolve();
    });
  });
}

function subscribeBooleanSetting(key: string, callback: (enabled: boolean) => void): () => void {
  const chromeApi = getChromeApi();
  const onChanged = chromeApi?.storage?.onChanged;

  if (!onChanged) {
    return () => undefined;
  }

  const listener: ChromeStorageChangedListener = (changes, areaName) => {
    if (areaName !== "local" || !changes[key]) {
      return;
    }

    callback(changes[key].newValue === true);
  };

  onChanged.addListener(listener);
  return () => onChanged.removeListener(listener);
}

export function readOcrEnabled(): Promise<boolean> {
  return readBooleanSetting(OCR_ENABLED_STORAGE_KEY);
}

export function writeOcrEnabled(enabled: boolean): Promise<void> {
  return writeBooleanSetting(OCR_ENABLED_STORAGE_KEY, enabled);
}

export function subscribeOcrEnabled(callback: (enabled: boolean) => void): () => void {
  return subscribeBooleanSetting(OCR_ENABLED_STORAGE_KEY, callback);
}

export function readBlurEnabled(): Promise<boolean> {
  return readBooleanSetting(BLUR_ENABLED_STORAGE_KEY);
}

export function writeBlurEnabled(enabled: boolean): Promise<void> {
  return writeBooleanSetting(BLUR_ENABLED_STORAGE_KEY, enabled);
}

export function subscribeBlurEnabled(callback: (enabled: boolean) => void): () => void {
  return subscribeBooleanSetting(BLUR_ENABLED_STORAGE_KEY, callback);
}
