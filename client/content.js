// content.js
loadConfig();


// snackbar open handler
// TODO implement  style
function opensnack(text,style) {
  let snackBar = document.getElementById("snackbar");
  if (text) snackBar.innerText = text;
  snackBar.className = "show";
  setTimeout(function(){ snackBar.className = snackBar.className.replace("show", ""); }, 4000);
}

// snackbar close handler
function closesnack(e){
  e.parentElement.className = e.parentElement.className.replace("show", "");
}

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
  if (configData.clockType === null) {
      // Convert to 12-hour format
      amPm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
  } else {
      // Use 24-hour format (default)
      amPm = ""; // No AM/PM indicator in 24-hour format
      hours = now.getHours();
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
  //reviewBlacklistBackgrounds();
  configModal();
  updateTime(); 
  fetchTopTen();
  aboutModal();

  const twentyMinutes = 20 * 60 * 1000; // 20 minutes in milliseconds
  setInterval(weatherWidget, twentyMinutes);
  setInterval(updateTime, 1000);

  //const openTodoList = document.getElementById('open-tasks-icon');
  const blacklistreviewButton = document.getElementById("blacklistreviewButton");
  blacklistreviewButton.addEventListener("click", reviewBlacklistBackgrounds);

  
  // close panel if open and click outside of it
  document.addEventListener('click', function (event) {
    const clickX = event.clientX;
    const edgeOffset = 300; // 300px is width of app panel
    
    if (event.target.id === 'blacklistreviewButton') {
      return; // Ignore clicks on this button
    }
    if (clickX > edgeOffset) {
      // Clicked outside of the specified offset, close the panel
      const appPanel = document.querySelector('.config-panel-open');
      if (appPanel) appPanel.classList.remove('config-panel-open');
      setTabTitle('reset');
      console.log('closing:',appPanel)
    }
  });

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
  applyConfig();
}

function saveConfig() {
  if(configData.runningDebug) console.log('config data saving: ',configData)
  localStorage.setItem('configData', JSON.stringify(configData));
  opensnack('saved','success');
  applyConfig();
}

//
// any config changes, reload applicable widgets//
function applyConfig() {
  if (configData.showTopten != null) {
    const widget = document.querySelector('#top10Container');
    widget.classList.remove("app-hidden");
  } else {
    const widget = document.querySelector('#top10Container');
    widget.classList.add("app-hidden");
  }

  if (configData.showWeather != null) {
    const widget = document.querySelector('#wxinfo');
    widget.classList.remove("app-hidden");
  } else {
    const widget = document.querySelector('#wxinfo');
    widget.classList.add("app-hidden");
  }
}

