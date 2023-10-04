// content.js
loadConfig();

//
// search widget
//
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
searchInput.value = "";

searchForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the user's search query
    const query = searchInput.value.trim();
    if (configData.runningDebug) console.log("in form submit - query is:",query);
    // Send a message to the background script (service worker)
    chrome.runtime.sendMessage({ action: "performSearch", query });
});



//
// clock widget
//
function updateTime() {
  const now = new Date();
  const timeElement = document.getElementById('clock-time');
  const dateElement = document.getElementById('current-date');

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
  ];

  const dayOfWeek = daysOfWeek[now.getDay()];
  const month = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  const currentDate = `${dayOfWeek}, ${month} ${day}, ${year}`;


  let hours = now.getHours();
  let minutes = now.getMinutes();
  let amPm = "";

  // Check the clockType configuration
  if (configData.clockType === 12) {
      // Convert to 12-hour format
      amPm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
  } else {
      // Use 24-hour format (default)
      amPm = ""; // No AM/PM indicator in 24-hour format
  }

  // Add leading zeros to minutes if needed
  if (minutes < 10) {
      minutes = "0" + minutes;
  }
  const currentTime = `${hours}:${minutes} ${amPm}`;
  

  timeElement.textContent = currentTime;
  dateElement.textContent = currentDate;
}



//
// Function to extract the root domain from a URL
//
function extractRootDomain(url) {
  let domain = '';
  // Find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
      domain = url.split('/')[2];
  } else {
      domain = url.split('/')[0];
  }
  // Find & remove port number
  domain = domain.split(':')[0];
  return domain;
}


//
// DOM loaded - so let's setup everything.
//
document.addEventListener('DOMContentLoaded', function () {
  setAppDrawer();
  todoWidget();
  notesWidget();
  calendarWidget();
  processUpdates();
  weatherWidget();
  blacklistBackgrounds();
  reviewBlacklistBackgrounds();
  configModal();
  updateTime(); 
  fetchTopTen();
  aboutModal();

  const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds
  setInterval(weatherWidget, twentyMinutes);
  setInterval(updateTime, 1000);


  // image info dynamic html show/hide
  const imageInfo = document.querySelector('.image-info');
  imageInfo.addEventListener('mouseover', function () {
    imageInfo.classList.add('active');
  });
  imageInfo.addEventListener('mouseout', function () {
    imageInfo.classList.remove('active');
  });
});


//
// load config data or set it if not there
//
function loadConfig() {
  // Check if the object exists in localStorage
  if (localStorage.getItem('configData') === null) {
    // If not, save configData to localStorage
    saveConfig();
  } else {
    // If it exists, retrieve and update configData from localStorage
    configData = JSON.parse(localStorage.getItem('configData'));
    if(configData.runningDebug) console.log("loading config data...");
    console.log('new config data:',configData)
  }
}

function saveConfig() {
  if(configData.runningDebug) console.log('config data saving: ',configData)
  localStorage.setItem('configData', JSON.stringify(configData));
}

//
// setAppDrawer - read config and set any applications available
//
function setAppDrawer() {
  const gitApp = document.querySelector('#app-github');
  const dropboxApp = document.querySelector('#app-dropbox');
  const googledriveApp = document.querySelector('#app-gdrive');
  const amazonApp = document.querySelector('#app-amazon');

  if (configData.gitLink) {
    gitApp.classList.add('app-available');
    gitApp.classList.remove('app-hidden');
  } else {
    gitApp.classList.remove('app-available');
    gitApp.classList.add('app-hidden');
  }

  if (configData.dropboxLink) {
    dropboxApp.classList.add('app-available');
    dropboxApp.classList.remove('app-hidden');
  } else {
    dropboxApp.classList.remove('app-available');
    dropboxApp.classList.add('app-hidden');
  }

  if (configData.googledriveLink) {
    googledriveApp.classList.add('app-available');
    googledriveApp.classList.remove('app-hidden');
  } else {
    googledriveApp.classList.remove('app-available');
    googledriveApp.classList.add('app-hidden');
  }

  if (configData.amazonLink) {
    amazonApp.classList.add('app-available');
    amazonApp.classList.remove('app-hidden');
  } else {
    amazonApp.classList.remove('app-available');
    amazonApp.classList.add('app-hidden');
  }

}

