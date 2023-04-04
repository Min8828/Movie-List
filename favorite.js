// route
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = `${BASE_URL}/api/movies/`;
const POSTER_URL = `${BASE_URL}/posters/`;

const dataPanel = document.querySelector("#data-panel");
const favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

displayMoviesList(favoriteMovies);

dataPanel.addEventListener("click", (e) => {
  // show modal when pressing the More button
  if (e.target.matches(".btn-show-movie")) {
    showMovieModal(parseInt(e.target.dataset.id));
  }
  // store the movie to the localStorage
  if (e.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(parseInt(e.target.dataset.id));
    alert("Has removed successfully");
  }
});

// ----- function -----
function displayMoviesList(data) {
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">&#9587;</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML || "<h1>Try to add your favorite movies</h1>";
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

function removeFromFavorite(id) {
  if (!favoriteMovies || !favoriteMovies.length) return;

  // why not use filter? cuz, it doesn't make movie you selected actually remove from favoriteMovies
  const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id);
  if (movieIndex === -1) return;

  favoriteMovies.splice(movieIndex, 1);

  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));

  // redisplay favorite movies
  displayMoviesList(favoriteMovies);
}
