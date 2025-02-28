import { db } from "./firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getData, storeData } from "./utils/storage";

// Track experiment page visits
chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
  // Using underscore (_) to indicate we're intentionally not using the tabId parameter
  
  // Only proceed if the page has completed loading
  if (changeInfo.status === 'complete' && tab.url) {
    const details = await getData("experimentDetails");
    if (details) {
      try {
        // Log the experiment visit to Firebase
        await addDoc(collection(db, "experiments"), {
          sub: details.sub,
          sim: details.sim,
          cnt: details.cnt,
          url: tab.url,
          title: await fetchTitle(tab.url),
          timestamp: serverTimestamp()
        });
        console.log("User added to experiment tracking:", details);
      } catch (error) {
        console.error("Error adding document to Firestore:", error);
      }
    }
  }
});

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  // Using underscore (_) to indicate we're intentionally not using the sender parameter
  
  if (request.action === "fetchExperimentTitle") {
    fetchTitle(request.url)
      .then(title => {
        // Store the title in local storage for future use
        storeData("experimentTitle", title);
        sendResponse({ success: true, title });
      })
      .catch(error => {
        console.error("Error in fetchExperimentTitle:", error);
        sendResponse({ success: false, error: error.toString() });
      });
    
    // Return true to indicate that we'll send a response asynchronously
    return true;
  }
});

/**
 * Fetches the title from a given URL
 * @param url The URL to fetch the title from
 * @returns Promise resolving to the title string
 */
async function fetchTitle(url: string): Promise<string> {
  // First try to get the title from the current tab if it's the same URL
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (currentTab && currentTab.url === url && currentTab.id) {
      // If we're on the page, execute script to get title directly
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          const titleElement = document.querySelector(".title");
          return titleElement?.textContent?.trim() || document.title || "Unknown Experiment";
        }
      });
      
      if (results && results[0] && results[0].result) {
        return results[0].result;
      }
    }
    
    // If we couldn't get the title from the current tab, try fetching it
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const titleElement = doc.querySelector(".title");
    
    return titleElement?.textContent?.trim() || 
           doc.title || 
           "Unknown Experiment";
  } catch (error) {
    console.error("Error fetching title:", error);
    return "Unknown Experiment";
  }
}