//
// grab top 10 web sites visited, scan blacklist, etc.
//
function fetchTopTen() {
  // Send a message to the background script to trigger the function
  chrome.runtime.sendMessage({ action: "processHistory" }, function (response) {
    // Handle the response, which contains the top 10 websites
    if (response && response.length > 0) {
      // Load the blacklist from localStorage
      const blacklist = JSON.parse(localStorage.getItem('browserhistoryBlacklist')) || {};
      let newList = [];
      if(blacklist.length > 0) {
        response.forEach(function (item) {
          if (!blacklist.includes(item.url)) {
            newList.push(item);
          }
        });
      } else {
        newList = response;
      }
      // Get the top 10 most visited websites
      const top10Websites = newList.slice(0, 10);

      const top10Container = document.getElementById("top10Container");
      while (top10Container.firstChild) {
        top10Container.removeChild(top10Container.firstChild);
      }

      // Create a grid layout with 5 columns and 2 rows
      top10Container.style.display = "grid";
      top10Container.style.gridTemplateColumns = "repeat(5, 1fr)";
      top10Container.style.gridGap = "20px";

      // Loop through the top 10 websites and create elements for each
      top10Websites.forEach(function (website, index) {
        
        const rootDomain = extractRootDomain(website.url);
        const websiteImage = document.createElement("img");
        websiteImage.src = `https://shaggy-chocolate-llama.faviconkit.com/${rootDomain}/64`;
        websiteImage.width = 25;
        websiteImage.height = 25;
      
        const websiteLink = document.createElement("a");
        websiteLink.href = website.url;
        if (configData.newTabs) websiteLink.target = "_blank"; // Open in a new tab

        // Create a badge element and add it to the website container
        const badge = document.createElement('span');
        badge.classList.add('block-badge');
        badge.innerHTML = '<i class="fa-solid fa-minus fa-2xs"></i>';
       
       
        // create a container div for each website block
        const websiteContainer = document.createElement("div");
        websiteContainer.className = "website-item"; 

        // Create a container div for each website icon
        const websiteContainerRound = document.createElement("div");
        websiteContainerRound.className = "website-item-round"; 
        
        // Create a title element (limited to 15 characters)
        const websiteTitle = document.createElement("div");
        websiteTitle.className = "topten-text";
        const truncatedTitle = website.title.length > 10 ? website.title.substring(0, 10) + "..." : website.title;
        websiteTitle.textContent = truncatedTitle;
        
        // Append the website components to the website container
        websiteContainer.appendChild(websiteContainerRound);
          websiteContainerRound.appendChild(websiteLink);
            websiteLink.appendChild(websiteImage);
          websiteContainer.appendChild(websiteTitle);
          websiteContainer.appendChild(badge);
   
         // top ten dynamic html show/hide (blacklist badge)
         //const badgeToggle= document.querySelector('.website-item');
         websiteContainer.addEventListener('mouseover', function () {
           badge.classList.add('block-badge-active');
         });
 
         websiteContainer.addEventListener('mouseout', function () {
           badge.classList.remove('block-badge-active');
         });
       
        // Attach an event listener to the badge to handle blacklist functionality
        badge.addEventListener('click', function (event) {
          event.stopPropagation(); // Prevent the link from being triggered
          // Add the URL to the browserhistoryBlacklist object in local storage
          const blacklist = JSON.parse(localStorage.getItem('browserhistoryBlacklist')) || [];
          if (!blacklist.includes(website.url)) {
            blacklist.push(website.url);
            localStorage.setItem('browserhistoryBlacklist', JSON.stringify(blacklist));
            console.log(`${website.url} has been added to the blacklist.`);
          } else {
            console.log(`${website.url} is already in the blacklist.`);
          }
        });
      
        // Append the website container to the top10Container
        top10Container.appendChild(websiteContainer);
      });
      
    } else {
      console.error('Failed to retrieve top 10 websites.');
    }
  });
}

