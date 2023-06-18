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
