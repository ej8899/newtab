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

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const dayOfWeek = daysOfWeek[now.getDay()];
  const month = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();

  const currentDate = `${dayOfWeek}, ${month} ${day}, ${year}`;

  const currentTime = `${hours}:${minutes}`;
  

  timeElement.textContent = currentTime;
  dateElement.textContent = currentDate;
}

setInterval(updateTime, 1000); // Update every second
updateTime(); // Initial update






//
// notepad wiget
//
document.addEventListener('DOMContentLoaded', function () {
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
  
});