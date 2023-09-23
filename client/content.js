// content.js


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
    console.log("in form submit - query is:",query);
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
// notepad widget
//
document.addEventListener('DOMContentLoaded', function () {
  todoWidget();
  notesWidget();
  aboutWidget();
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
