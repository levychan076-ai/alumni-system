/* ================================================================
   add.js — NEUST Alumni Add Page
   Features: photo preview, multi-job employment, AI relevance scan
   ================================================================ */

document.addEventListener("DOMContentLoaded", function () {

    // ================================================================
    // SIDEBAR TOGGLE (kept for compatibility)
    // ================================================================
    const toggleBtn = document.getElementById("toggleBtn");
    const sidebar   = document.querySelector(".sidebar");
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
    // STUDENT NUMBER VALIDATION
    // ================================================================
    const studNumInput = document.querySelector('input[name="stud_num_input"]');

    if (studNumInput) {
        studNumInput.addEventListener("input", function () {
            const pattern = /^\d{0,4}-?\d{0,5}$/;
            this.style.borderColor = pattern.test(this.value) ? "#d8e3ef" : "#dc3545";
        });

        studNumInput.addEventListener("blur", function () {
            if (this.value && !/^\d{4}-\d{5}$/.test(this.value)) {
                this.style.borderColor = "#dc3545";
            }
        });
    }

    // ================================================================
    // CONTACT NUMBER VALIDATION
    // ================================================================
    const contactInput = document.querySelector('input[name="contact_num"]');
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
    const photoInput   = document.getElementById("photo");
    const photoPreview = document.getElementById("photoPreview");
    const photoImg     = document.getElementById("photoImg");
    const removePhoto  = document.getElementById("removePhoto");

    if (photoInput) {
        photoInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            // Validate size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert("Photo file is too large. Maximum size is 5MB.");
                this.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                photoImg.src = e.target.result;
                photoImg.style.display = "block";
                photoPreview.querySelector("svg").style.display = "none";
                photoPreview.classList.add("has-photo");
                if (removePhoto) removePhoto.style.display = "inline-flex";
            };
            reader.readAsDataURL(file);
        });
    }

    if (removePhoto) {
        removePhoto.addEventListener("click", function () {
            if (photoInput) { photoInput.value = ""; }
            if (photoImg)   { photoImg.src = ""; photoImg.style.display = "none"; }
            if (photoPreview) {
                const svg = photoPreview.querySelector("svg");
                if (svg) svg.style.display = "";
                photoPreview.classList.remove("has-photo");
            }
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

    let jobCounter = 0;

    function updateEmpCount() {
        const entries = jobsList ? jobsList.querySelectorAll(".job-entry").length : 0;
        if (empCount) empCount.textContent = entries + " job(s)";
    }

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
                        <option value="Let AI decide">Let AI decide</option>
                    </select>
                    <div class="relevance-auto-badge scanning" style="display:none;" data-badge="relevance">
                        <span class="relevance-dot"></span>
                        <span class="relevance-label">Scanning...</span>
                    </div>
                </div>
            </div>
        `;

        // Attach scan-on-type listener to job title
        const jobTitleInput = entry.querySelector('[data-field="job_title"]');
        if (jobTitleInput) {
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
        
        // Attach degree relevance scanner listeners
        attachJobBlockListeners(entry);

        return entry;
    }

    function addJobEntry() {
        jobCounter++;
        const entry = createJobEntry(jobCounter);
        if (jobsList) jobsList.appendChild(entry);
        updateEmpCount();
        // Re-number all entries
        renumberJobs();
    }

    // Exposed globally for inline onclick
    window.removeJobEntry = function (btn) {
        const entry = btn.closest(".job-entry");
        if (entry) {
            entry.style.animation = "none";
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
        });
    }

    if (addJobBtn) {
        addJobBtn.addEventListener("click", addJobEntry);
    }

    function toggleEmploymentFields(status) {
        if (!jobEntriesContainer) return;
        const isUnemployed = (status === "Unemployed");

        if (isUnemployed) {
            jobEntriesContainer.style.display = "none";
            if (jobsList) jobsList.innerHTML = "";
            jobCounter = 0;
            updateEmpCount();
        } else {
            jobEntriesContainer.style.display = "block";
            // If no jobs yet, add one automatically
            if (jobsList && jobsList.querySelectorAll(".job-entry").length === 0) {
                addJobEntry();
            }
        }
    }

    if (employmentStatus) {
        employmentStatus.addEventListener("change", function () {
            toggleEmploymentFields(this.value);
        });
        toggleEmploymentFields(employmentStatus.value);
    }

    // ================================================================
    // SCORE-BASED DEGREE RELEVANCE AI SCANNER - FIXED LOGIC
    // ================================================================
    
    // Score-Based Degree Relevance AI Scanner - Fixed Logic
    function analyzeDegreeRelevance(program, major, jobTitle, employmentSector) {
        if (!program || !jobTitle) return 'Not Related';
        
        // Enhanced text normalization
        const normalizedProgram = normalizeText(program);
        const normalizedMajor = normalizeText(major);
        const normalizedJobTitle = normalizeText(jobTitle);
        const normalizedSector = normalizeText(employmentSector);
        
        // Extract keywords for analysis
        const jobKeywords = extractKeywords(normalizedJobTitle);
        const sectorKeywords = extractKeywords(normalizedSector);
        const programKeywords = extractKeywords(normalizedProgram);
        const majorKeywords = extractKeywords(normalizedMajor);
        
        // Calculate relevance score
        let score = 0;
        let debugInfo = {
            program: normalizedProgram,
            major: normalizedMajor,
            jobTitle: normalizedJobTitle,
            sector: normalizedSector,
            jobKeywords: jobKeywords,
            sectorKeywords: sectorKeywords,
            matches: [],
            finalScore: 0
        };
        
        // BEED Analysis - High Priority for Education
        if (normalizedProgram.includes('beed') || normalizedProgram.includes('education')) {
            score = calculateBEEDScore(normalizedMajor, jobKeywords, sectorKeywords, majorKeywords, debugInfo);
        }
        // BSIT Analysis - High Priority for IT/Software
        else if (normalizedProgram.includes('bsit') || normalizedProgram.includes('information technology')) {
            score = calculateBSITScore(normalizedMajor, jobKeywords, sectorKeywords, majorKeywords, debugInfo);
        }
        // BSBA Analysis - High Priority for Business
        else if (normalizedProgram.includes('bsba') || normalizedProgram.includes('business administration')) {
            score = calculateBSBAScore(normalizedMajor, jobKeywords, sectorKeywords, majorKeywords, debugInfo);
        }
        
        debugInfo.finalScore = score;
        console.log('Degree Relevance Analysis:', debugInfo);
        
        // Apply scoring thresholds
        if (score >= 80) return 'Directly Related';
        if (score >= 40) return 'Slightly Related';
        return 'Not Related';
    }

    // Enhanced text normalization
    function normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase()
                  .trim()
                  .replace(/[^a-z\s]/g, '') // Remove special characters
                  .replace(/\s+/g, ' ') // Normalize spaces
                  .trim();
    }

    // Extract keywords with better filtering
    function extractKeywords(text) {
        if (!text) return [];
        return text.split(' ')
                  .filter(word => word.length > 2) // Filter out very short words
                  .filter(word => !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'they', 'were', 'been', 'their', 'what', 'when', 'where', 'will'].includes(word)); // Remove common words
    }

    // BEED Score Calculation - Fixed Logic
    function calculateBEEDScore(major, jobKeywords, sectorKeywords, majorKeywords, debugInfo) {
        let score = 0;
        
        // HIGH PRIORITY - Direct Education Matches (80+ points)
        const directlyRelatedKeywords = [
            'teacher', 'teaching', 'educator', 'instructor', 'professor', 'tutor',
            'faculty', 'academic', 'school', 'education', 'training', 'coordinator',
            'preschool', 'elementary', 'guidance', 'counselor', 'curriculum', 'development',
            'educational', 'administrator', 'principal', 'head', 'aide', 'lecturer'
        ];
        
        // Check for direct matches in job title
        for (const keyword of directlyRelatedKeywords) {
            for (const jobKeyword of jobKeywords) {
                if (jobKeyword.includes(keyword) || keyword.includes(jobKeyword)) {
                    score += 85; // High score for direct matches
                    debugInfo.matches.push({type: 'direct', keyword: keyword, match: jobKeyword, points: 85});
                    console.log(`BEED Direct Match: ${keyword} matches ${jobKeyword} - Score: ${score}`);
                    return score; // Early return for strong matches
                }
            }
        }
        
        // MEDIUM PRIORITY - Education-adjacent roles (40-79 points)
        const slightlyRelatedKeywords = [
            'office', 'administrative', 'assistant', 'childcare', 'daycare', 'staff',
            'support', 'secretary', 'clerk', 'librarian', 'aid'
        ];
        
        for (const keyword of slightlyRelatedKeywords) {
            for (const jobKeyword of jobKeywords) {
                if (jobKeyword.includes(keyword) || keyword.includes(jobKeyword)) {
                    score += 45;
                    debugInfo.matches.push({type: 'slight', keyword: keyword, match: jobKeyword, points: 45});
                    console.log(`BEED Slight Match: ${keyword} matches ${jobKeyword} - Score: ${score}`);
                }
            }
        }
        
        // SECTOR BONUS - Education sector adds points
        for (const sectorKeyword of sectorKeywords) {
            if (sectorKeyword.includes('education') || sectorKeyword.includes('school') || sectorKeyword.includes('academic')) {
                score += 20;
                debugInfo.matches.push({type: 'sector', keyword: sectorKeyword, points: 20});
                console.log(`BEED Sector Bonus: ${sectorKeyword} - Score: ${score}`);
            }
        }
        
        // MAJOR BONUS - Basic Education major
        if (major.includes('basic') || major.includes('education')) {
            score += 15;
            debugInfo.matches.push({type: 'major', keyword: major, points: 15});
            console.log(`BEED Major Bonus: ${major} - Score: ${score}`);
        }
        
        return score;
    }

    // BSIT Score Calculation - Fixed Logic
    function calculateBSITScore(major, jobKeywords, sectorKeywords, majorKeywords, debugInfo) {
        let score = 0;
        
        // HIGH PRIORITY - Direct IT/Software Matches (80+ points)
        const directlyRelatedKeywords = [
            'software', 'developer', 'engineer', 'programmer', 'web', 'frontend', 'backend',
            'fullstack', 'stack', 'database', 'admin', 'administrator', 'data', 'analyst',
            'system', 'systems', 'analyst', 'support', 'technical', 'it', 'information',
            'technology', 'network', 'networking', 'cyber', 'security', 'mobile', 'application',
            'app', 'cloud', 'devops', 'testing', 'qa', 'quality', 'assurance', 'ui', 'ux',
            'user', 'interface', 'experience', 'computer', 'technician', 'specialist', 'staff'
        ];
        
        // Check for direct matches in job title
        for (const keyword of directlyRelatedKeywords) {
            for (const jobKeyword of jobKeywords) {
                if (jobKeyword.includes(keyword) || keyword.includes(jobKeyword)) {
                    score += 85;
                    debugInfo.matches.push({type: 'direct', keyword: keyword, match: jobKeyword, points: 85});
                    console.log(`BSIT Direct Match: ${keyword} matches ${jobKeyword} - Score: ${score}`);
                    return score; // Early return for strong matches
                }
            }
        }
        
        // MEDIUM PRIORITY - Office/Admin roles (40-79 points)
        const slightlyRelatedKeywords = [
            'office', 'administrative', 'assistant', 'encoder', 'clerk', 'customer', 'service',
            'representative', 'virtual', 'assistant', 'operations', 'staff', 'bpo', 'agent',
            'documentation', 'support'
        ];
        
        for (const keyword of slightlyRelatedKeywords) {
            for (const jobKeyword of jobKeywords) {
                if (jobKeyword.includes(keyword) || keyword.includes(jobKeyword)) {
                    score += 45;
                    debugInfo.matches.push({type: 'slight', keyword: keyword, match: jobKeyword, points: 45});
                    console.log(`BSIT Slight Match: ${keyword} matches ${jobKeyword} - Score: ${score}`);
                }
            }
        }
        
        // SECTOR BONUS - IT sector
        for (const sectorKeyword of sectorKeywords) {
            if (sectorKeyword.includes('it') || sectorKeyword.includes('technology') || sectorKeyword.includes('software')) {
                score += 20;
                debugInfo.matches.push({type: 'sector', keyword: sectorKeyword, points: 20});
                console.log(`BSIT Sector Bonus: ${sectorKeyword} - Score: ${score}`);
            }
        }
        
        return score;
    }

    // BSBA Score Calculation - Fixed Logic
    function calculateBSBAScore(major, jobKeywords, sectorKeywords, majorKeywords, debugInfo) {
        let score = 0;
        
        // HIGH PRIORITY - Direct Business Matches (80+ points)
        const directlyRelatedKeywords = [
            'marketing', 'sales', 'business', 'finance', 'financial', 'accounting', 'manager',
            'management', 'brand', 'officer', 'executive', 'director', 'supervisor',
            'consultant', 'entrepreneur', 'owner', 'operations', 'development', 'hr',
            'human', 'resources', 'resource', 'personnel', 'recruitment', 'training',
            'compensation', 'benefits', 'employee', 'relations', 'digital', 'social', 'media'
        ];
        
        // Check for direct matches in job title
        for (const keyword of directlyRelatedKeywords) {
            for (const jobKeyword of jobKeywords) {
                if (jobKeyword.includes(keyword) || keyword.includes(jobKeyword)) {
                    score += 85;
                    debugInfo.matches.push({type: 'direct', keyword: keyword, match: jobKeyword, points: 85});
                    console.log(`BSBA Direct Match: ${keyword} matches ${jobKeyword} - Score: ${score}`);
                    return score; // Early return for strong matches
                }
            }
        }
        
        // MEDIUM PRIORITY - Office/Admin roles (40-79 points)
        const slightlyRelatedKeywords = [
            'office', 'administrative', 'assistant', 'cashier', 'customer', 'service',
            'representative', 'clerk', 'staff', 'support', 'receptionist'
        ];
        
        for (const keyword of slightlyRelatedKeywords) {
            for (const jobKeyword of jobKeywords) {
                if (jobKeyword.includes(keyword) || keyword.includes(jobKeyword)) {
                    score += 45;
                    debugInfo.matches.push({type: 'slight', keyword: keyword, match: jobKeyword, points: 45});
                    console.log(`BSBA Slight Match: ${keyword} matches ${jobKeyword} - Score: ${score}`);
                }
            }
        }
        
        // SECTOR BONUS - Business sector
        for (const sectorKeyword of sectorKeywords) {
            if (sectorKeyword.includes('business') || sectorKeyword.includes('marketing') || sectorKeyword.includes('finance')) {
                score += 20;
                debugInfo.matches.push({type: 'sector', keyword: sectorKeyword, points: 20});
                console.log(`BSBA Sector Bonus: ${sectorKeyword} - Score: ${score}`);
            }
        }
        
        return score;
    }

    function autoScanDegreeRelevance(entry) {
        const programSelect = document.getElementById('program');
        const majorSelect = document.getElementById('major');
        
        if (!programSelect || !entry) return;
        
        const jobTitleInput = entry.querySelector('input[name="job_title[]"]');
        const sectorInput = entry.querySelector('input[name="employment_sector[]"]');
        const relevanceSelect = entry.querySelector('select[name="degree_relevance_to_work[]"]');
        
        if (!jobTitleInput || !relevanceSelect) return;
        
        const program = programSelect.value;
        const major = majorSelect ? majorSelect.value : '';
        const jobTitle = jobTitleInput.value;
        const sector = sectorInput ? sectorInput.value : '';
        
        // Only scan if we have enough data
        if (program && jobTitle && jobTitle.length >= 3) {
            const relevance = analyzeDegreeRelevance(program, major, jobTitle, sector);
            
            // Auto-fill the dropdown
            relevanceSelect.value = relevance;
            
            // Show enhanced live feedback
            showLiveRelevanceFeedback(entry, relevance, program, jobTitle);
        } else {
            // Clear feedback if insufficient data
            clearRelevanceFeedback(entry);
        }
    }

    function showLiveRelevanceFeedback(entry, relevance, program, jobTitle) {
        // Remove existing feedback
        const existingFeedback = entry.querySelector('.relevance-feedback');
        if (existingFeedback) existingFeedback.remove();
        
        // Create enhanced feedback with context
        const feedback = document.createElement('div');
        feedback.className = 'relevance-feedback';
        
        // Enhanced styling with better visual hierarchy
        const bgColor = relevance === 'Directly Related' ? '#d1f2eb' : relevance === 'Slightly Related' ? '#fff3cd' : '#f8d7da';
        const textColor = relevance === 'Directly Related' ? '#0f5132' : relevance === 'Slightly Related' ? '#856404' : '#721c24';
        const borderColor = relevance === 'Directly Related' ? '#badbcc' : relevance === 'Slightly Related' ? '#ffeaa7' : '#f5c2c7';
        
        feedback.style.cssText = `
            font-size: 0.8rem;
            margin-top: 6px;
            padding: 8px 12px;
            border-radius: 6px;
            background: ${bgColor};
            color: ${textColor};
            border: 1px solid ${borderColor};
            font-weight: 500;
            line-height: 1.4;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        // Enhanced feedback message with context
        const programName = program.split(' ')[0] || program;
        feedback.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2">
                    ${relevance === 'Directly Related' ? '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>' : 
                      relevance === 'Slightly Related' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' :
                      '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
                </svg>
                <div>
                    <div style="font-weight: 600;">AI Analysis Result</div>
                    <div style="font-size: 0.75rem; opacity: 0.9; margin-top: 2px;">
                        Your job "${jobTitle}" appears <strong>${relevance.toLowerCase()}</strong> to your ${programName} degree
                    </div>
                </div>
            </div>
        `;
        
        const relevanceSelect = entry.querySelector('select[name="degree_relevance_to_work[]"]');
        if (relevanceSelect) {
            relevanceSelect.parentNode.appendChild(feedback);
            
            // Auto-hide feedback after 5 seconds (increased for better readability)
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.style.opacity = '0';
                    feedback.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        if (feedback.parentNode) feedback.remove();
                    }, 300);
                }
            }, 5000);
        }
    }

    function clearRelevanceFeedback(entry) {
        const existingFeedback = entry.querySelector('.relevance-feedback');
        if (existingFeedback) {
            existingFeedback.style.opacity = '0';
            existingFeedback.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (existingFeedback.parentNode) existingFeedback.remove();
            }, 300);
        }
    }

    function attachJobBlockListeners(entry) {
        if (!entry) return;
        
        const jobTitleInput = entry.querySelector('input[name="job_title[]"]');
        const sectorInput = entry.querySelector('input[name="employment_sector[]"]');
        const relevanceSelect = entry.querySelector('select[name="degree_relevance_to_work[]"]');
        
        // Attach listeners for auto-scanning
        if (jobTitleInput) {
            jobTitleInput.addEventListener('input', () => autoScanDegreeRelevance(entry));
            jobTitleInput.addEventListener('change', () => autoScanDegreeRelevance(entry));
        }
        
        if (sectorInput) {
            sectorInput.addEventListener('input', () => autoScanDegreeRelevance(entry));
            sectorInput.addEventListener('change', () => autoScanDegreeRelevance(entry));
        }
        
        // Handle "Let AI decide" selection
        if (relevanceSelect) {
            relevanceSelect.addEventListener('change', function() {
                if (this.value === 'Let AI decide') {
                    autoScanDegreeRelevance(entry);
                }
            });
        }
    }

    function initializeDegreeRelevanceScanner() {
        // Attach to existing job blocks
        document.querySelectorAll('.job-entry').forEach(attachJobBlockListeners);
        
        // Attach to program/major changes
        const programSelect = document.getElementById('program');
        const majorSelect = document.getElementById('major');
        
        if (programSelect) {
            programSelect.addEventListener('change', () => {
                // Re-scan all job blocks when program changes
                document.querySelectorAll('.job-entry').forEach(autoScanDegreeRelevance);
            });
        }
        
        if (majorSelect) {
            majorSelect.addEventListener('change', () => {
                // Re-scan all job blocks when major changes
                document.querySelectorAll('.job-entry').forEach(autoScanDegreeRelevance);
            });
        }
    }

    // Replace the old scanRelevance function with the new analytical version
    function scanRelevance(entry, jobTitle) {
        autoScanDegreeRelevance(entry);
    }

    // Initialize the scanner
    initializeDegreeRelevanceScanner();

    // ================================================================
    // CANCEL BUTTON CONFIRMATION
    // ================================================================
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();

            
            Swal.fire({
                title: 'Cancel Adding Alumni?',
                text: 'Are you sure you want to cancel adding this alumni record?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, Cancel',
                cancelButtonText: 'Continue Editing'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/records';
                }
            });
        });
    }

    // ================================================================
    // FORM SUBMIT
    // ================================================================
    const form = document.querySelector(".form-container");

    if (form) {
        form.addEventListener("submit", function (e) {
            // Contact validation
            if (!validateContact()) {
                e.preventDefault();
                alert("Invalid contact number! Must be 11 digits starting with 09.");
                if (contactInput) contactInput.focus();
                return;
            }

            // Check required fields
            const requiredFields = [
                document.querySelector('input[name="stud_num_input"]'),
                document.querySelector('input[name="first_name"]'),
                document.querySelector('input[name="last_name"]'),
                document.querySelector('input[name="contact_num"]'),
                document.querySelector('select[name="program"]'),
                document.querySelector('select[name="major"]'),
                document.querySelector('input[name="address"]'),
                document.querySelector('input[name="email"]')
            ];
            
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
            
            for (let field of requiredFields) {
                if (!field || !field.value.trim()) {
                    e.preventDefault();
                    alert('Please fill in all required fields before submitting.');
                    if (field) field.focus();
                    return;
                }
            }

            const confirmSubmit = confirm("Are you informations you input are correct?");
            if (!confirmSubmit) {
                e.preventDefault();
                return;
            }
        });
    }
});