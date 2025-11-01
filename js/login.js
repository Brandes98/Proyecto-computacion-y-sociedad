// js/login.js
import { loginUser } from "./firebase/auth.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await loginUser(email, password);
    alert("Sesión iniciada correctamente.");
    window.location.href = "index.html"; // o dashboard.html
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});