//
// NOTES widget
//
function notesWidget() {
  const openModalIcon = document.getElementById('open-modal-icon');
  const closeModalIcon = document.getElementById('close-modal-icon');
  const notesPanel = document.getElementById('notes-panel');
  const notesTextarea = document.getElementById('notes');
  let isModalOpen = false; // Track whether the modal is open

  // Check if there are existing notes in local storage
  const existingNotes = localStorage.getItem('notes');
  if (existingNotes) {
      notesTextarea.value = existingNotes;
  }

  // Function to open the modal
  function openModal() {    
    setTabTitle('notes');
    notesPanel.classList.toggle('config-panel-open');
  }

  // Function to close the modal
  function closeModal() {
      setTabTitle('reset');
      notesPanel.classList.toggle('config-panel-open');
  }

  // Event listener to open the modal
  openModalIcon.addEventListener('click', openModal);

  // Event listener to close the modal
  closeModalIcon.addEventListener('click', closeModal);

  const copyNotesButton = document.getElementById('copy-notes-button');
  copyNotesButton.addEventListener('click', copyAllNotesToClipboard);

  const eraseNotesButton = document.getElementById('erase-notes-button');
  eraseNotesButton.addEventListener('click', eraseNotes);

  // Function to copy all notes to the clipboard
  function copyAllNotesToClipboard() {
    if (notesTextarea) {
        // Create a temporary textarea element to copy text to clipboard
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = notesTextarea.value;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        alert('Notes copied to clipboard');
    } else {
        alert('There are no notes to copy.');
    }
  }
  function updateNotes() {
    const notes = notesTextarea.value;
    localStorage.setItem('notes', notes);
  }

  // Function to erase notes
  function eraseNotes() {
    // const notesTextArea = document.getElementById('text');
    if (confirm('Are you sure you want to erase all notes?')) {
        notesTextarea.value = '';
        updateNotes();
    }
  }

  // Event listener to save notes in local storage
  notesTextarea.addEventListener('input', function () {
      updateNotes();
  });

  // Prevent modal from resetting position when re-opened
  window.addEventListener('resize', function () {
      if (isModalOpen) {
          // Re-center the modal when the window is resized
          openModal();
      }
  });
}

//
// TO-DO LIST WIDGET
//
function todoWidget() {
  const openTodoList = document.getElementById('open-tasks-icon');
  const closeTodoList = document.getElementById('close-todo-list');
  const todoModal = document.getElementById('todo-panel');
  const taskInput = document.getElementById('task');
  const addTaskButton = document.getElementById('add-task');
  const taskList = document.getElementById('task-list');

  // Load tasks from local storage on page load
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => addTaskToUI(task));

  openTodoList.addEventListener('click', function () {
      setTabTitle('tasks');
      todoModal.classList.toggle('config-panel-open');
  });

  closeTodoList.addEventListener('click', function () {
      setTabTitle('reset');
      todoModal.classList.toggle('config-panel-open');
  });

  addTaskButton.addEventListener('click', addTaskFromInput);
  taskInput.addEventListener('keydown', handleTaskInput);

  function handleTaskInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTaskFromInput();
    }
  }

  function addTaskFromInput() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        const task = { text: taskText, completed: false };
        savedTasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
        addTaskToUI(task);
        taskInput.value = '';
    }
}

  function addTaskToUI(task) {
      const taskItem = document.createElement('li');
      taskItem.innerHTML = `
          <span class="task-text">${task.text}</span>
          <span class="delete-button">&times;</span>
      `;
      taskList.appendChild(taskItem);

      // Add event listener to delete a task
      const deleteButton = taskItem.querySelector('.delete-button');
      deleteButton.addEventListener('click', function () {
          const index = savedTasks.indexOf(task);
          if (index !== -1) {
              savedTasks.splice(index, 1);
              localStorage.setItem('tasks', JSON.stringify(savedTasks));
              taskItem.remove();
          }
      });
  }
};

