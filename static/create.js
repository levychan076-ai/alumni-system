// ================= SIDEBAR TOGGLE (Arrow style, matching records.js) =================
document.addEventListener("DOMContentLoaded", function () {

    const sidebar   = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleBtn");

    if (toggleBtn && sidebar) {
        // Function to save sidebar state
        function saveSidebarState() {
            const isCollapsed = sidebar.classList.contains("collapsed");
            localStorage.setItem("sidebar_collapsed", isCollapsed);
        }

        // Function to restore sidebar state
        function restoreSidebarState() {
            const isCollapsed = localStorage.getItem("sidebar_collapsed") === "true";
            if (isCollapsed) {
                sidebar.classList.add("collapsed");
            } else {
                sidebar.classList.remove("collapsed");
            }
        }

        // Restore state on page load
        restoreSidebarState();

        toggleBtn.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed");
            saveSidebarState(); // Save state after toggle
        });
    }

    // AUTO SELECT FIRST USER
    const firstUser = document.querySelector(".user-item");
    if (firstUser) {
        firstUser.classList.add("active");
        firstUser.click();
    }

    // INIT SEARCH FILTER
    initUserSearch();
});


// ================= LOAD USER (NO RELOAD) =================
function loadUser(id, element) {

    fetch(`/get-user/${id}`)
        .then(function (res) {
            if (!res.ok) throw new Error("Failed to load user");
            return res.json();
        })
        .then(function (data) {

            const info  = data.info  || {};
            const login = data.login || {};

            document.getElementById("details").innerHTML = `
                <p><b>Address:</b> ${info.address  || '-'}</p>
                <p><b>Email:</b> ${info.email      || '-'}</p>
                <p><b>Contact:</b> ${info.contact  || '-'}</p>
                <p><b>Added By:</b> ${info.addedBy || '-'}</p>
                <p><b>Date Added:</b> ${info.dateAdded || '-'}</p>
                <hr>
                <p><b>Username:</b> ${login.username  || '-'}</p>
                <p><b>Password:</b> ${login.password  || '-'}</p>
                <p><b>User Type:</b> ${login.user_type || '-'}</p>
            `;

            // ACTIVE STATE
            document.querySelectorAll(".user-item").forEach(function (el) {
                el.classList.remove("active");
            });

            if (element) {
                element.classList.add("active");
            }
        })
        .catch(function (err) {
            console.error("ERROR:", err);
        });
}


// ================= SEARCH FILTER =================
function initUserSearch() {

    let searchInput = document.getElementById("userSearch");

    if (!searchInput) {
        searchInput = document.createElement("input");
        searchInput.id          = "userSearch";
        searchInput.placeholder = "Search user...";
        searchInput.className   = "user-search";

        const userList = document.querySelector(".user-list");
        if (userList) {
            userList.prepend(searchInput);
        }
    }

    searchInput.addEventListener("keyup", function () {
        const value = this.value.toLowerCase();
        document.querySelectorAll(".user-item").forEach(function (user) {
            user.style.display = user.textContent.toLowerCase().includes(value) ? "block" : "none";
        });
    });
}