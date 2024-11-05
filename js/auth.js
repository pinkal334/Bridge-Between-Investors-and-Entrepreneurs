import { auth, db } from "../js/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Registration function
function handleRegistration() {
  const registerForm = document.getElementById("registration-form");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const roleData = getRoleData(role);

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone,
        role,
        ...roleData,
      });
      alert("Registration successful!");
    } catch (error) {
      alert(`Registration error: ${error.message}`);
    }
  });
}

// Function to get role-specific data
function getRoleData(role) {
  const data = {};
  if (role === "businessPerson")
    data.businessIdea = document.getElementById("business-idea").value;
  if (role === "investor") {
    data.investmentAmount = document.getElementById("investment-amount").value;
    data.investmentGoal = document.getElementById("investment-goal").value;
  }
  if (role === "banker")
    data.loanDetails = document.getElementById("loan-details").value;
  if (role === "businessAdvisor")
    data.advisorInformation = document.getElementById(
      "advisor-information"
    ).value;
  return data;
}

// Login function with role-based redirection
function handleLogin() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const role = document.getElementById("login-role").value;

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists() && userDoc.data().role === role) {
        switch (role) {
          case "businessPerson":
            window.location.href = "../pages/business_people.html";
            break;
          case "investor":
            window.location.href = "../pages/investor.html";
            break;
          case "banker":
            window.location.href = "../pages/banker.html";
            break;
          case "businessAdvisor":
            window.location.href = "../pages/business_advisor.html";
            break;
          default:
            window.location.href = "../pages/user.html"; // Default redirection for basic users
        }
      } else {
        alert("Role mismatch. Please check your role and try again.");
        auth.signOut();
      }
    } catch (error) {
      alert(`Login error: ${error.message}`);
    }
  });
}

// Initialize functions after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  handleRegistration();
  handleLogin();
});