//
// ABOUT MODAL
//
function aboutModal() {
  const openAbout = document.getElementById('open-about-icon');
  const closeAbout = document.getElementById('close-about');
  const aboutModal = document.getElementById('about-panel');
  
  openAbout.addEventListener('click', function () {
      setTabTitle('about');
      aboutModal.classList.toggle('config-panel-open');
  });

  closeAbout.addEventListener('click', function () {
      setTabTitle('reset');
      aboutModal.classList.toggle('config-panel-open');
  });

  // TODO show app version
  // TODO if version available > this one, show available version
  // TODO show change log (always)
};

//
// calendar widget
//
function calendarWidget() {
  const openCalendarLink = document.getElementById('open-calendar-icon');
  const closeCalendarModal = document.getElementById('close-calendar-modal');
  const calendarModal = document.getElementById('calendar-modal');
  const calendar = document.getElementById('calendar');

  openCalendarLink.addEventListener('click', function () {
      // Show the calendar modal
      calendarModal.classList.toggle('config-panel-open');
      setTabTitle('calendar');
  });

  closeCalendarModal.addEventListener('click', function () {
      setTabTitle('reset');
      calendarModal.classList.toggle('config-panel-open');
  });

  

  // process adding events:
  const eventInput = document.getElementById('event');
  const dateInput = document.getElementById('date');
  const addEventButton = document.getElementById('add-event');
  const eventList = document.getElementById('event-list');

  // Load events from local storage on page load
  const savedEvents = JSON.parse(localStorage.getItem('events')) || [];
  savedEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  let lastLoggedDate = null; 
  
  savedEvents.forEach(event => {
    const currentDate = event.date;
    if (currentDate !== lastLoggedDate) {
      //console.log(currentDate); // Log the date if it's different
      lastLoggedDate = currentDate; // Update lastLoggedDate
      addDatetoUI(currentDate);
    }
    addEventToUI(event);
  });

  addEventButton.addEventListener('click', addEventFromInput);
  eventInput.addEventListener('keydown', handleEventInput);

  function handleEventInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addEventFromInput();
    }
  }

  function addEventFromInput() {
    const eventText = eventInput.value.trim();
    let eventDate = dateInput.value.trim();
    if (!eventDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based
      const day = String(today.getDate()).padStart(2, '0');
      eventDate = `${year}-${month}-${day}`;
    }

    if (eventText !== '') {
        const event = { text: eventText, date: eventDate, completed: false };
        savedEvents.push(event);
        localStorage.setItem('events', JSON.stringify(savedEvents));
        addEventToUI(event);
        eventInput.value = '';
    }
}
  function addDatetoUI(date) {
    const eventItem = document.createElement('li');
    eventItem.className = 'event-date';
    eventItem.innerHTML = `
      <span class="event-text"><b>${date}</b></span>
      `;
      eventList.appendChild(eventItem);
  }
  function addEventToUI(event) {
      const eventItem = document.createElement('li');
      eventItem.innerHTML = `
          <span class="event-text">${event.text}</span>
          <span class="delete-button">&times;</span>
      `;
      eventList.appendChild(eventItem);

      // Add event listener to delete a task
      const deleteButton = eventItem.querySelector('.delete-button');
      deleteButton.addEventListener('click', function () {
          const index = savedEvents.indexOf(event);
          if (index !== -1) {
              savedEvents.splice(index, 1);
              localStorage.setItem('events', JSON.stringify(savedEvents));
              eventItem.remove();
          }
      });
  }
}

function processUpdates() {
  if (configData.runningDebug) console.log('in processUpdates-newVersion:',configData.newVersion);
  if (!configData.newVersion) return;
  if (configData.runningDebug) console.log('in processUpdates');
  const iconElement = document.getElementById('open-about-icon');
  if (iconElement) {
    // Check if the badge element already exists, and if not, create it
    let badgeElement = iconElement.querySelector('.badge');
    if (!badgeElement) {
      badgeElement = document.createElement('span');
      badgeElement.className = 'badge';
      badgeElement.textContent = '*';
      iconElement.appendChild(badgeElement);
    }
  }
}



