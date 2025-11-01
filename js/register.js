// js/register.js
import { registerUser } from "./firebase/auth.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await registerUser(name, email, password);
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    window.location.href = "login.html";
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});
