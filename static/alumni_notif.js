// Initialize alumni notifications page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {

    // ================= SIDEBAR ARROW TOGGLE =================
    const sidebar   = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleBtn");

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
    if (sidebar) {
        restoreSidebarState();
    }

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
            saveSidebarState(); // Save state after toggle
        });
    }

    // ================= NOTIFICATION FUNCTIONALITY =================
    
    // Check for pending notification dot (Admin only)
    function checkPendingNotifs() {
        fetch('/api/pending-notif-count')
            .then(r => r.json())
            .then(data => {
                const dot = document.getElementById('sidebarNotifDot');
                if (dot) dot.style.display = data.count > 0 ? 'block' : 'none';
                // Update title badge
                const badge = document.querySelector('.tab-badge');
                if (badge) badge.textContent = data.count;
            }).catch(() => {});
    }

    // Initial check and set up polling
    checkPendingNotifs();
    setInterval(checkPendingNotifs, 30000);

    // ================= TAB FUNCTIONALITY =================
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.querySelector(`.tab-content[data-tab="${targetTab}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ================= APPROVE/DENY FUNCTIONALITY =================
    const approveBtns = document.querySelectorAll('.approve-btn');
    const denyBtns = document.querySelectorAll('.deny-btn');

    approveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            handleRequest(requestId, 'approved');
        });
    });

    denyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            handleRequest(requestId, 'denied');
        });
    });

    function handleRequest(requestId, action) {
        fetch('/api/handle-update-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                request_id: requestId,
                action: action
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                showNotification(`Request ${action} successfully`, 'success');
                // Remove the request row from DOM
                const row = document.querySelector(`[data-request-row="${requestId}"]`);
                if (row) {
                    row.remove();
                }
                // Refresh notification count
                checkPendingNotifs();
            } else {
                showNotification(data.error || 'Failed to process request', 'error');
            }
        })
        .catch(error => {
            showNotification('Network error. Please try again.', 'error');
        });
    }

    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});
