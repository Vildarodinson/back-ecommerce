document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("loginForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.text();

      if (result.includes("successful")) {
        document.getElementById("loginMessage").textContent = result;
        setTimeout(function () {
          window.location.href = "home.html";
        }, 10);
      } else {
        document.getElementById("loginMessage").textContent = result;
      }
    });
});
