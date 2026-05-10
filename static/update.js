/* ================================================================
   update.js — NEUST Alumni Update Page
   Features: photo preview/remove, multi-job, AI relevance scan
   ================================================================ */

document.addEventListener("DOMContentLoaded", function () {

    // ================================================================
    // SIDEBAR TOGGLE (kept for compatibility)
    // ================================================================
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

    // ================================================================
    // DATE CONSTRAINTS
    // ================================================================
    const today          = new Date().toISOString().split("T")[0];
    const graduationDate = document.getElementById("graduation_date");

    if (graduationDate) graduationDate.setAttribute("max", today);

    // ================================================================
    // CONTACT NUMBER VALIDATION
    // ================================================================
    const contactInput = document.querySelector("input[name='contact_num']");
    const contactHint  = document.getElementById("contactHint");

    function validateContact() {
        if (!contactInput) return false;
        const value = contactInput.value.trim();
        const valid = /^09\d{9}$/.test(value);
        if (!value) {
            if (contactHint) contactHint.textContent = "";
            contactInput.style.borderColor = "#d8e3ef";
            return false;
        }
        if (!valid) {
            if (contactHint) contactHint.textContent = "Must be 11 digits starting with 09 (e.g. 09123456789)";
            contactInput.style.borderColor = "#dc3545";
            return false;
        }
        if (contactHint) contactHint.textContent = "";
        contactInput.style.borderColor = "#28a745";
        return true;
    }

    if (contactInput) {
        contactInput.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 11);
            validateContact();
        });
        contactInput.addEventListener("blur", validateContact);
        if (contactInput.value) validateContact();
    }

    // ================================================================
    // PROGRAM → MAJOR DROPDOWN (Dynamic Loading)
    // ================================================================
    const programSelect = document.getElementById("program");
    const majorSelect   = document.getElementById("major");

    if (programSelect && majorSelect) {
        // Remove any existing event listeners first
        const newProgramSelect = programSelect.cloneNode(true);
        programSelect.parentNode.replaceChild(newProgramSelect, programSelect);
        
        // Add single event listener
        newProgramSelect.addEventListener("change", function () {
            const selectedProgram = this.value;
            const currentMajor = majorSelect.value; // Save current selection
            
            // Clear dropdown completely
            majorSelect.innerHTML = '<option value="">Select Major</option>';
            
            if (selectedProgram) {
                // Fetch majors for selected program
                fetch(`/api/get-majors/${selectedProgram}`)
                    .then(response => response.json())
                    .then(data => {
                        // Clear any existing options first
                        majorSelect.innerHTML = '<option value="">Select Major</option>';
                        
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
                                majorSelect.appendChild(option);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching majors:', error);
                    });
            }
            
            // Re-scan all existing jobs when program changes
            document.querySelectorAll(".job-entry").forEach(function (entry) {
                const jobTitleInput = entry.querySelector('[data-field="job_title"]');
                if (jobTitleInput && jobTitleInput.value.trim()) {
                    debounceScan(entry, jobTitleInput.value.trim());
                }
            });
        });
    }

    // ================================================================
    // PHOTO UPLOAD PREVIEW
    // ================================================================
    const photoInput      = document.getElementById("photo");
    const photoPreview    = document.getElementById("photoPreview");
    const photoImg        = document.getElementById("photoImg");
    const photoPlaceholder = document.getElementById("photoPlaceholder");
    const removePhoto     = document.getElementById("removePhoto");
    const removePhotoFlag = document.getElementById("removePhotoFlag");

    if (photoInput) {
        photoInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                alert("Photo file is too large. Maximum size is 5MB.");
                this.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                if (photoImg) {
                    photoImg.src = e.target.result;
                    photoImg.style.display = "block";
                }
                if (photoPlaceholder) photoPlaceholder.style.display = "none";
                if (photoPreview) photoPreview.classList.add("has-photo");
                if (removePhoto)  removePhoto.style.display = "inline-flex";
                if (removePhotoFlag) removePhotoFlag.value = "0";
            };
            reader.readAsDataURL(file);
        });
    }

    if (removePhoto) {
        removePhoto.addEventListener("click", function () {
            if (photoInput)       photoInput.value = "";
            if (photoImg)         { photoImg.src = ""; photoImg.style.display = "none"; }
            if (photoPlaceholder) photoPlaceholder.style.display = "";
            if (photoPreview)     photoPreview.classList.remove("has-photo");
            if (removePhotoFlag)  removePhotoFlag.value = "1";
            this.style.display = "none";
        });
    }

    // ================================================================
    // EMPLOYMENT STATUS + MULTI-JOB LOGIC
    // ================================================================
    const employmentStatus    = document.getElementById("employment_status");
    const jobEntriesContainer = document.getElementById("jobEntriesContainer");
    const jobsList            = document.getElementById("jobsList");
    const addJobBtn           = document.getElementById("addJobBtn");
    const empCount            = document.getElementById("empCount");

    let jobCounter = jobsList ? jobsList.querySelectorAll(".job-entry").length : 0;

    function updateEmpCount() {
        const entries = jobsList ? jobsList.querySelectorAll(".job-entry").length : 0;
        if (empCount) empCount.textContent = entries + " job(s)";
    }

    // Attach scan listeners to existing (pre-filled) job entries
    if (jobsList) {
        jobsList.querySelectorAll(".job-entry").forEach(function (entry, i) {
            entry.dataset.index = i + 1;
            attachScanListener(entry);
        });
    }

    updateEmpCount();

    function createJobEntry(index) {
        const entry = document.createElement("div");
        entry.className = "job-entry";
        entry.dataset.index = index;
        entry.innerHTML = `
            <div class="job-entry-header">
                <span class="job-entry-label">Job #${index}</span>
                <button type="button" class="remove-job-btn" onclick="removeJobEntry(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Remove
                </button>
            </div>
            <div class="job-entry-grid">
                <div class="field-group">
                    <label class="field-label">Job Title</label>
                    <input type="text"
                           name="job_title[]"
                           class="field-input"
                           data-field="job_title"
                           placeholder="e.g. Software Engineer"
                           autocomplete="off">
                </div>
                <div class="field-group">
                    <label class="field-label">Employment Sector</label>
                    <input type="text"
                           name="employment_sector[]"
                           class="field-input"
                           data-field="employment_sector"
                           placeholder="e.g. Government, Private">
                </div>
                <div class="field-group full">
                    <label class="field-label">Degree Relevance to Work</label>
                    <select name="degree_relevance_to_work[]"
                            class="field-input"
                            data-field="degree_relevance">
                        <option value="">Select or let AI decide</option>
                        <option value="Directly Related">Directly Related</option>
                        <option value="Moderately Related">Moderately Related</option>
                        <option value="Slightly Related">Slightly Related</option>
                        <option value="Not Related">Not Related</option>
                    </select>
                    <div class="relevance-auto-badge scanning" style="display:none;" data-badge="relevance">
                        <span class="relevance-dot"></span>
                        <span class="relevance-label">Scanning...</span>
                    </div>
                </div>
            </div>
        `;
        attachScanListener(entry);
        return entry;
    }

    function attachScanListener(entry) {
        const jobTitleInput = entry.querySelector('[data-field="job_title"]');
        if (!jobTitleInput) return;

        jobTitleInput.addEventListener("input", function () {
            const val = this.value.trim();
            if (val.length >= 3) {
                debounceScan(entry, val);
            } else {
                hideBadge(entry);
            }
        });

        jobTitleInput.addEventListener("blur", function () {
            const val = this.value.trim();
            if (val.length >= 2) {
                scanRelevance(entry, val);
            }
        });
    }
    
    // Add event listeners for program and major changes
    function attachGlobalScanListeners() {
        const programSelect = document.getElementById("program");
        const majorSelect = document.getElementById("major");
        
        if (programSelect) {
            programSelect.addEventListener("change", function() {
                console.log("Program changed to:", this.value);
                // Trigger scan for all job entries
                const allJobEntries = document.querySelectorAll(".job-entry");
                allJobEntries.forEach(entry => {
                    const jobTitleInput = entry.querySelector('[data-field="job_title"]');
                    if (jobTitleInput && jobTitleInput.value.trim().length >= 2) {
                        scanRelevance(entry, jobTitleInput.value.trim());
                    }
                });
            });
        }
        
        if (majorSelect) {
            majorSelect.addEventListener("change", function() {
                console.log("Major changed to:", this.value);
                // Trigger scan for all job entries
                const allJobEntries = document.querySelectorAll(".job-entry");
                allJobEntries.forEach(entry => {
                    const jobTitleInput = entry.querySelector('[data-field="job_title"]');
                    if (jobTitleInput && jobTitleInput.value.trim().length >= 2) {
                        scanRelevance(entry, jobTitleInput.value.trim());
                    }
                });
            });
        }
    }

    function addJobEntry() {
        jobCounter++;
        const entry = createJobEntry(jobCounter);
        if (jobsList) jobsList.appendChild(entry);
        updateEmpCount();
        renumberJobs();
    }

    window.removeJobEntry = function (btn) {
        const entry = btn.closest(".job-entry");
        if (entry) {
            entry.style.opacity = "0";
            entry.style.transform = "translateY(-8px)";
            entry.style.transition = "opacity 0.2s, transform 0.2s";
            setTimeout(function () {
                entry.remove();
                renumberJobs();
                updateEmpCount();
            }, 200);
        }
    };

    function renumberJobs() {
        document.querySelectorAll(".job-entry").forEach(function (entry, i) {
            const label = entry.querySelector(".job-entry-label");
            if (label) label.textContent = "Job #" + (i + 1);
            entry.dataset.index = i + 1;
        });
    }

    if (addJobBtn) {
        addJobBtn.addEventListener("click", addJobEntry);
    }

    function toggleEmploymentVisibility(status) {
        if (!jobEntriesContainer) return;
        const isUnemployed = (status === "Unemployed");

        if (isUnemployed) {
            jobEntriesContainer.style.display = "none";
            if (jobsList) jobsList.innerHTML = "";
            jobCounter = 0;
            updateEmpCount();
        } else {
            jobEntriesContainer.style.display = "block";
            if (jobsList && jobsList.querySelectorAll(".job-entry").length === 0) {
                addJobEntry();
            }
        }
    }

    if (employmentStatus) {
        employmentStatus.addEventListener("change", function () {
            toggleEmploymentVisibility(this.value);
        });
        // On page load — if unemployed, hide job entries
        toggleEmploymentVisibility(employmentStatus.value);
    }

    // ================================================================
    // AI RELEVANCE SCAN
    // ================================================================
    let scanTimers = {};

    function debounceScan(entry, jobTitle) {
        const idx = entry.dataset.index;
        clearTimeout(scanTimers[idx]);
        scanTimers[idx] = setTimeout(function () {
            scanRelevance(entry, jobTitle);
        }, 900);
    }

    function hideBadge(entry) {
        const badge = entry.querySelector('[data-badge="relevance"]');
        if (badge) badge.style.display = "none";
    }

    function showBadge(entry, relevance) {
        console.log("showBadge called with:", relevance);
        const badge = entry.querySelector('[data-badge="relevance"]');
        if (!badge) {
            console.log("✗ Badge not found");
            return;
        }

        badge.style.display = "inline-flex";
        badge.className = "relevance-auto-badge";

        let cls = "";
        if (relevance === "Directly Related")    cls = "directly";
        else if (relevance === "Moderately Related") cls = "moderately";
        else if (relevance === "Slightly Related")   cls = "slightly";
        else if (relevance === "Not Related")        cls = "not";
        else cls = "scanning";

        badge.classList.add(cls);
        const labelText = "AI: " + relevance;
        badge.querySelector(".relevance-label").textContent = labelText;
        console.log("✓ Badge updated with:", labelText);
    }

    function showScanningBadge(entry) {
        const badge = entry.querySelector('[data-badge="relevance"]');
        if (!badge) return;
        badge.style.display = "inline-flex";
        badge.className = "relevance-auto-badge scanning";
        badge.querySelector(".relevance-label").textContent = "Scanning...";
    }

    // ================================================================
    // DEGREE RELEVANCE SCANNER - CLIENT SIDE WITH HARD OVERRIDES
    // ================================================================
    
    // Text normalization function
    const normalize = (text) => {
        return (text || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s]/g, "");
    };
    
    // Hard override rules - these take precedence over everything
    const checkHardOverrides = (normalizedProgram, normalizedMajor, normalizedJob, normalizedSector) => {
        console.log("=== CHECKING HARD OVERRIDES ===");
        console.log("Program:", normalizedProgram);
        console.log("Major:", normalizedMajor);
        console.log("Job:", normalizedJob);
        console.log("Sector:", normalizedSector);
        
        // BEED + Teacher/Educator = Directly Related (HARDEST OVERRIDE)
        if (
            (normalizedProgram.includes("beed") || normalizedMajor.includes("basic education")) &&
            (
                normalizedJob.includes("teacher") ||
                normalizedJob.includes("educator") ||
                normalizedJob.includes("instructor") ||
                normalizedJob.includes("tutor") ||
                normalizedJob.includes("faculty") ||
                normalizedJob.includes("lecturer") ||
                normalizedJob.includes("professor") ||
                normalizedJob.includes("teaching")
            )
        ) {
            console.log("✓ HARD OVERRIDE MATCHED: BEED + Teacher = Directly Related");
            return "Directly Related";
        }
        
        // BSIT + Software/IT jobs = Directly Related
        if (
            normalizedProgram.includes("bsit") &&
            (
                normalizedJob.includes("software") ||
                normalizedJob.includes("developer") ||
                normalizedJob.includes("programmer") ||
                normalizedJob.includes("engineer") ||
                normalizedJob.includes("it") ||
                normalizedJob.includes("analyst") ||
                normalizedJob.includes("technical")
            )
        ) {
            console.log("✓ HARD OVERRIDE MATCHED: BSIT + IT Job = Directly Related");
            return "Directly Related";
        }
        
        // BSBA + Business/Marketing jobs = Directly Related
        if (
            normalizedProgram.includes("bsba") &&
            (
                normalizedJob.includes("marketing") ||
                normalizedJob.includes("business") ||
                normalizedJob.includes("sales") ||
                normalizedJob.includes("manager") ||
                normalizedJob.includes("account") ||
                normalizedJob.includes("finance")
            )
        ) {
            console.log("✓ HARD OVERRIDE MATCHED: BSBA + Business Job = Directly Related");
            return "Directly Related";
        }
        
        console.log("✗ No hard overrides matched");
        return null;
    };
    
    // Keyword-based scoring system (fallback)
    const calculateRelevanceScore = (normalizedProgram, normalizedMajor, normalizedJob, normalizedSector) => {
        console.log("=== CALCULATING RELEVANCE SCORE ===");
        
        let score = 0;
        const matchedKeywords = [];
        
        // Education-related keywords
        const educationKeywords = [
            "teacher", "teaching", "educator", "education", "instructor",
            "faculty", "lecturer", "professor", "tutor", "academic", "school"
        ];
        
        // IT-related keywords
        const itKeywords = [
            "software", "developer", "programmer", "engineer", "it", "technical",
            "analyst", "system", "network", "database", "web", "application"
        ];
        
        // Business-related keywords
        const businessKeywords = [
            "marketing", "business", "sales", "manager", "account", "finance",
            "admin", "office", "clerk", "staff", "supervisor"
        ];
        
        // Check program relevance
        if (normalizedProgram.includes("beed")) {
            const educationMatches = educationKeywords.filter(keyword => 
                normalizedJob.includes(keyword)
            );
            if (educationMatches.length > 0) {
                score += 50;
                matchedKeywords.push(...educationMatches);
            }
            // Give some points for any education-related job even if not direct match
            if (score === 0 && (normalizedJob.includes("admin") || normalizedJob.includes("office") || normalizedJob.includes("staff"))) {
                score += 15;
                matchedKeywords.push("education-related office work");
            }
        }
        
        if (normalizedProgram.includes("bsit")) {
            const itMatches = itKeywords.filter(keyword => 
                normalizedJob.includes(keyword)
            );
            if (itMatches.length > 0) {
                score += 50;
                matchedKeywords.push(...itMatches);
            }
        }
        
        if (normalizedProgram.includes("bsba")) {
            const businessMatches = businessKeywords.filter(keyword => 
                normalizedJob.includes(keyword)
            );
            if (businessMatches.length > 0) {
                score += 50;
                matchedKeywords.push(...businessMatches);
            }
        }
        
        // Check major relevance
        if (normalizedMajor.includes("basic education")) {
            const educationMatches = educationKeywords.filter(keyword => 
                normalizedJob.includes(keyword)
            );
            if (educationMatches.length > 0) {
                score += 30;
                matchedKeywords.push(...educationMatches);
            }
            // Give some points for any education-related job even if not direct match
            if (score <= 15 && (normalizedJob.includes("admin") || normalizedJob.includes("office") || normalizedJob.includes("staff"))) {
                score += 10;
                matchedKeywords.push("education major office work");
            }
        }
        
        console.log("Matched Keywords:", matchedKeywords);
        console.log("Final Score:", score);
        
        // Convert score to relevance level
        if (score >= 70) return "Directly Related";
        if (score >= 40) return "Moderately Related";
        if (score >= 15) return "Slightly Related";  // Lowered threshold for slightly related
        return "Not Related";
    };
    
    async function scanRelevance(entry, jobTitle) {
        console.log("\n=== STARTING DEGREE RELEVANCE SCAN ===");
        
        // Get all field values with proper selectors
        const programEl = document.getElementById("program");
        const majorEl = document.getElementById("major");
        const sectorEl = entry.querySelector('[data-field="employment_sector"]');
        
        const program = programEl ? programEl.value : "";
        const major = majorEl ? majorEl.value : "";
        const sector = sectorEl ? sectorEl.value : "";
        
        // DEBUG: Print raw values
        console.log("RAW VALUES:");
        console.log("Program:", program);
        console.log("Major:", major);
        console.log("Job Title:", jobTitle);
        console.log("Sector:", sector);
        
        if (!jobTitle || jobTitle.length < 2) {
            console.log("Job title too short, skipping scan");
            hideBadge(entry);
            return;
        }
        
        showScanningBadge(entry);
        
        // Normalize all values
        const normalizedProgram = normalize(program);
        const normalizedMajor = normalize(major);
        const normalizedJob = normalize(jobTitle);
        const normalizedSector = normalize(sector);
        
        console.log("NORMALIZED VALUES:");
        console.log("Normalized Program:", normalizedProgram);
        console.log("Normalized Major:", normalizedMajor);
        console.log("Normalized Job:", normalizedJob);
        console.log("Normalized Sector:", normalizedSector);
        
        try {
            // Step 1: Check hard overrides first
            const hardOverrideResult = checkHardOverrides(
                normalizedProgram, normalizedMajor, normalizedJob, normalizedSector
            );
            
            let finalResult;
            if (hardOverrideResult) {
                finalResult = hardOverrideResult;
                console.log("✓ Using hard override result:", finalResult);
            } else {
                // Step 2: Use scoring system as fallback
                finalResult = calculateRelevanceScore(
                    normalizedProgram, normalizedMajor, normalizedJob, normalizedSector
                );
                console.log("✓ Using scoring system result:", finalResult);
            }
            
            console.log("FINAL RESULT:", finalResult);
            
            // Update dropdown
            const select = entry.querySelector('[data-field="degree_relevance"]');
            if (select) {
                console.log("Updating dropdown to:", finalResult);
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === finalResult) {
                        select.selectedIndex = i;
                        console.log("✓ Dropdown updated successfully");
                        break;
                    }
                }
            } else {
                console.log("✗ Could not find dropdown selector");
            }
            
            // Update AI badge
            showBadge(entry, finalResult);
            console.log("✓ AI badge updated");
            
        } catch (err) {
            console.error("❌ SCAN FAILED:", err);
            hideBadge(entry);
        }
        
        console.log("=== SCAN COMPLETE ===\n");
    }

    // ================================================================
    // CANCEL BUTTON CONFIRMATION
    // ================================================================
    const cancelBtn = document.getElementById("cancelBtn");
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function (e) {
            e.preventDefault();
            
            Swal.fire({
                title: 'Cancel Update?',
                text: 'Are you sure you want to cancel updating this alumni record?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, Cancel',
                cancelButtonText: 'Continue Editing'
            }).then((result) => {
                if (result.isConfirmed) {
                    // User confirmed cancellation - redirect to records page
                    window.location.href = '/records';
                }
                // If user clicks "Continue Editing", stay on page (do nothing)
            });
        });
    }

    // ================================================================
    // FORM SUBMIT
    // ================================================================
    const updateForm = document.querySelector("form.form-container");

    if (updateForm) {
        updateForm.addEventListener("submit", function (e) {
            // Validate Graduation Date
            const graduationDate = document.querySelector('input[name="graduation_date"]');
            if (graduationDate && graduationDate.value) {
                const selectedDate = new Date(graduationDate.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day for comparison
                
                if (selectedDate > today) {
                    e.preventDefault();
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: 'Graduation Date cannot be greater than current date.',
                        confirmButtonColor: '#0d2137'
                    });
                    return;
                }
            }

            if (!validateContact()) {
                e.preventDefault();
                alert("Invalid contact number! Must be 11 digits starting with 09.");
                if (contactInput) contactInput.focus();
                return;
            }
        });
    }

    // ================================================================
    // CLEAR stale flash
    // ================================================================
    sessionStorage.removeItem("update_success");
    
    // ================================================================
    // ATTACH GLOBAL SCAN LISTENERS
    // ================================================================
    attachGlobalScanListeners();
    console.log("✓ Global scan listeners attached");
});