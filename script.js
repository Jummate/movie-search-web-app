const _ = (elem) => document.querySelector(elem);

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
  const searchKeywords = _("#search-input").value.trim();
  getMovieDetails(searchKeywords);
});

const getMovieDetails = (searchKeywords) => {
  const URL = `https://www.omdbapi.com/?apikey=63695bbb&s=${searchKeywords}`;
  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      const ids = data.Search.map((item) => item.imdbID);
      const requests = ids.map((id) =>
        fetch(`https://www.omdbapi.com/?apikey=63695bbb&i=${id}`)
      );
      return Promise.all(requests);
    })
    .then((responses) =>
      Promise.all(responses.map((details) => details.json()))
    )
    .then((data) => renderMovieDetails(data))
    .catch((error) => console.error(error));
};

const renderMovieDetails = (movies) => {
  const imageNotFoundURL = "./image-not-found.jpeg";
  const res = movies.map((movie) => {
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
  });

  _("#movie").innerHTML = res.join("");
};
// window.addEventListener("DOMContentLoaded", () => {
//   getMovieDetails("Spiderman");
// });
