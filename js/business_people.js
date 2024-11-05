import { auth, db } from "../js/firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Load header and footer content dynamically
async function loadHeaderFooter() {
  try {
    const response = await fetch("../components/header_footer.html");
    const text = await response.text();
    const [headerContent, footerContent] = text.split("<footer>");

    document.getElementById("header-placeholder").innerHTML = headerContent;
    document.getElementById("footer-placeholder").innerHTML = "<footer>" + footerContent;
  } catch (error) {
    console.error("Error loading header and footer:", error);
  }
}

// Call function to load header and footer
loadHeaderFooter();

// Display user's business ideas on the page
async function displayIdeas() {
  const ideasContainer = document.getElementById("ideas-container");
  ideasContainer.innerHTML = "<p>Loading your ideas...</p>";

  try {
    const user = auth.currentUser;
    if (!user) {
      ideasContainer.innerHTML = "<p>No user is logged in.</p>";
      return;
    }

    // Fetch all ideas from Firestore in the "businessIdeas" collection
    const querySnapshot = await getDocs(collection(db, "businessIdeas"));
    ideasContainer.innerHTML = ""; 

    // Loop through each document in the query results
    querySnapshot.forEach((doc) => {
      const idea = doc.data();
      if (idea.ownerId === user.uid) {
        const ideaElement = document.createElement("div");
        ideaElement.classList.add("idea");

        // Generate HTML structure for each idea, including Edit and Delete buttons
        ideaElement.innerHTML = `
          <h3>${idea.title || "Untitled"}</h3>
          <p>${idea.description || "No description available"}</p>
          <div class="button-group">
            <button onclick="editIdea('${doc.id}', '${idea.title}', '${
          idea.description
        }')">Edit</button>
            <button onclick="deleteIdea('${doc.id}')">Delete</button>
          </div>
        `;
        ideasContainer.appendChild(ideaElement);
      }
    });
  } catch (error) {
    console.error("Error loading ideas:", error);
    ideasContainer.innerHTML = "<p>Error loading your ideas.</p>";
  }
}

// Add a new business idea to the database
async function addNewIdea(e) {
  e.preventDefault(); 
  const title = document.getElementById("idea-title").value;
  const description = document.getElementById("idea-description").value;

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("You need to be logged in to add an idea.");
      return;
    }

    // Add new idea to the "businessIdeas" collection with the user's ID
    await addDoc(collection(db, "businessIdeas"), {
      title,
      description,
      ownerId: user.uid,
    });

    alert("Idea added successfully!");
    displayIdeas(); 
    e.target.reset(); 
  } catch (error) {
    console.error("Error adding idea:", error);
    alert("Failed to add idea.");
  }
}

// Edit an existing idea by updating title and description in Firestore
window.editIdea = async function (ideaId, title, description) {
  const newTitle = prompt("Edit Title:", title);
  const newDescription = prompt("Edit Description:", description);

  if (newTitle && newDescription) {
    try {
      const ideaRef = doc(db, "businessIdeas", ideaId);
      await updateDoc(ideaRef, {
        title: newTitle,
        description: newDescription,
      });
      alert("Idea updated successfully!");
      displayIdeas(); 
    } catch (error) {
      console.error("Error updating idea:", error);
      alert("Failed to update idea.");
    }
  }
};

// Delete an idea from Firestore after user confirms
window.deleteIdea = async function (ideaId) {
  if (confirm("Are you sure you want to delete this idea?")) {
    try {
      await deleteDoc(doc(db, "businessIdeas", ideaId));
      alert("Idea deleted successfully!");
      displayIdeas(); 
    } catch (error) {
      console.error("Error deleting idea:", error);
      alert("Failed to delete idea.");
    }
  }
};

// Execute when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      displayIdeas(); 

      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          await auth.signOut();
          window.location.href = "../pages/login.html"; 
        });
      }
    } else {
      alert("You need to be logged in to view this page.");
      window.location.href = "../pages/login.html";
    }
  });

  // Handle new idea form submission
  const newIdeaForm = document.getElementById("new-idea-form");
  if (newIdeaForm) {
    newIdeaForm.addEventListener("submit", addNewIdea);
  }
});
