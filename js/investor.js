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

// Function to load header and footer
async function loadHeaderFooter() {
  const response = await fetch("../components/header_footer.html");
  const text = await response.text();
  document.getElementById("header-placeholder").innerHTML =
    text.split("<footer>")[0];
  document.getElementById("footer-placeholder").innerHTML =
    "<footer>" + text.split("<footer>")[1];
}

loadHeaderFooter();

// Function to check if user is an investor and redirect if not
function checkAuthStatus() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../pages/login.html";
    } else {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "investor") {
        displayProposals();
      } else {
        alert("Access denied. Only investors are allowed on this page.");
        window.location.href = "../pages/login.html";
      }
    }
  });
}

// Function to display proposals for investors
async function displayProposals() {
  const proposalsContainer = document.getElementById("proposals-container");
  proposalsContainer.innerHTML = "<p>Loading proposals...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "investorProposals"));
    proposalsContainer.innerHTML = "";

    if (querySnapshot.empty) {
      proposalsContainer.innerHTML = "<p>No proposals found.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const proposal = doc.data();
        const proposalElement = document.createElement("div");
        proposalElement.classList.add("proposal");

        proposalElement.innerHTML = `
			<h3>${proposal.title}</h3>
			<p>${proposal.description}</p>
			<div class="button-group">
			  <button onclick="editProposal('${doc.id}', '${proposal.title}', '${proposal.description}')">Edit</button>
			  <button onclick="deleteProposal('${doc.id}')">Delete</button>
			</div>
		  `;
        proposalsContainer.appendChild(proposalElement);
      });
    }
  } catch (error) {
    console.error("Error fetching proposals:", error);
    proposalsContainer.innerHTML = "<p>Error loading proposals.</p>";
  }
}

// Function to add a new proposal
async function addProposal(e) {
  e.preventDefault();
  const title = document.getElementById("proposal-title").value;
  const description = document.getElementById("proposal-description").value;

  try {
    const investorId = auth.currentUser?.uid;
    if (!investorId) {
      alert("You need to be logged in as an investor to add a proposal.");
      return;
    }

    await addDoc(collection(db, "investorProposals"), {
      title,
      description,
      investorId,
    });
    alert("Proposal added successfully!");
    displayProposals();
    e.target.reset();
  } catch (error) {
    console.error("Error adding proposal:", error);
    alert("Failed to add proposal.");
  }
}

// Function to edit a proposal
async function editProposal(proposalId, currentTitle, currentDescription) {
  const newTitle = prompt("Edit Title:", currentTitle);
  const newDescription = prompt("Edit Description:", currentDescription);

  if (newTitle && newDescription) {
    try {
      const proposalRef = doc(db, "investorProposals", proposalId);
      await updateDoc(proposalRef, {
        title: newTitle,
        description: newDescription,
      });
      alert("Proposal updated successfully!");
      displayProposals();
    } catch (error) {
      console.error("Error updating proposal:", error);
      alert("Failed to update proposal.");
    }
  }
}

// Function to delete a proposal
async function deleteProposal(proposalId) {
  if (confirm("Are you sure you want to delete this proposal?")) {
    try {
      await deleteDoc(doc(db, "investorProposals", proposalId));
      alert("Proposal deleted successfully!");
      displayProposals();
    } catch (error) {
      console.error("Error deleting proposal:", error);
      alert("Failed to delete proposal.");
    }
  }
}

window.editProposal = editProposal;
window.deleteProposal = deleteProposal;

document.getElementById("proposal-form").addEventListener("submit", addProposal);
document.addEventListener("DOMContentLoaded", checkAuthStatus);

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