// Function to compare two version numbers (e.g., "1.2.0" > "1.1.0")
function compareVersions(versionA, versionB) {
  const partsA = versionA.split('.').map(Number);
  const partsB = versionB.split('.').map(Number);

  for (let i = 0; i < partsA.length; i++) {
    if (partsA[i] > partsB[i]) {
      return 1;
    }
    if (partsA[i] < partsB[i]) {
      return -1;
    }
  }

  return 0; // Versions are equal
}

//
// Function to check for updates only once per day
// TODO - fix this - we need to fetch the update data only once a day - not check locally once a day!
//
function checkForUpdatesOncePerDay(jsonData, configData) {
  // Get the current date
  const currentDate = new Date();

  // Check if local storage contains the last check date
  const lastCheckDateStr = localStorage.getItem('lastCheckDate');

  if (lastCheckDateStr) {
    // Parse the last check date from local storage
    const lastCheckDate = new Date(lastCheckDateStr);

    // Calculate the time difference in milliseconds
    const timeDifference = currentDate - lastCheckDate;

    // Calculate the number of milliseconds in a day (24 hours)
    const oneDayMilliseconds = 24 * 60 * 60 * 1000;

    // Check if it has been at least one day since the last check
    if (timeDifference <= oneDayMilliseconds) { // for LIVE >=
      // Perform the update check
      if (jsonData && jsonData.appVersions && jsonData.appVersions.length > 0) {
        // Get the latest version from the JSON data (assuming versions are sorted in descending order)
        const latestVersion = jsonData.appVersions[0].versionNumber;

        // Compare the latest version with the app's configured version
        if (compareVersions(latestVersion, configData.appVersion) > 0) {
          console.log('Update available',latestVersion);
          configData.newVersion =  latestVersion;
        } else {
          console.log('No update available:' + latestVersion + 'this version:' + configData.appVersion);
        }

        // Update the last check date to the current date
        localStorage.setItem('lastCheckDate', currentDate.toISOString());
      } else {
        console.error('Invalid JSON data');
      }
    } else {
      console.log('Not checking for updates; less than one day since last check.');
    }
  } else {
    // If there's no last check date in local storage, perform the update check
    console.log('Performing initial update check.');

    // Perform the update check as before
    // ...

    // Update the last check date to the current date
    localStorage.setItem('lastCheckDate', currentDate.toISOString());
  }
}


//
// weather widget- get our location, get weather, display weather
//
//
function weatherWidget() {
  navigator.geolocation.getCurrentPosition(wxSuccess, wxError);
}

function wxSuccess(pos) {
  let lat = pos.coords.latitude;
  let long = pos.coords.longitude;
  if(configData.runningDebug) console.log(lat,long);
  // TODO - cache weather in localstorage for 30 mins

  setTimeout(function() {
    console.log("fetching wx at lat:",lat);
    weather(lat, long);
  }, 5000);
}

function wxError() {
  console.log("There was an error fetching user location");
}

