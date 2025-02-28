async function fetchExperimentTitle(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      const titleElement = doc.querySelector(".title");
  
      return titleElement?.textContent?.trim() || "Unknown Experiment";
    } catch (error) {
      console.error("Error fetching experiment title:", error);
      return "Unknown Experiment";
    }
  }
  
  export default fetchExperimentTitle;
  