// route
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = `${BASE_URL}/api/movies/`;
const POSTER_URL = `${BASE_URL}/posters/`;
const MOVIE_PER_PAGE = 12;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modeDisplayChange = document.querySelector("#display-mode-change");
const totalSearchResult = document.querySelector("#movies-filter-result");
const navbar = document.querySelector(".navbar");

const movies = []; // get all movie data initially
let favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || []; // get the current favorite movies from the localStorage
let homePageMovies = []; //  get the whole movies except for the favorite movies
let filteredMovies = []; // get movies by searching
let currentPage = 1;

// initialization
axios
  .get(INDEX_URL)
  .then((res) => {
    // get all movies
    movies.push(...res.data.results);

    // get the whole movies except for the favorite movies
    homePageMovies = movies.filter(
      (movie) =>
        !favoriteMovies.some(
          (favoriteMovie) => favoriteMovie.title === movie.title
        )
    );

    // display movie list and show page 1
    displayMovies(getMoviesByPage(currentPage));
    // display paginator
    displayPaginator(homePageMovies.length);
  })
  .catch((err) => console.log(err));

// handle the movie you click such as more info and add to your favorite
dataPanel.addEventListener("click", (e) => {
  // show modal when pressing the More button
  if (e.target.matches(".btn-show-movie")) {
    showMovieModal(parseInt(e.target.dataset.id));
  }
  // store the movie to the localStorage
  else if (
    e.target.matches(".btn-add-favorite") ||
    e.target.matches(".btn-remove-favorite")
  ) {
    if (e.target.matches(".btn-add-favorite")) {
      addToFavorite(parseInt(e.target.dataset.id));
      // change the "+" button into the "♥"
      e.target.innerHTML = "&hearts;";
    } else {
      removeFromFavorite(parseInt(e.target.dataset.id));
      // change the "♥" button into the "+"
      e.target.innerHTML = "&plus;";
    }

    // change the button state
    e.target.classList.toggle("btn-add-favorite");
    e.target.classList.toggle("btn-remove-favorite");
    e.target.classList.toggle("btn-info");
    e.target.classList.toggle("btn-danger");
  }
});

// store the favorite movies to the localStorage when switching to the favorite page
navbar.addEventListener("click", (e) => {
  if (!favoriteMovies.length) return;

  if (e.target.matches("#favorite-page")) {
    localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
  }
});

// search bar submit
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  const originalKeyword = searchInput.value.trim();

  // clear the previous search result
  totalSearchResult.innerText = ``;
  if (
    totalSearchResult.classList.contains("alert-success") ||
    totalSearchResult.classList.contains("alert-warning")
  ) {
    totalSearchResult.classList.remove("alert-success");
    totalSearchResult.classList.remove("alert-warning");
  }

  // not input anything
  if (!keyword.length) alert("Please enter valid string!");

  // filter movies that match the keyword
  filteredMovies = homePageMovies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  // if not found, do not rerender
  if (!filteredMovies.length) {
    totalSearchResult.classList.add("alert-warning");
    return (totalSearchResult.innerText = `Sorry, the data you searched for "${originalKeyword}" could not be found `);
  }

  totalSearchResult.classList.add("alert-success");
  totalSearchResult.innerText = `Total search results ${filteredMovies.length} items`;

  // change the number of pages to the first page
  currentPage = 1;

  displayMovies(getMoviesByPage(currentPage));
  displayPaginator(filteredMovies.length);
});

// when you're typing the search bar, the movies will be filtered you typed
searchForm.addEventListener("input", (e) => {
  const keyword = e.target.value.trim().toLowerCase();

  // clear the previous search result
  totalSearchResult.innerText = ``;
  if (
    totalSearchResult.classList.contains("alert-success") ||
    totalSearchResult.classList.contains("alert-warning")
  ) {
    totalSearchResult.classList.remove("alert-success");
    totalSearchResult.classList.remove("alert-warning");
  }

  // filter movies that match the keyword
  filteredMovies = homePageMovies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  // if there is not filter result, display the whole movies
  if (!filteredMovies.length) {
    filteredMovies = movies;
  }

  // change the number of pages to the first page
  currentPage = 1;

  displayMovies(getMoviesByPage(currentPage));
  displayPaginator(filteredMovies.length);
});

