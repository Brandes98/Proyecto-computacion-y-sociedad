// js/requireAuth.js
import { onUserStateChange } from "./firebase/auth.js";

export function requireAuth() {
  onUserStateChange((user) => {
    if (!user) window.location.href = "login.html";
  });
}