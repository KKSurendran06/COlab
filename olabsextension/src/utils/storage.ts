declare const chrome: any;

export const storeData = async (key: string, value: any) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error storing data', error);
  }
};

export const getData = async (key: string) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result: { [key: string]: any }) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result[key]);
          }
        });
      });
    } else {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  } catch (error) {
    console.error('Error getting data', error);
    return null;
  }
};