document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        console.log("Registration successful!");

        window.location.href = "home.html";
      } else {
        const errorData = await response.json();
        console.error(`Registration failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Internal server error");
    }
  });
});
