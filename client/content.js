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

  // Send a message to the background script to trigger the function
  chrome.runtime.sendMessage({ action: "processHistory" }, function (response) {
    // Handle the response, which contains the top 10 websites
    if (response && response.length > 0) {
      const top10Container = document.getElementById("top10Container");

      // Create a grid layout with 5 columns and 2 rows
      top10Container.style.display = "grid";
      top10Container.style.gridTemplateColumns = "repeat(5, 1fr)";
      top10Container.style.gridGap = "20px";

      // Loop through the top 10 websites and create elements for each
      response.forEach(function (website, index) {
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
//
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

  // Event listener to save notes in local storage
  notesTextarea.addEventListener('input', function () {
      const notes = notesTextarea.value;
      localStorage.setItem('notes', notes);
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

  addTaskButton.addEventListener('click', function () {
      const taskText = taskInput.value.trim();
      if (taskText !== '') {
          const task = { text: taskText, completed: false };
          savedTasks.push(task);
          localStorage.setItem('tasks', JSON.stringify(savedTasks));
          addTaskToUI(task);
          taskInput.value = '';
      }
  });

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
            <caption>${monthNames[firstDay.getMonth()]} ${firstDay.getFullYear()}</caption>
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
                calendarHTML += `<td>${currentDay}</td>`;
                currentDay++;
            }
        }

        // End the current row
        calendarHTML += '</tr>';

        if (currentDay > daysInMonth) {
            // Exit the loop if all days have been displayed
            break;
        }
    }

    // Close the table
    calendarHTML += '</table>';

    return calendarHTML;
  }
}