function weather(lat, long) {
  let URL = `https://fcc-weather-api.glitch.me/api/current?lat=${lat}&lon=${long}`;
  
  fetch(URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      display(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


function display(data) {
  console.log("WEATHER:",data)
  let city = data.name.toUpperCase();
  let temp =
    Math.round(data.main.temp_max) +
    "&deg; C | " +
    Math.round(Math.round(data.main.temp_max) * 1.8 + 32) +
    "&deg; F";
  // let desc = data.weather[0].description;

  let font_color;
  if (Math.round(data.main.temp_max) > 23) {
    font_color = "rgba(211,99,38,.7)";
  } else {
    font_color = "rgba(68,195,222,.7)";
  }

  const weathercon = document.querySelector(".weathercon");
  const location = document.querySelector(".location");
  const tempElement = document.querySelector(".temp");
  
  const weatherMain = data.weather[0].main.toLowerCase();
  let weatherIcon = "";

  // Determine the weather icon based on weatherMain
  switch (weatherMain) {
    case "sunny":
      weatherIcon = `<i class='fas fa-sun' style='color: ${font_color};'></i>`;
      break;
    case "rain":
      weatherIcon = `<i class='fa-solid fa-cloud-rain' style='color: ${font_color};'></i>`;
      break;
    case "thunderstorm":
      weatherIcon = `<i class='fa-solid fa-cloud-bolt' style='color: ${font_color};'></i>`;
      break;
    case "drizzle":
      weatherIcon = `<i class='fa-solid fa-cloud-sun-rain' style='color: ${font_color};'></i>`;
      break;
    case "snow":
      weatherIcon = `<i class='fa-solid fa-snowflake' style='color: ${font_color};'></i>`;
      break;
    case "fog":
    case "smoke":
    case "haze":
    case "dust":
    case "sand":
    case "mist":
      weatherIcon = `<i class='fa-solid fa-smog' style='color: ${font_color};'></i>`;
      break;
    case "tornado":
      weatherIcon = `<i class='fa-solid fa-tornado' style='color: ${font_color};'></i>`;
      break;
    case "ash":
      weatherIcon = `<i class='fa-solid fa-volcano' style='color: ${font_color};'></i>`;
      break;
    case "clouds":
      weatherIcon = `<i class='fa-solid fa-cloud' style='color: ${font_color};'></i>`;
      break;
    case "clear":
      weatherIcon = `<i class='fa-solid fa-sun' style='color: ${font_color};'></i>`;
      break;
    default:
      weatherIcon = `<i class='fas fa-question' style='color: ${font_color};'></i>`;
      break;
  }

  weathercon.innerHTML = weatherIcon;

  location.textContent = city;
  tempElement.innerHTML = temp;
  location.style.color = font_color;
  tempElement.style.color = font_color;
}

//
// blacklist any backgrounds the user wants to 
//
function blacklistBackgrounds() {
  const mainElement = document.querySelector("main");
  const blacklistButton = document.getElementById("blacklistimage");
  
  // Check if the blacklist object exists in localStorage
  const blacklist = JSON.parse(localStorage.getItem("blacklist")) || {};
  // TODO return if no blacklist items

  // Add a click event listener to the button
  blacklistButton.addEventListener("click", function () {
    // Get the current background image URL of the mainElement
    const computedStyle = getComputedStyle(mainElement);
    const backgroundImageUrl = computedStyle.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
    // TODO - strip the other stuff off this - should be just this:
    // https://images.unsplash.com/photo-1612273320616-3498071b307d
    // and not above, plus this:
    // ?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1MDM5Mzh8MHwxfHJhbmRvbXx8fHx8fHx8fDE2OTU2ODkzODR8&ixlib=rb-4.0.3&q=85
    // TODO we might have to pass all this thru our API midlayer to get the images back for rendering

    // Check if the URL is already in the blacklist
    if (!blacklist[backgroundImageUrl]) {
      // Add the URL to the blacklist object
      blacklist[backgroundImageUrl] = true;
  
      // Save the updated blacklist object back to localStorage
      localStorage.setItem("blacklist", JSON.stringify(blacklist));
  
      // Optionally, you can apply a new background image or perform other actions here
      // mainElement.style.backgroundImage = `url(NEW_BACKGROUND_IMAGE_URL)`;
  
      // Optionally, you can display a message or perform other actions here
      console.log("Image blacklisted:",backgroundImageUrl);
      reviewBlacklistBackgrounds();
    } else {
      // URL is already in the blacklist, so you can show a message or do nothing
      console.log("Image is already blacklisted.");
    }
  });
}

function reviewBlacklistBackgrounds() {
  const imageModal = document.getElementById("imageModal");
  // const modalImage = document.getElementById("modalImage");
  // const removeFromBlacklist = document.getElementById("removeFromBlacklist");
  // const prevButton = document.getElementById("prevButton");
  // const nextButton = document.getElementById("nextButton");
  const closeModal = document.getElementById("closeModal");
  const blacklistreviewButton = document.getElementById("blacklistreviewButton");
  
  let blacklistUrls = [];
  let currentImageIndex = 0;

  // Load blacklist URLs from localStorage
  if (localStorage.getItem("blacklist")) {
    blacklist = JSON.parse(localStorage.getItem("blacklist"));
    blacklistUrls = Object.keys(blacklist);
  } else  {
    console.log('no photos in blacklist')
    return;
  }




  // blacklistedimages = div ID for container:
  const blacklistedImagesDiv = document.getElementById('blacklistedimages');
  // display images in a vertical list
  
  blacklistUrls.forEach(function(url) {
    const image = document.createElement('img');
    image.className = "blacklistimage-preview";
    image.src = url + '?q=75&w=280&fit=max';
    image.alt = url;

    const button = document.createElement('button');
    button.className = "task-button";
    button.textContent = 'remove from block list'; 

    const containerDiv = document.createElement('div');
    containerDiv.className = 'blockedimages-container';
    containerDiv.appendChild(image);
    containerDiv.appendChild(button);

    blacklistedImagesDiv.appendChild(containerDiv);
    button.addEventListener('click', function() {
      blacklistedImagesDiv.removeChild(containerDiv);

      const imageUrlToRemove = blacklistUrls[currentImageIndex];
      delete blacklist[imageUrlToRemove];
      localStorage.setItem("blacklist", JSON.stringify(blacklist));
    });
    currentImageIndex++;
  });


  // Add a click event listener to open the modal
  blacklistreviewButton.addEventListener("click", function () {
    // Get the URLs from the blacklist object
    blacklistUrls = Object.keys(blacklist);
    setTabTitle('review blacklisted images');
    if (blacklistUrls.length > 0) {
      currentImageIndex = 0;
      //showImage();
      imageModal.classList.toggle('config-panel-open');
    }
  });

  // Add a click event listener to close the modal
  closeModal.addEventListener("click", function () {
    imageModal.classList.toggle('config-panel-open');
    setTabTitle('reset');
  });

  // Close the modal when the user clicks outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === imageModal) {
      imageModal.classList.toggle('config-panel-open');
      setTabTitle('reset');
    }
  });
}

