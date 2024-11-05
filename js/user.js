import { auth, db } from "../js/firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Function to load header and footer
async function loadHeaderFooter() {
    const response = await fetch("../components/header_footer.html");
    const text = await response.text();
    document.getElementById("header-placeholder").innerHTML = text.split('<footer>')[0];
    document.getElementById("footer-placeholder").innerHTML = "<footer>" + text.split('<footer>')[1];
}

loadHeaderFooter();

// Function to check authentication and display categories if the user is logged in
function checkAuthAndDisplayCategories() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            displayCategories(); 
        } else {
            alert("Please log in to access this page.");
            window.location.href = "../pages/login.html"; 
        }
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

// Logout functionality
document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "logout-btn") {
        auth.signOut().then(() => {
            window.location.href = "../pages/login.html"; 
        }).catch(error => console.error("Error during logout:", error));
    }
});

document.addEventListener("DOMContentLoaded", checkAuthAndDisplayCategories);
