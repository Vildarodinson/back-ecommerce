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

      const result = await response.json();

      if (result.message === "Login successful!") {
        document.getElementById("loginMessage").textContent = result.message;

        document.cookie = `userId=${result.userId}; path=/;`;

        setTimeout(function () {
          window.location.href = "home.html";
        }, 500);
      } else {
        document.getElementById("loginMessage").textContent = result.error;
      }
    });
});
