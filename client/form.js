chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "performSearch") {
      // Get the search query from the message
      const query = message.query;
      if (configData.runningDebug) console.log('performing search:',message.query);
      // Perform the search (replace with your search logic)
      if (query) {
          // Construct the search URL
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

          // Open a new tab with the search results
          chrome.tabs.create({ url: searchUrl });
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
  chrome.history.search({ text: '', startTime: 0, maxResults: 2000 }, function (historyItems) {
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

      // Iterate through the history items and update visit counts
      historyItems.forEach(function (item) {
          const url = item.url;
          if (isTypicalWebsite(url)) {
            if (url in visitCounts) {
                visitCounts[url] += item.visitCount;
            } else {
                visitCounts[url] = item.visitCount;
            }
          }
      });
  
      // Sort the URLs by visit count in descending order
      const sortedUrls = Object.keys(visitCounts).sort(function (a, b) {
          return visitCounts[b] - visitCounts[a];
      });
  
      // Get the top 10 most visited websites
      const top10Websites = sortedUrls.slice(0, 10);
  
      // Log the top 10 most visited websites
      // console.log('Top 10 Most Visited Websites:');
      // top10Websites.forEach(function (url, index) {
      //     console.log(`${index + 1}. ${url} (Visits: ${visitCounts[url]})`);
      // });
      //sendResponse({ success: true });
      callback(top10Websites);
  });
}

