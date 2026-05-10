// Initialize dashboard when DOM is loaded
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

    // ================= CLOCK =================
    const clockDisplay = document.getElementById("clockDisplay");

    function updateClock() {
        if (!clockDisplay) return;
        const now = new Date();
        const datePart = now.toLocaleDateString("en-PH", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
        const timePart = now.toLocaleTimeString("en-PH", {
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
        clockDisplay.textContent = datePart + "   |   " + timePart;
    }

    setInterval(updateClock, 1000);
    updateClock();

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

    // ================= BAR CHART COLOR =================
    function getBarColor(label) {
        const l = (label || "").toLowerCase();
        if (l.includes("database"))  return "rgba(0, 51, 153, 0.82)";
        if (l.includes("web"))       return "rgba(102, 178, 255, 0.85)";
        if (l.includes("beed"))      return "rgba(184, 134, 11, 0.82)";
        if (l.includes("bsba"))      return "rgba(153, 0, 0, 0.82)";
        return "rgba(13, 110, 253, 0.75)";
    }

    // ================= PIE COLORS =================
    const EMPLOYMENT_COLORS = {
        "Employed"       : "#1a73e8",
        "Unemployed"     : "#ea4335",
        "Self-Employed"  : "#fbbc04",
        "Unknown"        : "#bdbdbd"
    };

    const RELEVANCE_COLORS = {
        "Directly Related" : "#1a73e8",
        "Slightly Related" : "#fbbc04",
        "Not Related"      : "#ea4335",
        "Unknown"          : "#bdbdbd"
    };

    function getPieColors(labels, colorMap) {
        return labels.map(l => colorMap[l] || "#9e9e9e");
    }

    // ================= CUSTOM LEGEND =================
    function buildLegend(containerId, labels, colors, counts) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";

        labels.forEach((label, i) => {
            const item = document.createElement("div");
            item.className = "legend-item";

            const dot = document.createElement("span");
            dot.className = "legend-dot";
            dot.style.background = colors[i];

            const text = document.createElement("span");
            text.className = "legend-text";
            text.textContent = label;

            const count = document.createElement("span");
            count.className = "legend-count";
            count.textContent = counts[i] !== undefined ? counts[i] : "";

            item.appendChild(dot);
            item.appendChild(text);
            item.appendChild(count);
            container.appendChild(item);
        });
    }

    // ================= PROGRAM SUMMARY =================
    fetch("/api/program_summary")
        .then(res => res.json())
        .then(data => {
            console.log('Program summary data:', data); // Debug log

            function render(programKey, totalId, majorsId) {
                const el  = document.getElementById(totalId);
                const mEl = document.getElementById(majorsId);

                if (!data[programKey]) {
                    if (el)  el.innerText = "0";
                    if (mEl) mEl.innerHTML = "<div class='major-row' style='color:#aaa;font-size:12px;'>No data</div>";
                    return;
                }

                if (el) el.innerText = data[programKey].total;

                let html = "";
                for (const m in data[programKey].majors) {
                    html += `<div class="major-row">
                        <span class="major-name">${m}</span>
                        <span class="major-count">${data[programKey].majors[m]}</span>
                    </div>`;
                }
                if (mEl) mEl.innerHTML = html || "<div class='major-row' style='color:#aaa;font-size:12px;'>No majors</div>";
            }

            render("BSIT", "bsitTotal", "bsitMajors");
            render("BSBA", "bsbaTotal", "bsbaMajors");
            render("BEED", "beedTotal", "beedMajors");

            // ================= TOTAL ALUMNI COUNTER =================
            const bsitCount = data["BSIT"] ? data["BSIT"].total : 0;
            const bsbaCount = data["BSBA"] ? data["BSBA"].total : 0;
            const beedCount = data["BEED"] ? data["BEED"].total : 0;
            const grandTotal = bsitCount + bsbaCount + beedCount;

            const totalEl = document.getElementById("totalAlumni");
            if (totalEl) totalEl.innerText = grandTotal;

            const totalBsitEl = document.getElementById("totalBsit");
            if (totalBsitEl) totalBsitEl.innerText = bsitCount;

            const totalBsbaEl = document.getElementById("totalBsba");
            if (totalBsbaEl) totalBsbaEl.innerText = bsbaCount;

            const totalBeedEl = document.getElementById("totalBeed");
            if (totalBeedEl) totalBeedEl.innerText = beedCount;
        })
        .catch(err => {
            console.error("Program summary error:", err);
            // Set fallback values
            document.getElementById('totalAlumni').innerText = '0';
            document.getElementById('totalBsit').innerText = '0';
            document.getElementById('totalBsba').innerText = '0';
            document.getElementById('totalBeed').innerText = '0';
        });

    // ================= GRADUATES BAR CHART =================
    fetch("/api/combined_graduates")
        .then(res => res.json())
        .then(data => {
            console.log('Combined graduates data:', data); // Debug log

            const ctx = document.getElementById("combinedChart");
            if (!ctx) {
                console.error('Combined chart canvas not found');
                return;
            }

            if (!data.labels || !data.datasets) {
                console.warn('No chart data available');
                return;
            }

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: data.labels || [],
                    datasets: (data.datasets || []).map(d => ({
                        label: d.label,
                        data: d.data.map(v => Math.trunc(v || 0)),
                        backgroundColor: getBarColor(d.label),
                        borderRadius: 3,
                        borderSkipped: false
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: "top",
                            labels: {
                                font: { size: 11, family: "inherit" },
                                padding: 14,
                                boxWidth: 12,
                                boxHeight: 12
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: ctx => " " + ctx.dataset.label + ": " + (ctx.raw || 0)
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Graduation Year",
                                font: { size: 11, family: "inherit" },
                                color: "#666"
                            },
                            grid: { display: false },
                            ticks: { font: { size: 11 } }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                font: { size: 11 }
                            },
                            title: {
                                display: true,
                                text: "Number of Graduates",
                                font: { size: 11, family: "inherit" },
                                color: "#666"
                            }
                        }
                    }
                }
            });
        })
        .catch(err => {
            console.error("Graduates chart error:", err);
            // Show error message in chart container
            const ctx = document.getElementById("combinedChart");
            if (ctx && ctx.parentNode) {
                ctx.parentNode.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Failed to load chart data</div>';
            }
        });

    // ================= EMPLOYMENT PIE CHART =================
    fetch("/api/employment_summary")
        .then(res => res.json())
        .then(data => {
            console.log('Employment summary data:', data); // Debug log

            const ctx = document.getElementById("employmentChart");
            if (!ctx) {
                console.error('Employment chart canvas not found');
                return;
            }

            const labels = data.labels || [];
            const counts = data.counts || [];
            const colors = getPieColors(labels, EMPLOYMENT_COLORS);

            if (labels.length === 0) {
                console.warn('No employment data available');
                return;
            }

            new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: "#fff",
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "60%",
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => " " + ctx.label + ": " + (ctx.raw || 0) + " alumni"
                            }
                        }
                    }
                }
            });

            buildLegend("employmentLegend", labels, colors, counts);
        })
        .catch(err => {
            console.error("Employment chart error:", err);
            const ctx = document.getElementById("employmentChart");
            if (ctx && ctx.parentNode) {
                ctx.parentNode.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Failed to load employment data</div>';
            }
        });

    // ================= RELEVANCE PIE CHART =================
    fetch("/api/relevance_summary")
        .then(res => res.json())
        .then(data => {
            console.log('Relevance summary data:', data); // Debug log

            const ctx = document.getElementById("relevanceChart");
            if (!ctx) {
                console.error('Relevance chart canvas not found');
                return;
            }

            const labels = data.labels || [];
            const counts = data.counts || [];
            const colors = getPieColors(labels, RELEVANCE_COLORS);

            if (labels.length === 0) {
                console.warn('No relevance data available');
                return;
            }

            new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: "#fff",
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "60%",
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => " " + ctx.label + ": " + (ctx.raw || 0) + " alumni"
                            }
                        }
                    }
                }
            });

            buildLegend("relevanceLegend", labels, colors, counts);
        })
        .catch(err => {
            console.error("Relevance chart error:", err);
            const ctx = document.getElementById("relevanceChart");
            if (ctx && ctx.parentNode) {
                ctx.parentNode.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Failed to load relevance data</div>';
            }
        });

    // ================= REPORTS FUNCTIONALITY =================
    let currentReportChart = null;
    let currentReportData = null;

    // Load initial statistics
    loadReportStatistics();

    function loadReportStatistics() {
        fetch('/api/report-statistics')
            .then(response => response.json())
            .then(data => {
                document.getElementById('totalAlumniStat').textContent = data.total_alumni || 0;
                document.getElementById('employedAlumniStat').textContent = data.employed_alumni || 0;
                document.getElementById('unemployedAlumniStat').textContent = data.unemployed_alumni || 0;
                document.getElementById('relevantWorkStat').textContent = data.relevant_work_percentage + '%' || '0%';
            })
            .catch(err => console.error('Error loading statistics:', err));
    }

    // Generate report based on selected type
    window.generateReport = function() {
        const reportType = document.getElementById('reportType').value;
        
        fetch(`/api/generate-report/${reportType}`)
            .then(response => response.json())
            .then(data => {
                currentReportData = data;
                displayReport(data, reportType);
                if (data.chart_data) {
                    displayReportChart(data.chart_data, reportType);
                }
            })
            .catch(err => {
                console.error('Error generating report:', err);
                showError('Failed to generate report. Please try again.');
            });
    };

    function displayReport(data, reportType) {
        const reportContent = document.getElementById('reportContent');
        const reportCharts = document.getElementById('reportCharts');
        
        // Hide placeholder
        const placeholder = reportContent.querySelector('.report-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Generate HTML based on report type
        let html = '';
        
        switch(reportType) {
            case 'summary':
                html = generateSummaryReport(data);
                break;
            case 'graduates-year':
                html = generateGraduatesYearReport(data);
                break;
            case 'employment-status':
                html = generateEmploymentStatusReport(data);
                break;
            case 'program-stats':
                html = generateProgramStatsReport(data);
                break;
            case 'sector-stats':
                html = generateSectorStatsReport(data);
                break;
            case 'relevance-stats':
                html = generateRelevanceStatsReport(data);
                break;
            case 'tracking':
                html = generateTrackingReport(data);
                break;
            case 'recent':
                html = generateRecentReport(data);
                break;
        }
        
        reportContent.innerHTML = html;
        reportCharts.style.display = data.chart_data ? 'block' : 'none';
    }

    function generateSummaryReport(data) {
        return `
            <h4>Alumni Summary Report</h4>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Alumni</td>
                        <td>${data.total_alumni}</td>
                        <td>100%</td>
                    </tr>
                    <tr>
                        <td>Employed Alumni</td>
                        <td>${data.employed_alumni}</td>
                        <td>${data.employed_percentage}%</td>
                    </tr>
                    <tr>
                        <td>Unemployed Alumni</td>
                        <td>${data.unemployed_alumni}</td>
                        <td>${data.unemployed_percentage}%</td>
                    </tr>
                    <tr>
                        <td>Self-Employed</td>
                        <td>${data.self_employed}</td>
                        <td>${data.self_employed_percentage}%</td>
                    </tr>
                    <tr>
                        <td>Degree-Relevant Work</td>
                        <td>${data.relevant_work}</td>
                        <td>${data.relevant_work_percentage}%</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    function generateGraduatesYearReport(data) {
        let rows = '';
        data.graduates_by_year.forEach(item => {
            rows += `
                <tr>
                    <td>${item.year}</td>
                    <td>${item.total}</td>
                    <td>${item.bsit || 0}</td>
                    <td>${item.bsba || 0}</td>
                    <td>${item.beed || 0}</td>
                </tr>
            `;
        });
        
        return `
            <h4>Graduates Per Year Report</h4>
            <p>Graduation statistics by academic year and program</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Total</th>
                        <th>BSIT</th>
                        <th>BSBA</th>
                        <th>BEED</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function generateEmploymentStatusReport(data) {
        let rows = '';
        data.employment_status.forEach(item => {
            rows += `
                <tr>
                    <td>${item.status}</td>
                    <td>${item.count}</td>
                    <td>${item.percentage}%</td>
                </tr>
            `;
        });
        
        return `
            <h4>Employment Status Report</h4>
            <p>Current employment status distribution</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Employment Status</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function generateProgramStatsReport(data) {
        let rows = '';
        data.program_stats.forEach(item => {
            rows += `
                <tr>
                    <td>${item.program}</td>
                    <td>${item.count}</td>
                    <td>${item.percentage}%</td>
                    <td>${item.employed_count || 0}</td>
                    <td>${item.employment_rate || 0}%</td>
                </tr>
            `;
        });
        
        return `
            <h4>Degree Program Statistics Report</h4>
            <p>Alumni distribution by degree program</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Program</th>
                        <th>Total Alumni</th>
                        <th>Percentage</th>
                        <th>Employed</th>
                        <th>Employment Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function generateSectorStatsReport(data) {
        let rows = '';
        data.sector_stats.forEach(item => {
            rows += `
                <tr>
                    <td>${item.sector}</td>
                    <td>${item.count}</td>
                    <td>${item.percentage}%</td>
                </tr>
            `;
        });
        
        return `
            <h4>Employment Sector Statistics Report</h4>
            <p>Distribution of alumni across employment sectors</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Sector</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function generateRelevanceStatsReport(data) {
        let rows = '';
        data.relevance_stats.forEach(item => {
            rows += `
                <tr>
                    <td>${item.relevance}</td>
                    <td>${item.count}</td>
                    <td>${item.percentage}%</td>
                </tr>
            `;
        });
        
        return `
            <h4>Work Relevance Statistics Report</h4>
            <p>Degree relevance to current employment</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Relevance Level</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function generateTrackingReport(data) {
        let rows = '';
        data.tracking_data.forEach(item => {
            rows += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.program}</td>
                    <td>${item.graduation_year}</td>
                    <td>${item.employment_status}</td>
                    <td>${item.job_title || 'N/A'}</td>
                    <td>${item.employment_sector || 'N/A'}</td>
                </tr>
            `;
        });
        
        return `
            <h4>Alumni Employment Tracking Report</h4>
            <p>Detailed employment information for alumni</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Program</th>
                        <th>Graduation Year</th>
                        <th>Employment Status</th>
                        <th>Job Title</th>
                        <th>Sector</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function generateRecentReport(data) {
        let rows = '';
        data.recent_alumni.forEach(item => {
            rows += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.program}</td>
                    <td>${item.major}</td>
                    <td>${item.date_added}</td>
                    <td>${item.added_by}</td>
                </tr>
            `;
        });
        
        return `
            <h4>Recently Added Alumni Report</h4>
            <p>Alumni records added in the last 30 days</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Program</th>
                        <th>Major</th>
                        <th>Date Added</th>
                        <th>Added By</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function displayReportChart(chartData, reportType) {
        const ctx = document.getElementById('reportChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (currentReportChart) {
            currentReportChart.destroy();
        }
        
        const chartConfig = {
            type: chartData.type || 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: chartData.type === 'pie' || chartData.type === 'doughnut'
                    },
                    title: {
                        display: true,
                        text: chartData.title || 'Report Chart'
                    }
                },
                scales: chartData.type === 'bar' || chartData.type === 'line' ? {
                    y: {
                        beginAtZero: true
                    }
                } : undefined
            }
        };
        
        currentReportChart = new Chart(ctx, chartConfig);
    }

    // Export functions
    window.exportPDF = function() {
        if (!currentReportData) {
            showError('Please generate a report first');
            return;
        }
        
        const reportType = document.getElementById('reportType').value;
        window.open(`/api/export-pdf/${reportType}`, '_blank');
    };

    window.exportExcel = function() {
        if (!currentReportData) {
            showError('Please generate a report first');
            return;
        }
        
        const reportType = document.getElementById('reportType').value;
        window.open(`/api/export-excel/${reportType}`, '_blank');
    };

    window.printReport = function() {
        if (!currentReportData) {
            showError('Please generate a report first');
            return;
        }
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            showError('Please allow pop-ups for this site to print reports');
            return;
        }
        
        const reportType = document.getElementById('reportType').value;
        const reportTitle = reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Get report content
        const reportContent = document.getElementById('reportContent').innerHTML;
        const reportCharts = document.getElementById('reportCharts');
        
        // Build print HTML
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle} Report</title>
                <style>
                    @page {
                        margin: 0.5in;
                        size: portrait;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #1a73e8;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #1a73e8;
                        margin: 0;
                        font-size: 24px;
                    }
                    .header p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        font-size: 11px;
                    }
                    .report-table th,
                    .report-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .report-table th {
                        background-color: #1a73e8;
                        color: white;
                        font-weight: bold;
                    }
                    .report-table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #666;
                        font-size: 10px;
                    }
                    .no-print {
                        display: none;
                    }
                    @media print {
                        body { margin: 0; }
                        .header { page-break-after: avoid; }
                        .report-table { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${reportTitle} Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    <p>Nueva Ecija University of Science and Technology - Talavera Academic Extension Campus</p>
                </div>
                
                <div class="content">
                    ${reportContent}
                </div>
                
                <div class="footer">
                    <p>Page <span class="page-number"></span> of <span class="total-pages"></span></p>
                    <p>© ${new Date().getFullYear()} NEUST Talavera Academic Extension Campus</p>
                </div>
                
                <script>
                    // Simple page numbering
                    window.onload = function() {
                        // Add page numbers if needed
                        document.querySelectorAll('.page-number').forEach(el => {
                            el.textContent = '1';
                        });
                        document.querySelectorAll('.total-pages').forEach(el => {
                            el.textContent = '1';
                        });
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    function showError(message) {
        Swal.fire({
            title: 'Error!',
            text: message,
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }

    // ================= REAL-TIME DATA SYNCHRONIZATION =================
    
    // Function to refresh all dashboard data
    function refreshDashboardData() {
        console.log('Refreshing dashboard data...');
        
        // Refresh program summary
        fetch("/api/program_summary")
            .then(res => res.json())
            .then(data => {
                console.log('Updated program summary:', data);
                updateProgramCards(data);
            })
            .catch(err => console.error("Error refreshing program summary:", err));
        
        // Refresh charts
        refreshCharts();
        
        // Refresh report statistics
        loadReportStatistics();
    }
    
    // Function to update program cards
    function updateProgramCards(data) {
        // Update BSIT
        const bsitTotal = document.getElementById("bsitTotal");
        const bsitMajors = document.getElementById("bsitMajors");
        if (data["BSIT"]) {
            if (bsitTotal) bsitTotal.innerText = data["BSIT"].total;
            
            let html = "";
            for (const m in data["BSIT"].majors) {
                html += `<div class="major-row">
                    <span class="major-name">${m}</span>
                    <span class="major-count">${data["BSIT"].majors[m]}</span>
                </div>`;
            }
            if (bsitMajors) bsitMajors.innerHTML = html || "<div class='major-row' style='color:#aaa;font-size:12px;'>No majors</div>";
        }
        
        // Update BSBA
        const bsbaTotal = document.getElementById("bsbaTotal");
        const bsbaMajors = document.getElementById("bsbaMajors");
        if (data["BSBA"]) {
            if (bsbaTotal) bsbaTotal.innerText = data["BSBA"].total;
            
            let html = "";
            for (const m in data["BSBA"].majors) {
                html += `<div class="major-row">
                    <span class="major-name">${m}</span>
                    <span class="major-count">${data["BSBA"].majors[m]}</span>
                </div>`;
            }
            if (bsbaMajors) bsbaMajors.innerHTML = html || "<div class='major-row' style='color:#aaa;font-size:12px;'>No majors</div>";
        }
        
        // Update BEED
        const beedTotal = document.getElementById("beedTotal");
        const beedMajors = document.getElementById("beedMajors");
        if (data["BEED"]) {
            if (beedTotal) beedTotal.innerText = data["BEED"].total;
            
            let html = "";
            for (const m in data["BEED"].majors) {
                html += `<div class="major-row">
                    <span class="major-name">${m}</span>
                    <span class="major-count">${data["BEED"].majors[m]}</span>
                </div>`;
            }
            if (beedMajors) beedMajors.innerHTML = html || "<div class='major-row' style='color:#aaa;font-size:12px;'>No majors</div>";
        }
        
        // Update total counts
        const bsitCount = data["BSIT"] ? data["BSIT"].total : 0;
        const bsbaCount = data["BSBA"] ? data["BSBA"].total : 0;
        const beedCount = data["BEED"] ? data["BEED"].total : 0;
        const grandTotal = bsitCount + bsbaCount + beedCount;
        
        const totalEl = document.getElementById("totalAlumni");
        if (totalEl) totalEl.innerText = grandTotal;
        
        const totalBsitEl = document.getElementById("totalBsit");
        if (totalBsitEl) totalBsitEl.innerText = bsitCount;
        
        const totalBsbaEl = document.getElementById("totalBsba");
        if (totalBsbaEl) totalBsbaEl.innerText = bsbaCount;
        
        const totalBeedEl = document.getElementById("totalBeed");
        if (totalBeedEl) totalBeedEl.innerText = beedCount;
    }
    
    // Function to refresh charts
    function refreshCharts() {
        // Refresh graduates chart
        fetch("/api/combined_graduates")
            .then(res => res.json())
            .then(data => {
                console.log('Updated graduates data:', data);
                // Update existing chart if it exists
                const ctx = document.getElementById("combinedChart");
                if (ctx && ctx.chart) {
                    ctx.chart.data.labels = data.labels || [];
                    ctx.chart.data.datasets = (data.datasets || []).map(d => ({
                        label: d.label,
                        data: d.data.map(v => Math.trunc(v || 0)),
                        backgroundColor: getBarColor(d.label),
                        borderRadius: 3,
                        borderSkipped: false
                    }));
                    ctx.chart.update();
                }
            })
            .catch(err => console.error("Error refreshing graduates chart:", err));
        
        // Refresh employment chart
        fetch("/api/employment_summary")
            .then(res => res.json())
            .then(data => {
                console.log('Updated employment data:', data);
                const ctx = document.getElementById("employmentChart");
                if (ctx && ctx.chart) {
                    const labels = data.labels || [];
                    const counts = data.counts || [];
                    const colors = getPieColors(labels, EMPLOYMENT_COLORS);
                    
                    ctx.chart.data.labels = labels;
                    ctx.chart.data.datasets[0].data = counts;
                    ctx.chart.data.datasets[0].backgroundColor = colors;
                    ctx.chart.update();
                    
                    buildLegend("employmentLegend", labels, colors, counts);
                }
            })
            .catch(err => console.error("Error refreshing employment chart:", err));
        
        // Refresh relevance chart
        fetch("/api/relevance_summary")
            .then(res => res.json())
            .then(data => {
                console.log('Updated relevance data:', data);
                const ctx = document.getElementById("relevanceChart");
                if (ctx && ctx.chart) {
                    const labels = data.labels || [];
                    const counts = data.counts || [];
                    const colors = getPieColors(labels, RELEVANCE_COLORS);
                    
                    ctx.chart.data.labels = labels;
                    ctx.chart.data.datasets[0].data = counts;
                    ctx.chart.data.datasets[0].backgroundColor = colors;
                    ctx.chart.update();
                    
                    buildLegend("relevanceLegend", labels, colors, counts);
                }
            })
            .catch(err => console.error("Error refreshing relevance chart:", err));
    }
    
    // Auto-refresh every 5 minutes
    setInterval(refreshDashboardData, 5 * 60 * 1000);
    
    // Listen for visibility changes to refresh when page becomes active
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            refreshDashboardData();
        }
    });
    
    // Listen for custom events from other operations
    window.addEventListener('alumniDataChanged', function() {
        console.log('Alumni data changed, refreshing dashboard...');
        refreshDashboardData();
    });
    
    // Store chart references for updates
    const originalChart = Chart;
    Chart = function(ctx, config) {
        const chart = new originalChart(ctx, config);
        ctx.chart = chart;
        return chart;
    };
    Object.setPrototypeOf(Chart, originalChart);
    Object.setPrototypeOf(Chart.prototype, originalChart.prototype);
    

    // Logout confirmation
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
            console.log('SweetAlert result:', result); // Debug log
            if (result.isConfirmed) {
                // User confirmed logout - redirect to logout route
                console.log('User confirmed logout, redirecting...'); // Debug log
                window.location.href = '/logout';
            } else {
                console.log('User cancelled logout'); // Debug log
            }
            // If user clicks "Cancel", stay on current page (do nothing)
        });
    }

}); // End DOMContentLoaded