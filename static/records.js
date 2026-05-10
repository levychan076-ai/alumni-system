document.addEventListener("DOMContentLoaded", function () {


    // ================= SAFE ELEMENT GETTER =================
    function get(el) {
        return document.getElementById(el);
    }


    // ================= SIDEBAR TOGGLE (FIXED) =================
    function initSidebar() {
        const sidebar = get("sidebar");
        const toggleBtn = get("toggleBtn");

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


    // ================= SELECT ALL CHECKBOX (SAFE) =================
    function initCheckboxes() {

        const selectAll = get("selectAll");

        function getCheckboxes() {
            return document.querySelectorAll("input[name='selected_ids']");
        }

        if (!selectAll) return;

        selectAll.addEventListener("change", function () {
            getCheckboxes().forEach(cb => cb.checked = this.checked);
        });

        document.addEventListener("change", function (e) {
            if (e.target && e.target.name === "selected_ids") {

                const checkboxes = getCheckboxes();
                const checkedCount = document.querySelectorAll("input[name='selected_ids']:checked").length;

                if (selectAll) {
                    selectAll.checked = checkedCount === checkboxes.length;
                }
            }
        });
    }

    initCheckboxes();


    // ================= GENERATE FORM =================
    function initGenerateForm() {

        const generateForm = get("generateForm");

        if (!generateForm) return;

        generateForm.addEventListener("submit", function () {

            const selected = [];

            document.querySelectorAll("input[name='selected_ids']:checked")
                .forEach(cb => selected.push(cb.value));

            const hiddenInput = get("selected_ids");

            if (hiddenInput) {
                hiddenInput.value = selected.join(",");
            }
        });
    }

    initGenerateForm();


    // ================= SEARCH PERSIST (FIXED) =================
    function initSearch() {

        const searchInput = document.querySelector("input[name='search']");

        if (!searchInput) return;

        const urlParams = new URLSearchParams(window.location.search);
        const urlSearch = urlParams.get("search");

        if (urlSearch) {
            searchInput.value = urlSearch;
        }

        // Trim on blur only — do NOT strip special chars (breaks email/address search)
        searchInput.addEventListener("blur", function () {
            this.value = this.value.trim();
        });

        // Collapse multiple spaces while typing
        searchInput.addEventListener("input", function () {
            this.value = this.value.replace(/\s+/g, " ");
        });
    }

    initSearch();


    // ================= DOWNLOAD SEARCH RESULTS =================
    function initDownload() {

        const downloadCsvBtn   = get("downloadCsvBtn");
        const downloadExcelBtn = get("downloadExcelBtn");
        const downloadPdfBtn   = get("downloadPdfBtn");

        // Always reads live search value from the input, not just the URL,
        // so the export always matches exactly what the user searched.
        function getCurrentSearch() {
            const input = document.querySelector("input[name='search']");
            if (input && input.value.trim() !== "") {
                return input.value.trim();
            }
            // fallback: read from URL
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get("search") || "";
        }

        function buildDownload(format) {
            const search = encodeURIComponent(getCurrentSearch());
            return `/export-records?search=${search}&format=${format}`;
        }

        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener("click", function () {
                window.location.href = buildDownload("csv");
            });
        }

        if (downloadExcelBtn) {
            downloadExcelBtn.addEventListener("click", function () {
                window.location.href = buildDownload("excel");
            });
        }

        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener("click", function () {
                window.location.href = buildDownload("pdf");
            });
        }
    }

    initDownload();


    // ================= BULK EXPORT DROPDOWN =================
    function initBulkExport() {

        const bulkSelect = get("bulkExportSelect");

        if (!bulkSelect) return;

        bulkSelect.addEventListener("change", function () {

            const value = this.value;
            if (!value) return;

            // Read live search value from the input — not the URL —
            // so Quick Export always mirrors the current search results.
            const searchInput = document.querySelector("input[name='search']");
            const rawSearch   = searchInput ? searchInput.value.trim() : "";
            const search      = encodeURIComponent(rawSearch);

            let url = "";

            if (value === "search-excel") {
                url = `/export-records?search=${search}&format=excel`;
            }

            if (value === "search-pdf") {
                url = `/export-records?search=${search}&format=pdf`;
            }

            if (value === "all-excel") {
                url = `/export-records?search=&format=excel`;
            }

            if (value === "all-pdf") {
                url = `/export-records?search=&format=pdf`;
            }

            if (url) {
                window.location.href = url;
            }

            this.value = "";
        });
    }

    initBulkExport();


    // ================= ADVANCED FILTER MODAL =================
    function initAdvancedFilter() {

        const openBtn    = get("openFilterBtn");
        const closeBtn   = get("closeFilterBtn");
        const modal      = get("filterModal");
        const clearBtn   = get("filterClearBtn");
        const dlExcel    = get("filterDownloadExcel");
        const dlPdf      = get("filterDownloadPdf");
        const previewMsg = get("filterPreviewMsg");

        if (!modal) return;

        // ---- open / close ----
        if (openBtn) {
            openBtn.addEventListener("click", function () {
                modal.style.display = "flex";
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                modal.style.display = "none";
            });
        }

        // close when clicking outside modal box
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });

        // ---- clear all filter fields ----
        if (clearBtn) {
            clearBtn.addEventListener("click", function () {
                [
                    "f_date_from", "f_date_to",
                    "f_grad_from", "f_grad_to",
                    "f_program", "f_major",
                    "f_lastname", "f_firstname",
                    "f_address", "f_email", "f_contact"
                ].forEach(function (id) {
                    const el = get(id);
                    if (el) el.value = "";
                });

                if (previewMsg) {
                    previewMsg.style.display = "none";
                    previewMsg.textContent = "";
                }
            });
        }

        // ---- build query params from filter fields ----
        function buildFilterParams(format) {
            const params = new URLSearchParams();

            params.set("format", format);

            const fields = {
                "date_from" : "f_date_from",
                "date_to"   : "f_date_to",
                "grad_from" : "f_grad_from",
                "grad_to"   : "f_grad_to",
                "program"   : "f_program",
                "major"     : "f_major",
                "lastname"  : "f_lastname",
                "firstname" : "f_firstname",
                "address"   : "f_address",
                "email"     : "f_email",
                "contact"   : "f_contact"
            };

            let hasFilter = false;

            Object.keys(fields).forEach(function (param) {
                const el = get(fields[param]);
                if (el && el.value.trim() !== "") {
                    params.set(param, el.value.trim());
                    hasFilter = true;
                }
            });

            return { params: params, hasFilter: hasFilter };
        }

        // ---- preview count (optional live feedback) ----
        function showPreview(params) {
            if (!previewMsg) return;

            previewMsg.style.display = "block";
            previewMsg.textContent = "Fetching record count...";

            const url = "/export-filtered-count?" + params.toString();

            fetch(url)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.count !== undefined) {
                        previewMsg.textContent = "Records matching filter: " + data.count;
                    } else {
                        previewMsg.textContent = "";
                        previewMsg.style.display = "none";
                    }
                })
                .catch(function () {
                    previewMsg.style.display = "none";
                });
        }

        // ---- Program → Major dropdown functionality ----
        const programFilter = get("f_program");
        const majorFilter = get("f_major");
        
        if (programFilter && majorFilter) {
            // Remove any existing event listeners first
            const newProgramFilter = programFilter.cloneNode(true);
            programFilter.parentNode.replaceChild(newProgramFilter, programFilter);
            
            // Add single event listener
            newProgramFilter.addEventListener("change", function () {
                const selectedProgram = this.value;
                const currentMajor = majorFilter.value;
                
                // Clear dropdown completely
                majorFilter.innerHTML = '<option value="">All Majors</option>';
                
                if (selectedProgram) {
                    // Fetch majors for selected program
                    fetch(`/api/get-majors/${selectedProgram}`)
                        .then(response => response.json())
                        .then(data => {
                            // Clear any existing options first
                            majorFilter.innerHTML = '<option value="">All Majors</option>';
                            
                            // Use a Set to prevent duplicates
                            const addedMajors = new Set();
                            
                            data.majors.forEach(major => {
                                if (!addedMajors.has(major.name)) {
                                    addedMajors.add(major.name);
                                    const option = document.createElement('option');
                                    option.value = major.name;
                                    option.textContent = major.name;
                                    // Re-select if it matches current major
                                    if (major.name === currentMajor) {
                                        option.selected = true;
                                    }
                                    majorFilter.appendChild(option);
                                }
                            });
                            
                            // Trigger preview update
                            const { params, hasFilter } = buildFilterParams("excel");
                            if (hasFilter) {
                                showPreview(params);
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching majors:', error);
                        });
                } else {
                    // Trigger preview update when program is cleared
                    const { params, hasFilter } = buildFilterParams("excel");
                    if (hasFilter) {
                        showPreview(params);
                    }
                }
            });
        }

        // ---- auto preview when any field changes ----
        [
            "f_date_from", "f_date_to",
            "f_grad_from", "f_grad_to",
            "f_program", "f_major",
            "f_lastname", "f_firstname",
            "f_address", "f_email", "f_contact"
        ].forEach(function (id) {
            const el = get(id);
            if (!el) return;

            el.addEventListener("change", function () {
                const { params, hasFilter } = buildFilterParams("excel");
                if (hasFilter) {
                    showPreview(params);
                } else {
                    if (previewMsg) {
                        previewMsg.style.display = "none";
                        previewMsg.textContent = "";
                    }
                }
            });
        });

        // ---- download Excel ----
        if (dlExcel) {
            dlExcel.addEventListener("click", function () {
                const { params, hasFilter } = buildFilterParams("excel");

                if (!hasFilter) {
                    alert("Walang nalagyan na filter. Mag-fill ng kahit isang field.");
                    return;
                }

                window.location.href = "/export-filtered?" + params.toString();
            });
        }

        // ---- download PDF ----
        if (dlPdf) {
            dlPdf.addEventListener("click", function () {
                const { params, hasFilter } = buildFilterParams("pdf");

                if (!hasFilter) {
                    alert("Walang nalagyan na filter. Mag-fill ng kahit isang field.");
                    return;
                }

                window.location.href = "/export-filtered?" + params.toString();
            });
        }
    }

    initAdvancedFilter();


});


// ================= FLASH MESSAGE AUTO HIDE =================
document.addEventListener("DOMContentLoaded", function () {

    const flash = document.querySelector(".flash-message");

    if (flash) {
        setTimeout(() => {
            flash.style.opacity = "0";

            setTimeout(() => {
                flash.remove();
            }, 500);
        }, 3000);
    }

});