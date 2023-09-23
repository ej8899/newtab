
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

    // need to null check below:
    //title.innerHTML = imageDescription
    //description.innerHTML = imageDescription;
    
    mainElement.classList.add("main-fade-in");
  })
  .catch((err) => console.error(err));

