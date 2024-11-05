import { auth, db } from "../js/firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Function to add header and footer
async function loadHeaderFooter() {
    const response = await fetch("../components/header_footer.html");
    const text = await response.text();
    document.getElementById("header-placeholder").innerHTML = text.split('<footer>')[0];
    document.getElementById("footer-placeholder").innerHTML = "<footer>" + text.split('<footer>')[1];
}

loadHeaderFooter();

// Function to check if user is a business advisor and redirect if not
function checkAdvisorAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../pages/login.html";
    } else {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "businessAdvisor") {
        displayInformation();
        displayQueries();
      } else {
        alert("Access denied. Only business advisors can access this page.");
        window.location.href = "../pages/login.html";
      }
    }
  });
}

// Function to post information
async function postInformation(e) {
  e.preventDefault();
  const title = document.getElementById("info-title").value;
  const description = document.getElementById("info-description").value;

  try {
    await addDoc(collection(db, "advisorInformation"), { title, description });
    alert("Information posted successfully!");
    displayInformation();
    e.target.reset();
  } catch (error) {
    console.error("Error posting information:", error);
    alert("Failed to post information.");
  }
}

// Function to display posted information with edit and delete options
async function displayInformation() {
  const container = document.getElementById("info-container");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "advisorInformation"));
    container.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const info = doc.data();
      const infoDiv = document.createElement("div");
      infoDiv.classList.add("info-item");
      infoDiv.innerHTML = `
        <h3>${info.title}</h3>
        <p>${info.description}</p>
		<div class="query-button-group">
        <button onclick="editInfo('${doc.id}', '${info.title}', '${info.description}')">Edit</button>
        <button onclick="deleteInfo('${doc.id}')">Delete</button>
		</div>
      `;
      container.appendChild(infoDiv);
    });
  } catch (error) {
    console.error("Error loading information:", error);
    container.innerHTML = "<p>Error loading information.</p>";
  }
}

// Function to edit information
async function editInfo(infoId, currentTitle, currentDescription) {
  const newTitle = prompt("Edit Title:", currentTitle);
  const newDescription = prompt("Edit Description:", currentDescription);

  if (newTitle && newDescription) {
    try {
      await updateDoc(doc(db, "advisorInformation", infoId), {
        title: newTitle,
        description: newDescription,
      });
      alert("Information updated successfully!");
      displayInformation();
    } catch (error) {
      console.error("Error updating information:", error);
      alert("Failed to update information.");
    }
  }
}

// Function to delete information
async function deleteInfo(infoId) {
  if (confirm("Are you sure you want to delete this information?")) {
    try {
      await deleteDoc(doc(db, "advisorInformation", infoId));
      alert("Information deleted successfully!");
      displayInformation();
    } catch (error) {
      console.error("Error deleting information:", error);
      alert("Failed to delete information.");
    }
  }
}

window.editInfo = editInfo;
window.deleteInfo = deleteInfo;

document.addEventListener("DOMContentLoaded", () => {
  checkAdvisorAuth();
  document.getElementById("info-form").addEventListener("submit", postInformation);
});

// Logout functionality
document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "logout-btn") {
    auth.signOut().then(() => {
        window.location.href = "../pages/login.html"; 
      })
      .catch((error) => console.error("Error during logout:", error));
  }
});
