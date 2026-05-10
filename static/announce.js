document.addEventListener("DOMContentLoaded", function () {

    // ================= SAFE ELEMENT GETTER =================
    function get(el) {
        return document.getElementById(el);
    }

    // ================= FORM STATE PRESERVATION =================
    function preserveFormState() {
        const subjectInput = document.querySelector('input[name="subject"]');
        const messageInput = document.querySelector('textarea[name="message"]');
        
        if (subjectInput) localStorage.setItem('announcement_subject', subjectInput.value);
        if (messageInput) localStorage.setItem('announcement_message', messageInput.value);
    }

    function restoreFormState() {
        const subjectInput = document.querySelector('input[name="subject"]');
        const messageInput = document.querySelector('textarea[name="message"]');
        
        if (subjectInput) {
            const savedSubject = localStorage.getItem('announcement_subject');
            if (savedSubject) subjectInput.value = savedSubject;
        }
        
        if (messageInput) {
            const savedMessage = localStorage.getItem('announcement_message');
            if (savedMessage) messageInput.value = savedMessage;
        }
    }

    function clearFormState() {
        localStorage.removeItem('announcement_subject');
        localStorage.removeItem('announcement_message');
    }

    // Restore form state on page load
    restoreFormState();

    // Auto-save form state as user types
    const subjectInput = document.querySelector('input[name="subject"]');
    const messageInput = document.querySelector('textarea[name="message"]');
    
    if (subjectInput) {
        subjectInput.addEventListener('input', preserveFormState);
    }
    
    if (messageInput) {
        messageInput.addEventListener('input', preserveFormState);
    }

    // ================= REFS =================
    const selectAll    = get("selectAll");
    const checkboxes   = document.querySelectorAll(".alumniCheckbox");
    const searchForm   = document.querySelector(".search-box");
    const announceForm = document.querySelector(".announcement-form");
    const selectedList = get("selectedList");
    const selectedCount = get("selectedCount");
    const toggleBtn = get("toggleBtn");
    const sidebar = get("sidebar");

    // Clear form state when successfully submitted
    if (announceForm) {
        announceForm.addEventListener('submit', function() {
            // Don't clear immediately, wait for successful submission
            setTimeout(clearFormState, 1000);
        });
    }

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
        toggleBtn.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed");
            saveSidebarState(); // Save state after toggle
        });
    }

    // ================= ADVANCED FILTER PANEL TOGGLE =================
    const filterToggleBtn = get("filterToggleBtn");
    const filterPanel     = get("filterPanel");
    const filterChevron   = get("filterChevron");
    const filterCountBadge = get("filterCountBadge");

    // Count how many advanced filter fields are active (filled) on page load
    const filterFields = [
        "filter_program", "filter_major", "filter_lastname", "filter_firstname",
        "filter_address", "filter_contact", "filter_employment_status",
        "filter_sector", "filter_job_title"
    ];

    function countActiveFilters() {
        let count = 0;
        filterFields.forEach(function (name) {
            const el = document.querySelector('[name="' + name + '"]');
            if (el && el.value && el.value.trim() !== "") count++;
        });
        return count;
    }

    function updateFilterBadge() {
        if (!filterCountBadge) return;
        const count = countActiveFilters();
        if (count > 0) {
            filterCountBadge.textContent = count;
            filterCountBadge.style.display = "inline-block";
        } else {
            filterCountBadge.style.display = "none";
        }
    }

    // Auto-open filter panel if any filters are active on page load
    if (filterPanel) {
        const activeCount = countActiveFilters();
        if (activeCount > 0) {
            filterPanel.classList.add("open");
            if (filterToggleBtn) filterToggleBtn.classList.add("open");
        }
        updateFilterBadge();
    }

    if (filterToggleBtn && filterPanel) {
        filterToggleBtn.addEventListener("click", function () {
            filterPanel.classList.toggle("open");
            filterToggleBtn.classList.toggle("open");
        });
    }

    // Update badge count as user types in filter fields
    filterFields.forEach(function (name) {
        const el = document.querySelector('[name="' + name + '"]');
        if (el) {
            el.addEventListener("input", updateFilterBadge);
            el.addEventListener("change", updateFilterBadge);
        }
    });

    // ================= PERSISTENT SELECTION =================
    let selectedSet = new Set();
    let selectedMap = new Map();

    // ================= EXTRACT NAME FROM NEW HTML STRUCTURE =================
    function extractName(checkbox) {
        // new structure: .alumni-info > .alumni-name
        const nameEl = checkbox.closest("label").querySelector(".alumni-name");
        if (nameEl) return nameEl.textContent.trim();
        // fallback: strip email from raw text
        return checkbox.parentElement.textContent.replace(/\(.*?\)/g, "").trim();
    }

    // ================= BUILD SELECTED MAP =================
    checkboxes.forEach(cb => {
        selectedMap.set(cb.value, extractName(cb));
    });

    // ================= LOAD BACKEND SELECTIONS (NO DUPLICATES) =================
    const hiddenInputs = document.querySelectorAll('.search-box input[name="selected_alumni"]');
    hiddenInputs.forEach(input => {
        selectedSet.add(input.value);
    });

    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedSet.add(cb.value);
        }
    });

    // ================= RENDER SELECTED TAGS =================
    function renderSelectedList() {
        if (!selectedList) return;

        selectedList.innerHTML = "";

        selectedSet.forEach(id => {
            const name = selectedMap.get(id) || id;

            const tag = document.createElement("div");
            tag.className = "selected-tag";
            tag.innerHTML = `${name} <span data-id="${id}">&times;</span>`;
            selectedList.appendChild(tag);
        });

        if (selectedCount) {
            selectedCount.textContent = selectedSet.size + " selected";
        }

        // Remove button
        selectedList.querySelectorAll("span[data-id]").forEach(btn => {
            btn.addEventListener("click", function () {
                selectedSet.delete(this.getAttribute("data-id"));
                applySelection();
            });
        });
    }

    // ================= APPLY SELECTION STATE =================
    function applySelection() {
        checkboxes.forEach(cb => {
            const isSelected = selectedSet.has(cb.value);
            cb.checked = isSelected;
            const item = cb.closest("label");
            if (item) {
                item.classList.toggle("selected", isSelected);
            }
        });

        updateSelectAllState();
        renderSelectedList();
    }

    // ================= SELECT ALL STATE =================
    function updateSelectAllState() {
        if (!selectAll || checkboxes.length === 0) return;

        if (checkboxes.length <= 1) {
            selectAll.checked = false;
            return;
        }

        const checkedCount = [...checkboxes].filter(cb => selectedSet.has(cb.value)).length;
        selectAll.checked = checkedCount === checkboxes.length && checkedCount > 0;
    }

    if (selectAll) {
        selectAll.addEventListener("change", function () {
            checkboxes.forEach(cb => {
                if (selectAll.checked) {
                    selectedSet.add(cb.value);
                    selectedMap.set(cb.value, extractName(cb));
                } else {
                    selectedSet.delete(cb.value);
                }
            });
            applySelection();
        });
    }

    // ================= INDIVIDUAL CHECKBOX =================
    checkboxes.forEach(cb => {
        cb.addEventListener("change", function () {
            if (this.checked) {
                selectedSet.add(this.value);
                selectedMap.set(this.value, extractName(this));
            } else {
                selectedSet.delete(this.value);
            }
            applySelection();
        });
    });

    // ================= SEARCH FORM: SYNC SELECTIONS =================
    if (searchForm) {
        searchForm.addEventListener("submit", function () {
            searchForm.querySelectorAll('input[name="selected_alumni"]').forEach(e => e.remove());
            selectedSet.forEach(id => {
                const input = document.createElement("input");
                input.type  = "hidden";
                input.name  = "selected_alumni";
                input.value = id;
                searchForm.appendChild(input);
            });
        });
    }

    // ================= ANNOUNCEMENT FORM: SYNC SELECTIONS =================
    if (announceForm) {
        announceForm.addEventListener("submit", function () {
            announceForm.querySelectorAll('input[name="selected_alumni"]').forEach(e => e.remove());
            selectedSet.forEach(id => {
                const input = document.createElement("input");
                input.type  = "hidden";
                input.name  = "selected_alumni";
                input.value = id;
                announceForm.appendChild(input);
            });
        });
    }

    // ================= STATUS REFRESH FUNCTIONALITY =================
    const refreshStatusBtn = get("refreshStatusBtn");
    const statusList = get("statusList");

    function refreshStatus() {
        if (!refreshStatusBtn || !statusList) return;
        
        refreshStatusBtn.disabled = true;
        refreshStatusBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refreshing...
        `;

        fetch('/announcement?' + new Date().getTime())
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newStatusList = doc.getElementById('statusList');
                
                if (newStatusList) {
                    statusList.innerHTML = newStatusList.innerHTML;
                }
            })
            .catch(error => {
                console.error('Error refreshing status:', error);
            })
            .finally(() => {
                refreshStatusBtn.disabled = false;
                refreshStatusBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Refresh
                `;
            });
    }

    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener("click", refreshStatus);
    }

    // Auto-refresh every 30 seconds for Alumni Coordinators
    const userType = document.querySelector('.role-badge')?.textContent?.trim();
    if (userType === 'ALUMNI COORDINATOR' && statusList) {
        setInterval(refreshStatus, 30000);
    }

    // ================= ADMIN HISTORY TABS =================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    if (tabBtns.length > 0 && tabPanes.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and panes
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                this.classList.add('active');
                const targetPane = document.getElementById(targetTab + '-tab');
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }

    // ================= LOGOUT CONFIRMATION =================
    function confirmLogout() {
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to logout from the system?',
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

    // ================= ADMIN APPROVAL FORM HANDLING =================
    const actionForms = document.querySelectorAll('.action-form');
    
    actionForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const approvalAction = formData.get('approval_action');
            const requestId = formData.get('request_id');
            const adminNote = formData.get('admin_note');
            
            if (!approvalAction || !requestId) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Invalid approval request.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }
            
            const confirmTitle = approvalAction === 'approve' ? 'Approve Announcement?' : 'Reject Announcement?';
            const confirmText = approvalAction === 'approve' 
                ? 'This announcement will be approved and sent to all recipients.' 
                : 'This announcement request will be rejected.';
            const confirmIcon = approvalAction === 'approve' ? 'question' : 'warning';
            
            Swal.fire({
                title: confirmTitle,
                text: confirmText,
                icon: confirmIcon,
                showCancelButton: true,
                confirmButtonColor: approvalAction === 'approve' ? '#10b981' : '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: approvalAction === 'approve' ? 'Yes, Approve' : 'Yes, Reject',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Show loading
                    Swal.fire({
                        title: 'Processing...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    
                    // Submit the form
                    fetch('/announcement', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        // Check for success or error messages
                        const successAlert = doc.querySelector('.alert-success');
                        const errorAlert = doc.querySelector('.alert-error');
                        
                        if (successAlert) {
                            Swal.fire({
                                title: 'Success!',
                                text: successAlert.textContent.trim(),
                                icon: 'success',
                                confirmButtonColor: '#10b981'
                            }).then(() => {
                                window.location.reload();
                            });
                        } else if (errorAlert) {
                            Swal.fire({
                                title: 'Error!',
                                text: errorAlert.textContent.trim(),
                                icon: 'error',
                                confirmButtonColor: '#dc3545'
                            });
                        } else {
                            Swal.fire({
                                title: 'Success!',
                                text: approvalAction === 'approve' 
                                    ? 'Announcement approved successfully.' 
                                    : 'Announcement rejected successfully.',
                                icon: 'success',
                                confirmButtonColor: '#10b981'
                            }).then(() => {
                                window.location.reload();
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'Network error. Please try again.',
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    });
                }
            });
        });
    });

    // ================= LOGOUT BUTTON EVENT LISTENER =================
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

    // INIT
    applySelection();

});