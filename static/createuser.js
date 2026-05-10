// createuser.js — NEUST Create User Account Page

// ===== SIDEBAR TOGGLE =====
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');

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

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        saveSidebarState(); // Save state after toggle
    });
}

// ===== PASSWORD TOGGLE =====
function togglePw() {
    const inp = document.getElementById('passwordInput');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ===== LOAD USER MODAL =====
function loadUser(id) {
    const modal = document.getElementById('userModal');
    const body = document.getElementById('modalBody');

    body.innerHTML = '<div class="loading-spin"></div>';
    modal.classList.add('open');

    fetch(`/get-user/${id}`)
        .then(r => r.json())
        .then(data => {
            const info = data.info || {};
            const login = data.login || {};

            const typeClass = login.user_type === 'ADMIN' ? 'badge-admin' : 'badge-coordinator';
            const typeLabel = login.user_type || '—';

            body.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Username</span>
                    <span class="detail-value">${login.username || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">User Type</span>
                    <span class="detail-value">
                        <span class="badge-type ${typeClass}">${typeLabel}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${info.email || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contact</span>
                    <span class="detail-value">${info.contact || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address</span>
                    <span class="detail-value">${info.address || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Added By</span>
                    <span class="detail-value">${info.addedBy || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date Added</span>
                    <span class="detail-value">${info.dateAdded || '—'}</span>
                </div>
            `;
        })
        .catch(() => {
            body.innerHTML = '<p style="color:#dc2626;font-size:13px;text-align:center;">Failed to load user details.</p>';
        });
}

function closeModal(e) {
    if (e.target === document.getElementById('userModal')) {
        document.getElementById('userModal').classList.remove('open');
    }
}