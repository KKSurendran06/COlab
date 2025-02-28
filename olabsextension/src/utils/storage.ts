export function storeData(key: string, value: any) {
    chrome.storage.local.set({ [key]: value });
  }
  
  export function getData(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }
  