//
// setAppDrawer - read config and set any applications available
//
function setAppDrawer() {
  const gitApp = document.querySelector('#app-github');
  const dropboxApp = document.querySelector('#app-dropbox');
  const googledriveApp = document.querySelector('#app-gdrive');
  const amazonApp = document.querySelector('#app-amazon');

  if (configData.gitLink !==null) {
    gitApp.classList.add('app-available');
    gitApp.classList.remove('app-hidden');
  } else {
    gitApp.classList.remove('app-available');
    gitApp.classList.add('app-hidden');
  }

  if (configData.dropboxLink !== null) {
    dropboxApp.classList.add('app-available');
    dropboxApp.classList.remove('app-hidden');
  } else {
    dropboxApp.classList.remove('app-available');
    dropboxApp.classList.add('app-hidden');
  }

  if (configData.googledriveLink !== null) {
    googledriveApp.classList.add('app-available');
    googledriveApp.classList.remove('app-hidden');
  } else {
    googledriveApp.classList.remove('app-available');
    googledriveApp.classList.add('app-hidden');
  }

  if (configData.amazonLink !=null) {
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
      if(!notesTextarea.value) {
        opensnack("no notes to copy",'warn');
        return;
      }
      console.log("notes copied:",notesTextarea.value)
      // Create a temporary textarea element to copy text to clipboard
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = notesTextarea.value;
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextarea);
      //alert('Notes copied to clipboard');
      opensnack("notes copied to clipboard",'success');
    } else {
        //alert('There are no notes to copy.');
        opensnack("no notes to copy",'warn');
    }
  }
  function updateNotes() {
    const notes = notesTextarea.value;
    localStorage.setItem('notes', notes);
  }

  // Function to erase notes
  const noteButtons = document.getElementById('note-buttons'); // copy/erase notes panel
  const confirmErase = document.getElementById('confirm-erase'); // confirm erase panel
  function eraseNotes() {
    // hide note-buttons div
    noteButtons.classList.add("app-hidden");
    noteButtons.classList.remove("app-available");

    // show confirm-erase div 
    confirmErase.classList.add("app-available");
    confirmErase.classList.remove("app-hidden");
  }

  const noEraseButton = document.getElementById('noerase');
  const yesEraseButton = document.getElementById('yeserase');
  noEraseButton.addEventListener('click', () => {
    console.log("no button")
    noteButtons.classList.add("app-available");
    noteButtons.classList.remove("app-hidden");
    confirmErase.classList.add("app-hidden");
    confirmErase.classList.remove("app-available");
  });
  yesEraseButton.addEventListener('click', () => {
    console.log("yes button");
    opensnack('erased','warn');
    notesTextarea.value = '';
    updateNotes();
    noteButtons.classList.add("app-available");
    noteButtons.classList.remove("app-hidden");
    confirmErase.classList.add("app-hidden");
    confirmErase.classList.remove("app-available");
  });

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
  //taskList.innerHTML='';

  // Load tasks from local storage on page load
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  //savedTasks.forEach(task => addTaskToUI(task));

  checkZeroTasks();

  function checkZeroTasks() {
    if(savedTasks.length > 0) {
      taskList.classList.remove('app-hidden');
      taskList.innerHTML='';
      savedTasks.forEach(task => addTaskToUI(task));
    } else {
      //addTaskToUI({text:'all caught up!'});
      console.log('no tasks')
      taskList.classList.add('app-hidden');
    }
  }

  openTodoList.addEventListener('click', openTasks);
  function openTasks() {
    setTabTitle('tasks');
    todoModal.classList.toggle('config-panel-open');
  }

  closeTodoList.addEventListener('click', closeTasks);
  function closeTasks() {
    console.log('close task list button')
    setTabTitle('reset');
    todoModal.classList.toggle('config-panel-open');
  }

  addTaskButton.addEventListener('click', addTaskFromInput);
  taskInput.addEventListener('keydown', handleTaskInput);

  function handleTaskInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTaskFromInput();
    }
  }

  function addTaskFromInput(e) {
    //e.stopPropagation();
    let taskText = taskInput.value.trim();
    taskText = sanitizeInput(taskText);
    if (taskText !== '') {
        const task = { text: taskText, completed: false };
        savedTasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
        addTaskToUI(task);
        taskInput.value = '';
        checkZeroTasks();
    }
}

  function addTaskToUI(task) {
      const taskItem = document.createElement('li');
      taskItem.innerHTML = `
          <span class="task-text">${task.text}</span>
          <span class="delete-button"><i class="fa-solid fa-x"></i></span>
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
              checkZeroTasks();
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

  // TODO if version available > this one, show available version
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
  let lastLoggedDate = null; 
  let savedEvents = {};

  
  

  checkZeroEvents();

  function checkZeroEvents() {
    lastLoggedDate = null;
    // Load events from local storage on page load
    savedEvents = JSON.parse(localStorage.getItem('events')) || [];
    savedEvents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
    addDatetoCalendar('2023-01-01',true); // erase all marked dates
    if(savedEvents.length > 0) {
      eventList.classList.remove('app-hidden');
      eventList.innerHTML='';
      //savedEvents.forEach(task => addEventToUI(task));
      savedEvents.forEach(event => {
        const currentDate = removePaddingFromDate(event.date);
        if (currentDate === getFormattedDate('today')) {
          // set badge on app panel - we have event today
          console.log('yes we have event for today');
          setIconBadge('app-calendar');
        }
        if (currentDate !== lastLoggedDate) {
          console.log(currentDate); // Log the date if it's different
          lastLoggedDate = currentDate; // Update lastLoggedDate
          addDatetoUI(currentDate);
          addDatetoCalendar(currentDate);
        }
        addEventToUI(event);
      });
    } else {
      //addTaskToUI({text:'all caught up!'});
      console.log('no tasks')
      setIconBadge('app-calendar',"remove");
      eventList.classList.add('app-hidden');
    }
  }

  addEventButton.addEventListener('click', addEventFromInput);
  eventInput.addEventListener('keydown', handleEventInput);

  function handleEventInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addEventFromInput();
    }
  }

  function addEventFromInput() {
    let eventText = eventInput.value.trim();
    let eventDate = dateInput.value.trim();
    eventText = sanitizeInput(eventText);
    
    // default to today if no date is selected
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
        checkZeroEvents();
    } else {
      //addEventToUI({text:'no upcoming events'});
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
          <span class="delete-button"><i class="fa-solid fa-x"></i></span>
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
              checkZeroEvents();
          }
      });
  }

  function addDatetoCalendar(currentDate,remove) {
    const dayElements = document.querySelectorAll('.day');
    let targetElement = null;

    const parts = currentDate.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    if(remove) {
      dayElements.forEach(function (dayElement) {
        dayElement.classList.remove('day-event');
      });
      return;
    }

    dayElements.forEach(function (dayElement) {
      const dataMonth = dayElement.getAttribute('data-month');
      const dataDay = dayElement.getAttribute('data-day');
      const dataYear = dayElement.getAttribute('data-year');
  
      if (
        dataMonth === month &&
        dataDay === day &&
        dataYear === year
      ) {
        // Found  matching element
        targetElement = dayElement;
        // Break out of the loop -> found the target
        return;
      }
    });

    if (targetElement) {
      // Do something with the target element
      console.log('Found the target element:', targetElement);
      targetElement.classList.add('day-event');
    } else {
      // Target element not found
    }
  }

}

function processUpdates() {
  if (configData.runningDebug) console.log('in processUpdates-newVersion:',configData.newVersion);
  if (!configData.newVersion) return;
  if (configData.runningDebug) console.log('in processUpdates');

  setIconBadge('app-about');
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
  // TODO check our cache in localstorage for valid weather object with current date
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
      displayWx(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


function displayWx(data) {
  console.log("WEATHER:",data)
  // TODO - capture invalid response (lat: 35, lon: 139)
  if(data.coord.lon === 139 && data.coord.lat === 35) {
    console.log('weatherwidget: error receiving correct data');
    // TODO count failures - if too many in a row, just fail the process until app reset (kill the initial setInterval too!)
    // TODO create a delay then grab lat/long again and try once more?
    setTimeout(function() {
      console.log("retry entire weather fetch w new coords");
      weatherWidget();
    }, 5000);
    return;
  } else {
    // TODO reset the weather failure counter as we must have valid coords returned in wx fetch
  }
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

  blacklistButton.addEventListener("click", function () {
    
    const computedStyle = getComputedStyle(mainElement);
    let backgroundImageUrl = computedStyle.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
    backgroundImageUrl = stripQueryParams(backgroundImageUrl);
    // above strips the unsplash url to clean it and simplify
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
      opensnack('blocked image','warn')
      //reviewBlacklistBackgrounds();
    } else {
      opensnack('already blocked','warn')
    }
    // grab a new bg image
    fetchDataAndUpdateStorage(true); // true param forces a refresh regardless of timer

    // refresh the review list
    //reviewBlacklistBackgrounds();
  });

  function stripQueryParams(url) {
    const index = url.indexOf('?');
    if (index !== -1) {
      return url.substring(0, index);
    }
    return url;
  }
}

function reviewBlacklistBackgrounds() {
  const imageModal = document.getElementById("imageModal");
  // const modalImage = document.getElementById("modalImage");
  // const removeFromBlacklist = document.getElementById("removeFromBlacklist");
  // const prevButton = document.getElementById("prevButton");
  // const nextButton = document.getElementById("nextButton");
  const closeModal = document.getElementById("closeModal");
  const blacklistreviewButton = document.getElementById("blacklistreviewButton");

  console.log('in reviewblacklistbackgrounds')
 
  let blacklistUrls = [];

  // Load blacklist URLs from localStorage
  if (localStorage.getItem("blacklist")) {
    blacklist = JSON.parse(localStorage.getItem("blacklist"));
    blacklistUrls = Object.keys(blacklist);
  } else  {
    //console.log('no photos in blacklist')
    opensnack('no photos in block list','error');
    return;
  }

  //blacklistUrls = Object.keys(blacklist);
  setTabTitle('review blacklisted images');
  if (blacklistUrls.length > 0) {
    //showImage();
    imageModal.classList.toggle('config-panel-open');
  } else {
    opensnack('no photos in block list','error');
    return;
  }




  // blacklistedimages = div ID for container:
  const blacklistedImagesDiv = document.getElementById('blacklistedimages');
  blacklistedImagesDiv.innerHTML = '';
  // display images in a vertical list
  
  blacklistUrls.forEach(function(url,index) {
    const image = document.createElement('img');
    image.className = "blacklistimage-preview";
    image.src = url + '?q=75&w=270&fit=max';
    image.alt = url;
    image.loading = 'lazy';

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

      const imageUrlToRemove = blacklistUrls[index];
      console.log('blacklisturls:',blacklistUrls)
      console.log(imageUrlToRemove)
      console.log(index)
      delete blacklist[imageUrlToRemove];
      localStorage.setItem("blacklist", JSON.stringify(blacklist));
    });
  });

  // Add a click event listener to close the modal
  closeModal.addEventListener("click", closeWindow);
  function closeWindow() {
    imageModal.classList.toggle('config-panel-open');
    setTabTitle('reset');
    closeModal.removeEventListener("click",closeWindow);
  }
}

function configModal() {
  const configModal = document.getElementById('configModal');
  const openConfigIcon = document.getElementById("open-config-icon");
  const closeModal = document.getElementById("closeConfigModal");
  const saveButton = document.getElementById('saveConfig');
  const configForm = document.getElementById('configForm');

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
  //document.getElementById("imageTimer").value = configData.imageTimer;

  // deal with the image change timer (default to 60mins)
  document.querySelector('input[type="radio"][name="timer-group"][value="60"]').checked = true;
  document.querySelectorAll('input[type="radio"][name="timer-group"]').forEach(function (radioButton) {
    if (parseInt(radioButton.value, 10) === configData.imageTimer) {
      radioButton.checked = true;
    }
  });


  if(configData.gitLink !== null) {
    document.getElementById("gitLink").checked = true;
  } else {
    document.getElementById("gitLink").checked = false;
  }
  
  if(configData.googledriveLink !== null) {
    document.getElementById("googledriveLink").checked = true;
  } else {
    document.getElementById("googledriveLink").checked = false;
  }

  if(configData.dropboxLink !== null) {
    document.getElementById("dropboxLink").checked = true;
  } else {
    document.getElementById("dropboxLink").checked = false;
  }

  if(configData.amazonLink !== null) {
    document.getElementById("amazonLink").checked = true;
  } else {
    document.getElementById("amazonLink").checked = false;
  }
  
  document.getElementById("topTen").checked = configData.showTopten || false;
  document.getElementById("clockType").checked = configData.clockType || false;
  document.getElementById("weatherApp").checked = configData.showWeather || false;
  
  saveButton.addEventListener('click', formClickHandler);
  configForm.addEventListener('keypress',function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      event.preventDefault();
      formClickHandler();
    }
  });


  //saveButton.addEventListener('click', function(event) {
  function formClickHandler() {
    const formElement = document.getElementById('configForm'); // Replace 'yourFormId' with your actual form ID
    const formData = new FormData(formElement);
    let fetchNewImage = false;

    

    // Access form fields and values
    const newBackgroundTheme = sanitizeInput(formData.get('backgroundTheme'));
    // different search word entered, we'll need to force refresh
    if(newBackgroundTheme != configData.backgroundTheme) {
      fetchNewImage = true;
      configData.backgroundTheme = newBackgroundTheme;
    }
    // configData.backgroundTheme = formData.get('backgroundTheme');
    
    configData.gitLink = formData.get('gitLink');
    configData.googledriveLink = formData.get('googledriveLink'); // checkboxes are null or ""
    configData.dropboxLink = formData.get('dropboxLink');
    configData.amazonLink = formData.get('amazonLink');
    configData.clockType = formData.get('clockType');
    configData.showTopten =  formData.get('topTen');
    configData.showWeather =  formData.get('weatherApp');

    const selectedValue = document.querySelector('input[type="radio"][name="timer-group"]:checked').value;
    if (selectedValue) {
      const selectedNumber = parseInt(selectedValue, 10);
      if (!isNaN(selectedNumber)) {
        configData.imageTimer = selectedNumber;
      }
    }

    // TODO error checking
    saveConfig();
    setAppDrawer();
    if(fetchNewImage) {
      fetchDataAndUpdateStorage(true);
    }
//  });
  }

}

function setTabTitle(newTitle) {
  const tabTitle = document.title;
  if (newTitle === 'reset') {
    document.title = configData.appName;
    return;
  }
  document.title = newTitle + " - " + configData.appName;
}


function getFormattedDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // January is 0, so we add 1
  const day = today.getDate();

  // Convert each part to a string and pad with a leading zero if needed
  const formattedYear = year.toString();
  // const formattedMonth = month < 10 ? `0${month}` : month.toString();
  // const formattedDay = day < 10 ? `0${day}` : day.toString();
  const formattedMonth = month.toString();
  const formattedDay = day.toString();

  // Concatenate the parts with '-' to get the desired format
  const formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;

  return formattedDate;
}

function setIconBadge(elementID,status) {
  const iconElement = document.getElementById(elementID);
  if (iconElement) {
    // Check if the badge element already exists, and if not, create it
    let badgeElement = iconElement.querySelector('.badge');
    if (!badgeElement) {
      badgeElement = document.createElement('span');
      badgeElement.className = 'badge';
      //badgeElement.textContent = '*';
      badgeElement.innerHTML = '<i class="fa-solid fa-certificate"></i>';
      iconElement.appendChild(badgeElement);
      //iconElement.parentNode.insertBefore(badgeElement,iconElement);
    }
    if (status === 'remove') {
      badgeElement.innerHTML="";
    }
  }
}

function removePaddingFromDate(dateString) {
  const [year, month, day] = dateString.split('-');
  const formattedYear = parseInt(year).toString();
  const formattedMonth = parseInt(month).toString();
  const formattedDay = parseInt(day).toString();
  
  const formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
  
  return formattedDate;
}

function sanitizeInput(input) {
  // Remove HTML tags
  const sanitizedText = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Remove JavaScript event handlers (e.g., onclick, onmouseover)
  const sanitizedTextWithoutEvents = sanitizedText.replace(/on\w+="[^"]*"/g, "");
  
  return sanitizedTextWithoutEvents;
}