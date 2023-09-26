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
          //chrome.tabs.create({ url: searchUrl });

          // Get the currently active tab in the current window
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
              // Get the active tab's ID
              const activeTabId = tabs[0].id;

              // Update the URL of the active tab
              chrome.tabs.update(activeTabId, { url: searchUrl });
            }
          });
      }
  }
  if (message.action === 'processHistory') {
    processHistory(function(top10Websites) {
      sendResponse(top10Websites);
    });
    return true;
  }
});


function processHistory(callback) {
  chrome.history.search({ text: '', startTime: 0, maxResults: 5000 }, function (historyItems) {
      // Process and log the history items here
      const visitCounts = {};
  
      function isTypicalWebsite(url) {
        // Add additional checks as needed
        const nonWebsitePatterns = [
            /^https?:\/\/localhost/,
            /^https?:\/\/\d+\.\d+\.\d+\.\d+/
        ];
        return !nonWebsitePatterns.some(pattern => pattern.test(url));
      }

      // Create an array to store both URL and title
      const top10Websites = [];

      // Iterate through the history items and update visit counts
      historyItems.forEach(function (item) {
          const url = item.url;
          const title = item.title; // Get the title
          
          if (isTypicalWebsite(url)) {
            if (url in visitCounts) {
                visitCounts[url] += item.visitCount;
            } else {
                visitCounts[url] = item.visitCount;
            }

            // Push both URL and title to the array
            top10Websites.push({ url, title });
          }
      });
  
      // Sort the array by visit count in descending order
      top10Websites.sort(function (a, b) {
          return visitCounts[b.url] - visitCounts[a.url];
      });

      // Get the top 10 most visited websites
      const top10WebsitesLimited = top10Websites.slice(0, 200);
  
      // Log the top 10 most visited websites
      // console.log('Top 10 Most Visited Websites:');
      // top10WebsitesLimited.forEach(function (item, index) {
      //     console.log(`${index + 1}. ${item.url} (Visits: ${visitCounts[item.url]}) - Title: ${item.title}`);
      // });
      //sendResponse({ success: true });
      callback(top10WebsitesLimited);
  });
}

