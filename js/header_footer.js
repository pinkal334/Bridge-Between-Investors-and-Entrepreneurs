import { auth, db } from "../js/firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Initialize authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        initializeListeners(); 
    } else {
        alert("Please log in to access this page.");
        window.location.href = "../pages/login.html"; 
    }
});

// Function to initialize listeners
function initializeListeners() {
    document.getElementById("logout-btn").addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "../pages/login.html";
        } catch (error) {
            console.error("Error during logout:", error);
        }
    });

    document.getElementById("search-bar").addEventListener("input", (event) => {
        const searchQuery = event.target.value;
        displayCategories(searchQuery);
    });
}

// Function to fetch and display business categories
async function displayCategories(searchQuery = "") {
    const categoriesContainer = document.getElementById("categories-container");
    categoriesContainer.innerHTML = "<p>Loading categories...</p>";

    try {
        const categoriesSnapshot = await getDocs(collection(db, "businessCategories"));
        categoriesContainer.innerHTML = ""; 

        if (categoriesSnapshot.empty) {
            categoriesContainer.innerHTML = "<p>No business categories available.</p>";
        } else {
            categoriesSnapshot.forEach((doc) => {
                const categoryData = doc.data();
                if (categoryData.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    const categoryElement = document.createElement("div");
                    categoryElement.classList.add("category");
                    categoryElement.innerHTML = `<h3>${categoryData.name}</h3><p>${categoryData.description}</p>`;
                    categoriesContainer.appendChild(categoryElement);
                }
            });
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        categoriesContainer.innerHTML = "<p>Error loading categories.</p>";
    }
}
