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

// function to load header and footer
async function loadHeaderFooter() {
  const response = await fetch("../components/header_footer.html");
  const text = await response.text();
  document.getElementById("header-placeholder").innerHTML = text.split("<footer>")[0];
  document.getElementById("footer-placeholder").innerHTML = "<footer>" + text.split("<footer>")[1];
}

loadHeaderFooter();

// Check authentication and role
function checkAuthStatus() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../pages/login.html";
    } else {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "banker") {
        displayLoans();
      } else {
        alert("Access denied. Only bankers are allowed on this page.");
        window.location.href = "../pages/login.html";
      }
    }
  });
}

// Display loan details
async function displayLoans() {
  const loansContainer = document.getElementById("loans-container");
  loansContainer.innerHTML = "<p>Loading loans...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "loanDetails"));
    loansContainer.innerHTML = "";

    if (querySnapshot.empty) {
      loansContainer.innerHTML = "<p>No loan details found.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const loan = doc.data();
        const loanElement = document.createElement("div");
        loanElement.classList.add("loan");

        loanElement.innerHTML = `
          <h3>${loan.title}</h3>
          <p>${loan.description}</p>
          <div class="loan-button-group">
    		<button onclick="editLoan('${doc.id}', '${loan.title}', '${loan.description}')">Edit</button>
    		<button onclick="deleteLoan('${doc.id}')">Delete</button>
  		  </div>
        `;
        loansContainer.appendChild(loanElement);
      });
    }
  } catch (error) {
    console.error("Error fetching loans:", error);
    loansContainer.innerHTML = "<p>Error loading loans.</p>";
  }
}

// Add new loan details
async function addLoan(e) {
  e.preventDefault();
  const title = document.getElementById("loan-title").value;
  const description = document.getElementById("loan-description").value;

  try {
    const bankerId = auth.currentUser?.uid;
    if (!bankerId) {
      alert("You need to be logged in as a banker to add loan details.");
      return;
    }

    await addDoc(collection(db, "loanDetails"), {
      title,
      description,
      bankerId,
    });
    alert("Loan details added successfully!");
    displayLoans();
    e.target.reset();
  } catch (error) {
    console.error("Error adding loan details:", error);
    alert("Failed to add loan details.");
  }
}

// Edit loan details
async function editLoan(loanId, currentTitle, currentDescription) {
  const newTitle = prompt("Edit Title:", currentTitle);
  const newDescription = prompt("Edit Description:", currentDescription);

  if (newTitle && newDescription) {
    try {
      const loanRef = doc(db, "loanDetails", loanId);
      await updateDoc(loanRef, {
        title: newTitle,
        description: newDescription,
      });
      alert("Loan details updated successfully!");
      displayLoans();
    } catch (error) {
      console.error("Error updating loan details:", error);
      alert("Failed to update loan details.");
    }
  }
}

// Delete loan details
async function deleteLoan(loanId) {
  if (confirm("Are you sure you want to delete these loan details?")) {
    try {
      await deleteDoc(doc(db, "loanDetails", loanId));
      alert("Loan details deleted successfully!");
      displayLoans();
    } catch (error) {
      console.error("Error deleting loan details:", error);
      alert("Failed to delete loan details.");
    }
  }
}

// Logout functionality
document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "logout-btn") {
    auth
      .signOut()
      .then(() => {
        window.location.href = "../pages/login.html";
      })
      .catch((error) => console.error("Error during logout:", error));
  }
});

document.getElementById("loan-form").addEventListener("submit", addLoan);
document.addEventListener("DOMContentLoaded", checkAuthStatus);

window.editLoan = editLoan;
window.deleteLoan = deleteLoan;
