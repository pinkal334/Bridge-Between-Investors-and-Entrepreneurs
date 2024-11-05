document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("role").addEventListener("change", function () {
    document
      .querySelectorAll(".role-specific")
      .forEach((el) => (el.style.display = "none"));

    const selectedRole = this.value;

    if (selectedRole) {
      const fieldsElement = document.getElementById(`${selectedRole}-fields`);
      if (fieldsElement) {
        fieldsElement.style.display = "block";
      }
    }
  });
});
