// content.js




//
// what country is user in?
// TODO - this doesn't work well (if at all) - need to use by IP.
//
const userCountry = window.navigator.language || window.navigator.userLanguage;
if (configData.runningDebug) console.log('User is in:', userCountry);


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
      amPm = hours >= 12 ? "PM" : "AM";
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

setInterval(updateTime, 1000); // Update every second
updateTime(); // Initial update

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
// notepad widget
//
document.addEventListener('DOMContentLoaded', function () {
  todoWidget();
  notesWidget();
  aboutWidget();
  calendarWidget();
  processUpdates();
  weatherWidget();
  blacklistBackgrounds();
  reviewBlacklistBackgrounds();

  // Send a message to the background script to trigger the function
  chrome.runtime.sendMessage({ action: "processHistory" }, function (response) {
    // Handle the response, which contains the top 10 websites
    if (response && response.length > 0) {

      // Load the blacklist from localStorage
      const blacklist = JSON.parse(localStorage.getItem('browserhistoryBlacklist')) || {};
      let newList = [];
      if(blacklist.length > 0) {
        response.forEach(function (item) {
          if (!blacklist.includes(item)) {
            newList.push(item);
          }
        });
      } else {
        newList = response;
      }
      // Get the top 10 most visited websites
      const top10Websites = newList.slice(0, 10);

      const top10Container = document.getElementById("top10Container");

      // Create a grid layout with 5 columns and 2 rows
      top10Container.style.display = "grid";
      top10Container.style.gridTemplateColumns = "repeat(5, 1fr)";
      top10Container.style.gridGap = "20px";

      // Loop through the top 10 websites and create elements for each
      top10Websites.forEach(function (website, index) {
        const rootDomain = extractRootDomain(website);
        const websiteImage = document.createElement("img");
        websiteImage.src = `https://shaggy-chocolate-llama.faviconkit.com/${rootDomain}/64`;
        websiteImage.width = 25;
        websiteImage.height = 25;
      
        const websiteLink = document.createElement("a");
        websiteLink.href = website;
        websiteLink.target = "_blank"; // Open in a new tab
        //websiteLink.textContent = website;
        websiteLink.appendChild(websiteImage);
      
        // Create a badge element and add it to the website container
        const badge = document.createElement('span');
        badge.classList.add('block-badge');
        badge.innerText = '-';
        websiteLink.appendChild(badge);
      
        // Attach an event listener to the badge to handle blacklist functionality
        badge.addEventListener('click', function (event) {
          event.stopPropagation(); // Prevent the link from being triggered
          // Add the URL to the browserhistoryBlacklist object in local storage
          const blacklist = JSON.parse(localStorage.getItem('browserhistoryBlacklist')) || [];
          if (!blacklist.includes(website)) {
            blacklist.push(website);
            localStorage.setItem('browserhistoryBlacklist', JSON.stringify(blacklist));
            console.log(`${website} has been added to the blacklist.`);
          } else {
            console.log(`${website} is already in the blacklist.`);
          }
        });
      
        // Create a container div for each website link
        const websiteContainer = document.createElement("div");
        websiteContainer.className = "website-item"; // You can style this class as needed
        websiteContainer.appendChild(websiteLink);
      
        // Append the website container to the top10Container
        top10Container.appendChild(websiteContainer);
      });
      
    } else {
      console.error('Failed to retrieve top 10 websites.');
    }
  });

});

//
// NOTES widget
//
function notesWidget() {
  const openModalIcon = document.getElementById('open-modal-icon');
  const closeModalIcon = document.getElementById('close-modal-icon');
  const modal = document.getElementById('modal');
  const notesTextarea = document.getElementById('notes');
  let isModalOpen = false; // Track whether the modal is open


  // Check if there are existing notes in local storage
  const existingNotes = localStorage.getItem('notes');
  if (existingNotes) {
      notesTextarea.value = existingNotes;
  }

  // Function to open the modal
  function openModal() {
    modal.style.display = 'block';
    // Center the modal on the screen
    document.body.style.overflow = 'hidden'; // Prevent scrolling of the background content
    isModalOpen = true;
  }

  // Function to close the modal
  function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Restore scrolling of the background content
      isModalOpen = false;
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

  // Close the modal by default
  closeModal();

  // Prevent modal from resetting position when re-opened
  window.addEventListener('resize', function () {
      if (isModalOpen) {
          // Re-center the modal when the window is resized
          openModal();
      }
  });
}