// change the mode of movies display
modeDisplayChange.addEventListener("click", (e) => {
  if (e.target.matches("#card-mode-btn")) {
    changeDisplayMode("card-mode");
  } else if (e.target.matches("#list-mode-btn")) {
    changeDisplayMode("list-mode");
  }
});

// press the paginator
paginator.addEventListener("click", (e) => {
  if (e.target.tagName !== "A") return;
  currentPage = parseInt(e.target.dataset.page);
  const previousPageState = document.querySelector(".page-item.active");
  const currentPageState = e.target.parentElement;
  previousPageState.classList.remove("active");
  currentPageState.classList.add("active");
  displayMovies(getMoviesByPage(currentPage));
});

// ----- function -----
function displayMovies(data) {
  if (dataPanel.dataset.displayMode === "card-mode") {
    displayMoviesAsCards(data);
  } else if (dataPanel.dataset.displayMode === "list-mode") {
    displayMoviesAsLists(data);
  }
}

function displayMoviesAsCards(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <div class='card-img-container'>
              <img
                src="${POSTER_URL}${item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
            </div>
            <div class="card-body" style="height: 100px;">
              <h6 class="card-title">${item.title}</h6>
            </div>
            <div class="card-footer text-muted">
              <!-- Button trigger modal -->
              <button
                class="btn btn-primary btn-show-movie"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id="${item.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">&plus;</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

function displayMoviesAsLists(data) {
  let rawHTML = "";
  rawHTML += `
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
    `;
  // list-mode
  data.forEach((item) => {
    rawHTML += `
            <tr>
              <th scope="row">${item.title}</th>
              <td class="text-center">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button
                  class="btn btn-info btn-add-favorite"
                  data-id="${item.id}"
                >
                  &plus;
                </button>
              </td>
            </tr>
      `;
  });
  rawHTML += `
        </tbody>
      </table>
    `;
  dataPanel.innerHTML = rawHTML;
}

function changeDisplayMode(displayMode) {
  // do not display again if current mode is equal to your click mode
  if (dataPanel.dataset.displayMode === displayMode) return;

  dataPanel.dataset.displayMode = displayMode;
  const data = filteredMovies.length ? filteredMovies : homePageMovies;
  displayMovies(getMoviesByPage(currentPage));
  displayPaginator(data.length);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  // Eliminate afterimage
  modalTitle.textContent = "";
  modalImage.src = "";
  modalDate.textContent = "";
  modalDescription.textContent = "";

  axios
    .get(INDEX_URL + id)
    .then((res) => {
      const data = res.data.results;
      modalTitle.textContent = data.title;
      modalImage.src = `${POSTER_URL}${data.image}`;
      modalDate.textContent = `Release at: ${data.release_date}`;
      modalDescription.textContent = data.description;
    })
    .catch((err) => console.log(err));
}

function addToFavorite(id) {
  const movie = homePageMovies.find((movie) => movie.id === id);

  if (favoriteMovies.some((movie) => movie.id === id)) {
    return alert(
      "The movie you selected has already been on the favorite movie list."
    );
  }

  favoriteMovies.push(movie);
  alert("Added successfully");
}

function removeFromFavorite(id) {
  if (!favoriteMovies || !favoriteMovies.length) return;

  const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id);
  if (movieIndex === -1) return;

  favoriteMovies.splice(movieIndex, 1);
}

function getMoviesByPage(page) {
  // page 1 -> movies 0 - 11
  // page 2 -> movies 12 - 23
  // page 3 -> movies 24 - 35
  // ...

  // when searching the movie
  const data = filteredMovies.length ? filteredMovies : homePageMovies;
  const startIndex = (page - 1) * MOVIE_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

function displayPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    if (page === currentPage) {
      rawHTML += `<li class="page-item active"><a class="page-link " href="#" data-page="${page}">${page}</a></li>`;
      continue;
    }
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `;
  }
  paginator.innerHTML = rawHTML;
}
