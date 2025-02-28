async function fetchExperimentTitle(url: string): Promise<string> {
  try {
    // Use the built-in fetch API
    const response = await fetch(url);
    const htmlText = await response.text();

    // Use DOMParser to convert HTML string into a Document
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    // Extract the text from all elements with the class "title"
    // Adjust this as needed if you only want the first occurrence or a specific element.
    const titleElements = doc.querySelectorAll('.title');
    if (titleElements.length === 0) return "Unknown Experiment";

    // For example, return the text of the first matched element:
    return titleElements[0].textContent?.trim() || "Unknown Experiment";

    // Or, if you want to join texts from multiple elements:
    // return Array.from(titleElements).map(el => el.textContent?.trim() || '').join(' ');
  } catch (error) {
    console.error("Error fetching experiment title:", error);
    return "Unknown Experiment";
  }
}

export default fetchExperimentTitle;
