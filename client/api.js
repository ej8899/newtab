
fetch(
  `https://erniejohnson.ca/tools/fetch.php?keyword=wolf`
)
  .then((response) => response.json())
  .then((imageResponse) => {
    console.log(imageResponse);
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

    const imageInfoDiv = document.querySelector('.image-info');

    // Assuming you have the following variables
    const imageDescription = imageResponse.description;
    const imageAuthor = imageResponse.user.name;
    const imageProfileURL = imageResponse.user.links.html;
    
    // Create a new paragraph element to hold the image description
    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.textContent = imageDescription;
    
    // Create a new anchor element to link to the author's profile URL
    const authorLink = document.createElement('a');
    authorLink.textContent = imageAuthor;
    authorLink.href = imageProfileURL;
    authorLink.target = '_blank'; // Open in a new tab
    
    // Append the description and author link to the imageInfoDiv
    imageInfoDiv.appendChild(descriptionParagraph);
    imageInfoDiv.appendChild(authorLink);
    
    
    mainElement.classList.add("main-fade-in");
  })
  .catch((err) => console.error(err));

