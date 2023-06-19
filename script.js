const _ = (elem) => document.querySelector(elem);
const BASE_URL = "https://www.omdbapi.com/";
const API_KEY = "63695bbb"; //Ideally, this will be saved in a separate environment

let arr = null;
let index = 0;
let doFilter = false; //this ensures that only works for a new search or when filter is cleared

const loadCriteriaValues = (data) => {
  const criterion = _("#filter-criteria").value.trim();
  if (criterion) {
    const uniqueItems = [...new Set(data.map((item) => item[`${criterion}`]))];
    const bufferedItems = uniqueItems.map(
      (item) => `<option value=${item}>${item}</option>`
    );
    _("#filter-value").innerHTML = bufferedItems.join("");
  }
};

const loadFilteredItems = (data) => {
  doFilter = true;
  const selectedIndex = _("#filter-value").selectedIndex;
  const filterValue =
    _("#filter-value").options[selectedIndex].textContent.trim();
  const criterion = _("#filter-criteria").value.trim();

  if (criterion && filterValue) {
    _("#movie-wrapper").innerHTML = "";
    data
      .filter((item) => item[`${criterion}`] === filterValue)
      .forEach((item) => loadContent(item));
  }
};

_("#filter-criteria").addEventListener("change", () => loadCriteriaValues(arr));
_("#filter-value").addEventListener("change", () => loadFilteredItems(arr));

//Propagate click event to get the exact movie whose SHOW MORE or LESS DETAILS button was clicked
_("#movie").addEventListener("click", (e) => {
  let target = e.target;

  if (target.classList.contains("btn-more-details")) {
    target.parentElement
      .querySelectorAll(".other-details")
      .forEach((item) => (item.style.display = "flex"));
    target.style.display = "none";

    target.parentElement.querySelector(".btn-less-details").style.display =
      "initial";
  }
  if (target.classList.contains("btn-less-details")) {
    target.parentElement
      .querySelectorAll(".other-details")
      .forEach((item) => (item.style.display = "none"));
    target.style.display = "none";

    target.parentElement.querySelector(".btn-more-details").style.display =
      "initial";
  }
});

_("#search-button").addEventListener("click", () => {
  index = 0;
  doFilter = false;
  const searchKeywords = _("#search-input").value.trim(); //remove any leading or trailing spaces
  if (searchKeywords) {
    _("#error-msg").style.display = "none";
    _("#top-spinner").style.display = "block"; //show the top spinner while fetching movies
    getMovieDetails(searchKeywords);
  }
});

const getMovieDetails = (searchKeywords) => {
  const URL = `${BASE_URL}?apikey=${API_KEY}&s=${searchKeywords}`;
  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      if (data.Response === "True") {
        _("#movie-wrapper").innerHTML = ""; //clear the current content of the result holder
        _("#filter-container").style.display = "flex";

        //make requests with all the imdb IDs of the movies fetched to get their full details
        const requests = data.Search.map((item) => item.imdbID).map((id) =>
          fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}`)
        );
        return Promise.all(requests);
      }
      //indicate that the movie the user wanted could not be found
      _("#error-msg").style.display = "block";
      _("#error-msg").textContent = data.Error;
      _("#top-spinner").style.display = "none";
      _("#filter-container").style.display = "none";
    })
    .then(
      (responses) =>
        responses && Promise.all(responses.map((details) => details.json())) //get the full details of all the movies
    )
    .then((data) => {
      if (data) {
        // loadCriteriaValues(data);
        arr = data; //save in a globally declared array for use in other parts of the code
        loadContent(data[index++]); //load the first item of fetched movies
        _("#top-spinner").style.display = "none";
      }
    })
    .catch((error) => {
      //show another error when users' request fails
      _("#error-msg").style.display = "block";
      _("#error-msg").textContent =
        "Operation failed. Check your network connection";
      _("#top-spinner").style.display = "none";
      _("#filter-container").style.display = "none";
      console.log("Request failed:", error);
    });
};

const loadContent = (obj) => {
  _("#movie-wrapper").innerHTML += prepareContent(obj);
};

const loadMoreContent = () => {
  if (index < arr.length) {
    //show the bottom spinner as long as there are still more content sto load as users scroll
    _("#bottom-spinner").style.display = "block";
    loadContent(arr[index++]);
  } else {
    //hide the bottom spinner once every content has fully loaded
    _("#bottom-spinner").style.display = "none";
  }
};

window.addEventListener("scroll", () => {
  if (
    //users must scroll one item out of view by at least 10px to load more content
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 10 &&
    !doFilter
  ) {
    loadMoreContent();
  }
});

const prepareContent = (movie) => {
  //since not all the movie items have a poster, such movies will use this dummy image as their poster
  //and to indicate that the movie does not have a poster
  const imageNotFoundURL = "./image-not-found.jpeg";
  return `
      <section class="movie-item">
          <article class="movie-poster">
              <img
                  src=${
                    !movie.Poster.includes("//")
                      ? imageNotFoundURL
                      : movie.Poster
                  }
                  alt=Poster of ${movie.Title}
              />
          </article>
          <article class="movie-details">
              <h3>${movie.Title}</h3>
  
              <ul>
                  <li class="movie-details-item">
                      <span class="movie-details-subject">Released:</span>
                      <span class="movie-details-description">${
                        movie.Released
                      }</span>
                  </li>
                  <li class="movie-details-item">
                      <span class="movie-details-subject">Year:</span>
                      <span class="movie-details-description">${
                        movie.Year
                      }</span>
                  </li>
                  <li class="movie-details-item">
                      <span class="movie-details-subject">Rating:</span>
                      <span class="movie-details-description">${
                        movie.imdbRating
                      }</span>
                  </li>
                  <li class="movie-details-item">
                      <span class="movie-details-subject">Rated:</span>
                      <span class="movie-details-description">${
                        movie.Rated
                      }</span>
                  </li>
                  <li class="movie-details-item other-details">
                      <span class="movie-details-subject">Plot:</span>
                      <span class="movie-details-description">${
                        movie.Plot
                      }</span>
                  </li>
                  <li class="movie-details-item other-details">
                      <span class="movie-details-subject">Actors:</span>
                      <span class="movie-details-description">${
                        movie.Actors
                      }</span>
                  </li>
  
                  <li class="movie-details-item other-details">
                      <span class="movie-details-subject">Genre:</span>
                      <span class="movie-details-description">${
                        movie.Genre
                      }</span>
                  </li>
                  <li class="movie-details-item other-details">
                      <span class="movie-details-subject">Language:</span>
                      <span class="movie-details-description">${
                        movie.Language
                      }</span>
                  </li>
                  <li class="movie-details-item other-details">
                      <span class="movie-details-subject">Awards:</span>
                      <span class="movie-details-description">${
                        movie.Awards
                      }</span>
                  </li>
                  <li class="movie-details-item other-details">
                      <span class="movie-details-subject">Writer:</span>
                      <span class="movie-details-description">${
                        movie.Writer
                      }</span>
                  </li>
               
              </ul>
  
              <button type="button" class="btn-details btn-more-details">
                  Show More Details
              </button>
              <button type="button" class="btn-details btn-less-details">
                  Show Less Details
              </button>
          </article>
      </section>
  `;
};

_("#clear-filter").addEventListener("click", () => {
  const searchKeywords = _("#search-input").value.trim();
  _("#filter-value").innerHTML = "";
  doFilter = false;
  index = 0;
  getMovieDetails(searchKeywords);
});