function aboutWidget() {
  const openAboutIcon = document.getElementById('open-about-icon');
  const closeAboutModal = document.getElementById('close-about-modal');
  const aboutModal = document.getElementById('about-modal');

  openAboutIcon.addEventListener('click', function () {
      aboutModal.style.display = 'block';
  });

  closeAboutModal.addEventListener('click', function () {
      aboutModal.style.display = 'none';
  });
};

//
// TO-DO LIST WIDGET
//
function todoWidget() {
  const openTodoList = document.getElementById('open-tasks-icon');
  const closeTodoList = document.getElementById('close-todo-list');
  const todoModal = document.getElementById('todo-modal');
  const taskInput = document.getElementById('task');
  const addTaskButton = document.getElementById('add-task');
  const taskList = document.getElementById('task-list');

  // Load tasks from local storage on page load
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => addTaskToUI(task));

  openTodoList.addEventListener('click', function () {
      todoModal.style.display = 'block';
  });

  closeTodoList.addEventListener('click', function () {
      todoModal.style.display = 'none';
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
// calendar widget
//
function calendarWidget() {
  const openCalendarLink = document.getElementById('open-calendar-icon');
  const closeCalendarModal = document.getElementById('close-calendar-modal');
  const calendarModal = document.getElementById('calendar-modal');
  const calendar = document.getElementById('calendar');

  openCalendarLink.addEventListener('click', function () {
      // Create a date object for the current month
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Create a new date object for the first day of the current month
      const firstDay = new Date(year, month, 1);

      // Generate the HTML for the calendar
      const calendarHTML = generateCalendarHTML(firstDay);

      // Set the calendar HTML content
      calendar.innerHTML = calendarHTML;

      // Show the calendar modal
      calendarModal.style.display = 'block';
  });

  closeCalendarModal.addEventListener('click', function () {
      // Close the calendar modal
      calendarModal.style.display = 'none';
  });

  // Function to generate the HTML for the calendar
  function generateCalendarHTML(firstDay) {
    const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
    const startDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Define an array of month names for display purposes
    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    // Generate the table header with the month and year
    let calendarHTML = `
        <table>
            <caption class="calendar-heading">${monthNames[firstDay.getMonth()]} ${firstDay.getFullYear()}</caption>
            <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
            </tr>
    `;

    // Initialize variables for tracking the day and row
    let currentDay = 1;
    let currentRow = 2; // Start from the second row

    // Loop through each row
    for (let row = 1; row <= 6; row++) {
        // Start a new row
        calendarHTML += '<tr>';

        // Loop through each column (day of the week)
        for (let col = 0; col < 7; col++) {
            if ((row === 1 && col < startDay) || currentDay > daysInMonth) {
                // Empty cells before the start of the month or after the end of the month
                calendarHTML += '<td></td>';
            } else {
                // Display the current day
                calendarHTML += `<td class="calendar-day">${currentDay}</td>`;
                currentDay++;
            }
        }

        // End the current row
        calendarHTML += '</tr>';

        if (currentDay > daysInMonth) {
            break;
        }
    }

    // Close the table
    calendarHTML += '</table>';

    return calendarHTML;
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
  navigator.geolocation.getCurrentPosition(success, error);
}

function success(pos) {
  let lat = pos.coords.latitude;
  let long = pos.coords.longitude;
  if(configData.runningDebug) console.log(lat,long);
  // TODO - only fetch weather once every 30 mins
  // TODO - cache weather in localstorage for 30 mins
  weather(lat, long);
}

function error() {
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
  let city = data.name.toUpperCase();
  let temp =
    Math.round(data.main.temp_max) +
    "&deg; C | " +
    Math.round(Math.round(data.main.temp_max) * 1.8 + 32) +
    "&deg; F";
  let desc = data.weather[0].description;

  let font_color;
  let bg_color;
  if (Math.round(data.main.temp_max) > 25) {
    font_color = "#d36326";
    bg_color = "#f3f5d2";
  } else {
    font_color = "#44c3de";
    bg_color = "#eff3f9";
  }

  const weathercon = document.querySelector(".weathercon");
  const location = document.querySelector(".location");
  const tempElement = document.querySelector(".temp");
  
  // TODO - expand weather types
  // https://github.com/freeCodeCamp/freeCodeCamp/issues/15767
  // https://fcc-weather-api.freecodecamp.repl.co/
  // https://openweathermap.org/weather-conditions
 // Convert weather main to lowercase
const weatherMain = data.weather[0].main.toLowerCase();

// Variables to store the weather icon and color
let weatherIcon = "";
let iconColor = "";

// Determine the weather icon based on weatherMain
switch (weatherMain) {
  case "sunny":
    weatherIcon = "<i class='fas fa-sun' style='color: #d36326;'></i>";
    break;
  case "rain":
    weatherIcon = "<i class='fa-solid fa-cloud-rain'></i>";
    break;
  case "thunderstorm":
    weatherIcon = "<i class='fa-solid fa-cloud-bolt'></i>";
    break;
  case "drizzle":
    weatherIcon = "<i class='fa-solid fa-cloud-sun-rain'></i>";
    break;
  case "snow":
    weatherIcon = "<i class='fa-solid fa-snowflake'></i>";
    break;
  case "fog":
  case "smoke":
  case "haze":
  case "dust":
  case "sand":
    weatherIcon = "<i class='fa-solid fa-smog'></i>";
    break;
  case "tornado":
    weatherIcon = "<i class='fa-solid fa-tornado'></i>";
    break;
  case "ash":
    weatherIcon = "<i class='fa-solid fa-volcano'></i>";
    break;
  case "clouds":
    weatherIcon = "<i class='fa-solid fa-cloud'></i>";
    break;
  case "clear":
    weatherIcon = "<i class='fa-solid fa-sun'></i>";
    break;
  default:
    weatherIcon = "<i class='fas fa-question'></i>";
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
    } else {
      // URL is already in the blacklist, so you can show a message or do nothing
      console.log("Image is already blacklisted.");
    }
  });
}

function reviewBlacklistBackgrounds() {
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const removeFromBlacklist = document.getElementById("removeFromBlacklist");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const closeModal = document.getElementById("closeModal");
  const blacklistreviewButton = document.getElementById("blacklistreviewButton");

  let blacklistUrls = [];
  let currentImageIndex = 0;

  // Load blacklist URLs from localStorage
  if (localStorage.getItem("blacklist")) {
    blacklist = JSON.parse(localStorage.getItem("blacklist"));
    blacklistUrls = Object.keys(blacklist);
    console.log('blacklistUrls:',blacklistUrls)
  } else  {
    console.log('no photos in blacklist')
    return;
  }


  // Add a click event listener to open the modal
  blacklistreviewButton.addEventListener("click", function () {
    // Get the URLs from the blacklist object
    blacklistUrls = Object.keys(blacklist);

    if (blacklistUrls.length > 0) {
      currentImageIndex = 0;
      showImage();
      imageModal.style.display = "block";
    }
  });

  // Add a click event listener to close the modal
  closeModal.addEventListener("click", function () {
    imageModal.style.display = "none";
  });

  // Function to show the current image
  function showImage() {
    modalImage.src = blacklistUrls[currentImageIndex];
  }

  // Add a click event listener to remove the current image from the blacklist
  removeFromBlacklist.addEventListener("click", function () {
    const imageUrlToRemove = blacklistUrls[currentImageIndex];
    delete blacklist[imageUrlToRemove];
    localStorage.setItem("blacklist", JSON.stringify(blacklist));
    // Optionally, update your UI or take other actions
    // For example, you can remove the image from the modal
    // and update the UI to reflect the change
    blacklistUrls.splice(currentImageIndex, 1);
    if (blacklistUrls.length === 0) {
      imageModal.style.display = "none";
    } else {
      if (currentImageIndex >= blacklistUrls.length) {
        currentImageIndex = blacklistUrls.length - 1;
      }
      showImage();
    }
  });

  // Add click event listeners for navigation buttons
  prevButton.addEventListener("click", function () {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      showImage();
    }
  });

  nextButton.addEventListener("click", function () {
    if (currentImageIndex < blacklistUrls.length - 1) {
      currentImageIndex++;
      showImage();
    }
  });

  // Close the modal when the user clicks outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === imageModal) {
      imageModal.style.display = "none";
    }
  });
}