function configModal() {
  const configModal = document.getElementById('configModal');
  const openConfigIcon = document.getElementById("open-config-icon");
  const closeModal = document.getElementById("closeConfigModal");
  const saveButton = document.getElementById('saveConfig');

  openConfigIcon.addEventListener('click', () => {
    //configModal.style.display = 'block';
    setTabTitle('configure');
    configModal.classList.toggle('config-panel-open');
  });
  closeModal.addEventListener("click", function () {
    //configModal.style.display = "none";
    setTabTitle('reset');
    configModal.classList.toggle('config-panel-open');
  });

  // populate the form


  document.getElementById("backgroundTheme").value = configData.backgroundTheme;
  document.getElementById("imageTimer").value = configData.imageTimer;
  document.getElementById("gitLink").value = configData.gitLink;
  document.getElementById("googledriveLink").value = configData.googledriveLink;

  // process form save
  saveButton.addEventListener('click', function(event) {
    const formElement = document.getElementById('configForm'); // Replace 'yourFormId' with your actual form ID
    const formData = new FormData(formElement);
    event.preventDefault();

    // Access form fields and values
    configData.backgroundTheme = formData.get('backgroundTheme');
    configData.imageTimer = formData.get('imageTimer');
    configData.gitLink = formData.get('gitLink');
    configData.googledriveLink = formData.get('googledriveLink');

    // TODO error checking
    // TODO save to localstorage
    saveConfig();
  });

}

function setTabTitle(newTitle) {
  const tabTitle = document.title;
  if (newTitle === 'reset') {
    document.title = configData.appName;
    return;
  }
  document.title = newTitle + " - " + configData.appName;
}