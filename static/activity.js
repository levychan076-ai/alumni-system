document.addEventListener("DOMContentLoaded", function () {

    // ================= SIDEBAR TOGGLE =================
    function initSidebar() {
        const sidebar = document.getElementById("sidebar");
        const toggleBtn = document.getElementById("toggleBtn");

        if (!sidebar || !toggleBtn) return;

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

    initSidebar();

    // ================= LOGOUT BUTTON =================
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('Logout button found:', logoutBtn); // Debug log
    
    if (logoutBtn) {
        console.log('Adding click event listener to logout button'); // Debug log
        logoutBtn.addEventListener('click', function(e) {
            console.log('Logout button clicked'); // Debug log
            e.preventDefault();
            confirmLogout();
        });
    } else {
        console.error('Logout button not found!'); // Debug log
    }

    // ================= LOGOUT CONFIRMATION =================
    function confirmLogout() {
        console.log('confirmLogout function called'); // Debug log
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/logout';
            }
        });
    }

    // ================= AUTO RELOAD EVERY 10 SECONDS =================
    setInterval(function () {
        location.reload();
    }, 10000);

});