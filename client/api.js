
function cropDescription(description, maxLength) {
  if (!description) return;
  if (description.length > maxLength) {
      const croppedDescription = description.slice(0, maxLength);
      return croppedDescription + '...';
  } else {
      return description; // Description is already within maxLength
  }
}


// Function to fetch data and handle storage
function fetchDataAndUpdateStorage() {
  // Check if data exists in local storage and the timestamp is within the last 60 minutes
  const storedData = localStorage.getItem('imageData');
  const storedTimestamp = localStorage.getItem('timestamp');
  const currentTimestamp = new Date().getTime();

  if (storedData && storedTimestamp) {
    const timeDiff = currentTimestamp - parseInt(storedTimestamp, 10);
    const minutesPassed = timeDiff / (1000 * 60);

    if (minutesPassed < configData.imageTimer) {
      // Data is recent, use it
      if (configData.runningDebug) console.log('using: cached image data');
      const imageResponse = JSON.parse(storedData);
      handleImageData(imageResponse);
      return;
    }
  }

  // Fetch new data if no data is present or it's outdated
  fetch(`https://erniejohnson.ca/tools/fetch.php?keyword=${configData.backgroundTheme}`)
    .then((response) => response.json())
    .then((imageResponse) => {
      // Update local storage with new data and timestamp
      localStorage.setItem('imageData', JSON.stringify(imageResponse));
      localStorage.setItem('timestamp', currentTimestamp.toString());
      if (configData.runningDebug) console.log("using: fetched new image");
      handleImageData(imageResponse);
    })
    .catch((err) => console.error(err));
}

// Function to handle image data
function handleImageData(imageResponse) {
  if (configData.runningDebug) console.log('image data:',imageResponse);
    let imageURL = "";

    if(imageResponse.urls.full) {
      imageURL = imageResponse.urls.full;
      const imageDescription = imageResponse.description;
      const imageAuthor = imageResponse.user.name;
      const imageProfileURL = imageResponse.user.links.html;
    }

    const mainElement = document.querySelector("main");
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const info = document.getElementById("info");
    const currentYear = new Date().getFullYear();

    if (!imageURL) imageURL = "default.jpg";
    mainElement.style.backgroundImage = `url(${imageURL})`;

    const imageInfoDiv = document.querySelector('.main-content');

    // Assuming you have the following variables
    const imageDescription = imageResponse.description;
    const imageAuthor = 'by: ' + imageResponse.user.name;
    const imageProfileURL = imageResponse.user.links.html;
    
    // Create a new paragraph element to hold the image description
    const descriptionParagraph = document.createElement('p');
    // Create a new anchor element to link to the author's profile URL
    const authorLink = document.createElement('a');
    authorLink.textContent = imageAuthor;
    authorLink.href = imageProfileURL;
    authorLink.target = '_blank'; // Open in a new tab
    imageInfoDiv.appendChild(authorLink);
    descriptionParagraph.textContent = cropDescription(imageDescription,90);
    if (imageDescription) imageInfoDiv.appendChild(descriptionParagraph);
    imageInfoDiv.appendChild(document.createElement('br'));
    mainElement.classList.add("main-fade-in");
}

// API end point for app updates / change-log
function fetchNews() {
  const phpUrl = 'https://erniejohnson.ca/tools/newtab-version.php';

  // Make a GET request to the PHP file
  fetch(phpUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(jsonData => {
    // Process the JSON data
    console.log("in api fetchnews:",jsonData);
    // You can access the JSON data as an object here
    checkForUpdatesOncePerDay(jsonData, configData);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
}

//
// run our API calls
//

// any news/updates from the server?
fetchNews();

// Call the function to fetch data and update storage (for the bg image)
fetchDataAndUpdateStorage();