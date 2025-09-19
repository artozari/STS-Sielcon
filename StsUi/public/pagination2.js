console.log("pagination2.js");

// tablaDeDia;
const tablaDeDia = document.getElementById("styled-table");

addEventListener("DOMContentLoaded", () => {
  const rows = Array.from(table.querySelectorAll("tr"));
  const pagination = document.createElement("div");
  pagination.classList.add("pagination");
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.classList.add("prev");
  pagination.appendChild(prevButton);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.classList.add("next");
  pagination.appendChild(nextButton);

  table.parentNode.insertBefore(pagination, table.nextSibling);
});
