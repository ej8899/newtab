chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "performSearch") {
      // Get the search query from the message
      const query = message.query;
      console.log('performing search:',message.query);
      // Perform the search (replace with your search logic)
      if (query) {
          // Construct the search URL
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

          // Open a new tab with the search results
          chrome.tabs.create({ url: searchUrl });
      }
  }
});