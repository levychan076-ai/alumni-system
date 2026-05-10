// Test the Degree Relevance Scanner logic

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

// Main scanner function
function testScanner(program, major, jobTitle, sector) {
    console.log("\n=== STARTING DEGREE RELEVANCE SCAN ===");
    
    // DEBUG: Print raw values
    console.log("RAW VALUES:");
    console.log("Program:", program);
    console.log("Major:", major);
    console.log("Job Title:", jobTitle);
    console.log("Sector:", sector);
    
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
    console.log("=== SCAN COMPLETE ===\n");
    
    return finalResult;
}

// Run all test cases
function runAllTests() {
    console.log("==========================================");
    console.log("DEGREE RELEVANCE SCANNER TEST SUITE");
    console.log("==========================================\n");
    
    const testCases = [
        {
            name: "CASE 1: BEED + Teacher",
            program: "BEED",
            major: "Basic Education", 
            job: "Teacher",
            sector: "Government",
            expected: "Directly Related"
        },
        {
            name: "CASE 2: BSIT + Software Engineer",
            program: "BSIT",
            major: "Software Development",
            job: "Software Engineer", 
            sector: "Private",
            expected: "Directly Related"
        },
        {
            name: "CASE 3: BSBA + Marketing Specialist",
            program: "BSBA",
            major: "Business Management",
            job: "Marketing Specialist",
            sector: "Private", 
            expected: "Directly Related"
        },
        {
            name: "CASE 4: BEED + Office Staff",
            program: "BEED",
            major: "Basic Education",
            job: "Office Staff",
            sector: "Government",
            expected: "Slightly Related"
        },
        {
            name: "CASE 5: BSIT + Farmer",
            program: "BSIT", 
            major: "Software Development",
            job: "Farmer",
            sector: "Agriculture",
            expected: "Not Related"
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((testCase, index) => {
        console.log(`TEST ${index + 1}: ${testCase.name}`);
        console.log("----------------------------------------");
        
        const result = testScanner(testCase.program, testCase.major, testCase.job, testCase.sector);
        const status = result === testCase.expected ? "✅ PASS" : "❌ FAIL";
        
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Actual: ${result}`);
        console.log(`Status: ${status}`);
        
        if (result === testCase.expected) {
            passed++;
        } else {
            failed++;
        }
        
        console.log("----------------------------------------\n");
    });
    
    console.log("==========================================");
    console.log("TEST SUMMARY");
    console.log("==========================================");
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log("\n🎉 ALL TESTS PASSED! The scanner is working correctly.");
    } else {
        console.log(`\n⚠️  ${failed} test(s) failed. Please review the logic.`);
    }
}

// Run the tests
runAllTests();
