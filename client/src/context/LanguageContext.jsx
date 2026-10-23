import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation & Common
    home: 'Home',
    issues: 'Community Issues',
    activities: 'Volunteer Activities',
    impact: 'Social Impact',
    aboutSevadeep: 'About Sevadeep',
    contact: 'Contact',
    reportIssue: 'Report an Issue',
    dashboard: 'Dashboard',
    login: 'Log In',
    register: 'Register',
    logout: 'Log Out',
    myReports: 'My Reports',
    volunteerWorkspace: 'Volunteer Desk',
    residentWorkspace: 'Resident Workspace',
    coordinatorPanel: 'Staff Portal',
    impactIntelligence: 'Impact Intelligence',
    recurringLocations: 'Recurring Locations',
    followUpsDue: 'Follow-ups Due',
    interventionsVerified: 'Interventions Verified',
    recurrenceFree: 'Locations Remaining Recurrence-Free',
    pts: 'pts',
    guestVisitor: 'Guest Visitor',
    currentPersona: 'Current Persona',
    quickRoleSwitcher: 'Quick Role Switcher:',
    coordinatorRole: 'Coordinator (Admin)',
    volunteerRole: 'Field Volunteer',
    residentRole: 'Community Resident',
    demonstrationMode: 'Demonstration Mode',

    // Common Actions & Badges
    viewDetails: 'View Details',
    supportConfirm: 'Support / Confirm',
    shareWhatsApp: 'Share on WhatsApp',
    chronicHotspot: 'Chronic Hotspot',
    resolved: 'Resolved',
    inProgress: 'In Progress',
    approved: 'Approved',
    underReview: 'Under Review',
    submitted: 'Submitted',
    rejected: 'Rejected',
    needsMoreInfo: 'Needs More Info',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    submit: 'Submit',

    // Hero Section
    heroBadge: 'Sevadeep NGO • Pune Community Platform',
    heroTitle1: 'See a Problem?',
    heroTitle2: 'Help Us Make a Difference.',
    heroSubtitle: 'Join hands with Sevadeep to identify community problems, organize local action, and build cleaner, safer, and more sustainable neighborhoods across Pune.',
    reportIssueHero: 'Report a Community Issue',
    exploreActivitiesHero: 'Explore Community Activities',
    verifiedCoordinatorReview: 'Verified Coordinator Review',
    openStreetMapGeo: 'OpenStreetMap Geolocation',
    communityVolunteerAction: 'Community Volunteer Action',
    missionPhotoTitle: 'Sevadeep Grassroots Cleanliness Mission',
    missionPhotoDesc: 'Deccan Gymkhana & Mutha Riverfront Volunteer Drive, Pune. Real citizens collaborating to transform neglected public spots.',
    floatingBadgeTitle: 'Pune Civic Portal',
    floatingBadgeSub: '100% Grassroots NGO Led',

    // How It Works
    howItWorksBadge: 'Transparent Workflow',
    howItWorksTitle: 'How Sevadeep CivicConnect Works',
    howItWorksSubtitle: 'Our four-step cycle ensures local grievances are properly recorded, reviewed by coordinators, acted upon with volunteers, and verified by the community.',
    step1Title: 'Report',
    step1Desc: 'Residents report a local civic problem with photo proof and an interactive Pune OpenStreetMap location pin.',
    step1Status: '• Initial status: Pending Review',
    step2Title: 'Review',
    step2Desc: 'Sevadeep coordinators evaluate the report, verify validity, and decide on volunteer mobilization or PMC municipal referral.',
    step2Status: '• Status: Approved / Escalated',
    step3Title: 'Take Action',
    step3Desc: 'Assigned volunteers and community members organize on-site cleanup, remediation, or liaison with municipal ward teams.',
    step3Status: '• Status: In Progress',
    step4Title: 'Track Impact',
    step4Desc: 'Residents follow real-time progress, review before/after photo proof, and submit verification feedback to close the report.',
    step4Status: '• Status: Verified Resolved',

    // Community Impact (Statistics)
    impactBadge: 'Measurable Outcomes',
    impactTitle: 'Community Impact & Verified Improvements',
    impactSubtitle: 'Directly calculated from database records. We never invent or inflate actual NGO outcomes.',
    liveDbBadge: '📊 Live Database Records (Demonstration Mode)',
    grievancesResolved: 'Grievances Resolved',
    verifiedOnSite: 'Verified on-site by coordinator',
    cleanupDrivesCompleted: 'Cleanup Drives Completed',
    drivesLocation: 'In Deccan, Mutha & Kothrud',
    activeVolunteers: 'Active Volunteers',
    citizenChampions: 'Grassroots citizen champions',
    wasteDiverted: 'Waste Segregated & Diverted',
    recycledPmc: 'Recycled with PMC authorized units',
    viewFullImpact: 'View Full Social Impact Report, Transparency Disclosures & Before/After Proof',

    // Recent Issues Section
    recentIssuesTitle: 'Recent Community Issues',
    recentIssuesSubtitle: 'Public reports submitted by Pune residents and approved by Sevadeep coordinators.',
    exploreAllIssues: 'Explore All Issues & Map',
    loadingReports: 'Loading approved community reports...',
    noPhotoEvidence: 'No Photo Evidence',
    confirmations: 'confirmations',
    details: 'Details',

    // Upcoming Activities Section
    communityDrivesBadge: 'Community Drives',
    upcomingActivitiesTitle: 'Upcoming Sevadeep Activities in Pune',
    upcomingActivitiesSubtitle: 'Join our weekend cleanup drives, tree plantations, and lake restoration missions.',
    viewAllActivities: 'View All Activities & Register',
    slotsRemaining: 'Slots remaining:',
    registerNow: 'Register Now',

    // About Sevadeep Section
    aboutBadge: 'Grassroots Non-Profit Organization',
    aboutTitle: 'About Sevadeep NGO, Pune',
    aboutP1: 'Sevadeep NGO is a registered non-profit organization operating in Pune, Maharashtra. We work tirelessly with community members, students, environmentalists, and municipal authorities to protect green cover, clean riverbanks, resolve neglected neighborhood grievances, and promote civic responsibility.',
    aboutP2: 'Through CivicConnect, we bridge the gap between citizens who spot local issues and volunteers ready to take action. When problems require government intervention, we formally document and escalate the issue to Pune Municipal Corporation (PMC).',
    readMission: 'Read Full Mission & Governance',
    contactCoordinators: 'Contact Coordinators',
    teamPhotoCaption: 'Sevadeep Pune team coordinators & volunteer leaders after a weekend community drive.',

    // CTA Section
    ctaTitle: 'Ready to Make Pune Cleaner and Greener?',
    ctaSubtitle: 'Whether reporting a pothole or waste dump, joining an afforestation drive, or coordinating community teams — your voice creates lasting change.',
    ctaReportNow: 'Report a Civic Issue Now',
    ctaVolunteer: 'Sign Up as Volunteer',

    // Volunteer Dashboard
    volWorkspace: 'Sevadeep Volunteer Workspace',
    volDashboardTitle: 'Volunteer Dashboard:',
    volDashboardDesc: 'Manage your assigned field actions, upload completion photographs, and track your volunteer service hours in Pune.',
    impactPoints: 'Impact Points',
    assignedTasks: 'Assigned Tasks',
    generateCertificate: 'Generate Official Certificate',
    myAssignedTasks: 'My Assigned Community Tasks',
    coordinatorReviewRequired: 'Coordinator reviews required before ticket closure',
    loadingAssignedTasks: 'Loading assigned tasks...',
    allCaughtUp: 'All Caught Up!',
    noPendingTasks: 'You currently have no pending assigned tasks. Explore upcoming weekend community drives!',
    browseActivities: 'Browse Volunteer Activities',
    coordinatorInstructions: 'Coordinator Instructions:',
    defaultInstructions: 'Please visit location, assess situation, and coordinate cleanup.',
    taskStatus: 'Task Status:',
    uploadActionProof: 'Upload Action Proof',
    updateTaskProgress: 'Update Field Progress',
    updateModalDesc: 'Submit on-ground verification, completion notes, and photographic proof.',
    newProgressStatus: 'Progress Status',
    uploadCompletionPhoto: 'Upload Completion / In-Progress Photo',
    notesPlaceholder: 'Describe what action was taken (e.g. 5 sacks of waste collected, area sanitized...)',
    submittingUpdate: 'Submitting...',
    submitFieldReport: 'Submit Field Report',

    // Volunteer Certificate Modal
    certHeaderTitle: 'Sevadeep Official Volunteer Recognition',
    certAppreciation: 'Certificate of Volunteer Appreciation',
    certPresented: 'This is proudly presented to',
    certReason: 'In sincere appreciation of dedicated volunteer service, community commitment, and proactive contribution towards environmental conservation, public cleanliness, and civic improvement across Pune, Maharashtra.',
    certServiceHours: 'Certified Service Hours',
    certImpactScore: 'Civic Impact Score',
    certVerification: 'Verified Non-Profit Record',
    certDirector: 'Dr. Ananya Joshi',
    certDirectorTitle: 'Executive Director, Sevadeep NGO Pune',
    printDownload: 'Print / Download Certificate',

    // Resident / Member Dashboard
    residentWorkspaceBadge: 'Community Resident Workspace',
    welcomeBack: 'Welcome back,',
    residentDesc: 'Track the status of your reported problems, review coordinator feedback, and follow community confirmations.',
    civicPoints: 'Civic Points',
    reportNewIssue: 'Report New Issue',
    mySubmittedReports: 'My Submitted Community Reports',
    includesStatuses: 'Includes pending, in-review, and approved issues',
    loadingMyReports: 'Loading your reports...',
    noReportsYet: "You haven't reported any issues yet",
    noReportsDesc: 'Notice garbage dumps, broken footpaths, or water leaks in your Pune neighborhood? Report it today!',
    reportIssueNowBtn: 'Report an Issue Now',
    coordinatorUpdate: 'Coordinator Update:',
    viewIssueDetails: 'View Full Details & Status',

    // Footer
    footerAbout: 'Empowering Pune residents to identify civic problems, collaborate with grassroots volunteers, and build cleaner, safer, and more sustainable neighborhoods together.',
    coreMotto: 'Our Core Motto',
    mottoQuote: '"Your Community. Your Voice. Together, We Create Change."',
    quickNavigation: 'Quick Navigation',
    homeLink: 'Home Page',
    reportIssueLink: 'Report a Local Issue',
    searchIssuesLink: 'Search Community Issues',
    volunteerDrivesLink: 'Volunteer Cleanliness Drives',
    impactTransparencyLink: 'Social Impact & Transparency',
    puneWardsCovered: 'Pune Wards Covered',
    wardsList: 'Deccan Gymkhana, Shivajinagar, Kothrud, Swargate, Hadapsar, Kasba Peth, Viman Nagar, Aundh',
    contactNgo: 'Contact Sevadeep NGO',
    officeAddress: 'Office: Fergusson College Road, Shivajinagar, Pune 411004, Maharashtra',
    phone: 'Phone: +91 98220 11000 / +91 20 2553 0000',
    email: 'Email: contact@sevadeep.org',
    hours: 'Hours: Mon – Sat, 9:00 AM – 6:00 PM IST',
    allRightsReserved: 'All rights reserved. Dedicated to civic action in Pune.'
  },
  mr: {
    // Navigation & Common
    home: 'मुख्यपृष्ठ',
    issues: 'नागरी समस्या',
    activities: 'स्वयंसेवक उपक्रम',
    impact: 'सामाजिक प्रभाव',
    aboutSevadeep: 'सेवादीप विषयी',
    contact: 'संपर्क',
    reportIssue: 'नागरी तक्रार नोंदवा',
    dashboard: 'डॅशबोर्ड',
    login: 'लॉग इन',
    register: 'नोंदणी करा',
    logout: 'बाहेर पडा',
    myReports: 'माझ्या तक्रारी',
    volunteerWorkspace: 'स्वयंसेवक कार्यकक्ष',
    residentWorkspace: 'नागरिक कार्यकक्ष',
    coordinatorPanel: 'समन्वयक प्रशासन कक्ष',
    impactIntelligence: 'इम्पॅक्ट इंटेलिजन्स',
    recurringLocations: 'वारंवार होणाऱ्या समस्यांची ठिकाणे',
    followUpsDue: 'पुनर्तपासणी बाकी',
    interventionsVerified: 'प्रमाणित उपाययोजना',
    recurrenceFree: 'पुनरावृत्तीमुक्त ठिकाणे',
    pts: 'गुण',
    guestVisitor: 'अतिथी भेट देणारे',
    currentPersona: 'सध्याची भूमिका',
    quickRoleSwitcher: 'जलद भूमिका बदला:',
    coordinatorRole: 'समन्वयक (प्रशासक)',
    volunteerRole: 'क्षेत्रीय स्वयंसेवक',
    residentRole: 'परिसरातील नागरिक',
    demonstrationMode: 'प्रात्यक्षिक मोड',

    // Common Actions & Badges
    viewDetails: 'तपशील पहा',
    supportConfirm: 'पाठिंबा द्या',
    shareWhatsApp: 'व्हॉट्सॲपवर पाठवा',
    chronicHotspot: 'वारंवार कचरा होणारे ठिकाण',
    resolved: 'निकाली काढले',
    inProgress: 'काम सुरू आहे',
    approved: 'मंजूर',
    underReview: 'पुनरावलोकन सुरू',
    submitted: 'दाखल केले',
    rejected: 'नाकारले',
    needsMoreInfo: 'अधिक माहिती हवी',
    critical: 'अतिगंभीर',
    high: 'गंभीर',
    medium: 'मध्यम',
    low: 'कमी',
    cancel: 'रद्द करा',
    close: 'बंद करा',
    save: 'जतन करा',
    submit: 'सादर करा',

    // Hero Section
    heroBadge: 'सेवादीप स्वयंसेवी संस्था • पुणे नागरी मंच',
    heroTitle1: 'परिसरात समस्या दिसली?',
    heroTitle2: 'चला, एकत्र मिळून बदल घडवूया.',
    heroSubtitle: 'पुणे शहरातील नागरी समस्या सोडवण्यासाठी, स्थानिक पातळीवर कृती करण्यासाठी आणि आपला परिसर स्वच्छ, सुरक्षित व सुंदर बनवण्यासाठी सेवादीपसोबत हातमिळवणी करा.',
    reportIssueHero: 'नागरी समस्या नोंदवा',
    exploreActivitiesHero: 'स्वयंसेवक उपक्रम पहा',
    verifiedCoordinatorReview: 'समन्वयकांद्वारे प्रत्यक्ष पडताळणी',
    openStreetMapGeo: 'अचूक जिओ-मॅप स्थान',
    communityVolunteerAction: 'स्थानिक स्वयंसेवकांची थेट कृती',
    missionPhotoTitle: 'सेवादीप तळागाळातील स्वच्छता मोहीम',
    missionPhotoDesc: 'डेक्कन जिमखाना आणि मुठा नदीकाठ स्वच्छता मोहीम, पुणे. दुर्लक्षित सार्वजनिक ठिकाणे बदलण्यासाठी नागरिकांचा एकत्र सहभाग.',
    floatingBadgeTitle: 'पुणे नागरी सुधारणा पोर्टल',
    floatingBadgeSub: '१००% लोकसहभागातून संचलित संस्था',

    // How It Works
    howItWorksBadge: 'पारदर्शक कार्यपद्धती',
    howItWorksTitle: 'सेवादीप सिविक-कनेक्ट कसे कार्य करते?',
    howItWorksSubtitle: 'आमची ४-टप्प्यांची कार्यपद्धती स्थानिक समस्यांची अचूक नोंदणी, समन्वयकांचे पुनरावलोकन, स्वयंसेवकांची कृती आणि नागरिकांकडून थेट पडताळणी सुनिश्चित करते.',
    step1Title: '१. तक्रार नोंदवा',
    step1Desc: 'नागरिक समस्येचा फोटो आणि पुण्यातील अचूक नकाशा स्थानासह आपली नागरी तक्रार सहज नोंदवू शकतात.',
    step1Status: '• सुरुवातीची स्थिती: पुनरावलोकन बाकी',
    step2Title: '२. पडताळणी',
    step2Desc: 'सेवादीप समन्वयक तक्रारीची पडताळणी करतात आणि स्वयंसेवक पाठवायचे की पुणे महानगरपालिकेकडे वर्ग करायचे ते ठरवतात.',
    step2Status: '• स्थिती: मंजूर / मनपाकडे पाठवले',
    step3Title: '३. प्रत्यक्ष कृती',
    step3Desc: 'नेमलेले स्वयंसेवक आणि स्थानिक नागरिक प्रत्यक्ष जागेवर जाऊन स्वच्छता, दुरुस्ती किंवा मनपा क्षेत्रीय कार्यालयाशी समन्वय साधतात.',
    step3Status: '• स्थिती: काम सुरू आहे',
    step4Title: '४. पडताळणी व परिणाम',
    step4Desc: 'नागरिक कामाची प्रगती पाहू शकतात, कामापूर्वीचे आणि नंतरचे फोटो तपासून तक्रार पूर्ण झाल्याची पुष्टी करू शकतात.',
    step4Status: '• स्थिती: प्रमाणित निकाल',

    // Community Impact (Statistics)
    impactBadge: 'प्रत्यक्ष मोजता येणारे परिणाम',
    impactTitle: 'सामाजिक प्रभाव आणि प्रत्यक्ष सुधारणा',
    impactSubtitle: 'थेट डेटाबेस नोंदींमधून संकलित केलेले आकडे. सेवादीप कोणत्याही आकडेवारीत अतिशयोक्ती करत नाही.',
    liveDbBadge: '📊 थेट डेटाबेस नोंदी (प्रात्यक्षिक मोड)',
    grievancesResolved: 'निकाली काढलेल्या तक्रारी',
    verifiedOnSite: 'समन्वयकांद्वारे प्रत्यक्ष जागेवर प्रमाणित',
    cleanupDrivesCompleted: 'पूर्ण झालेल्या स्वच्छता मोहिमा',
    drivesLocation: 'डेक्कन, मुठा नदी आणि कोथरूड परिसरात',
    activeVolunteers: 'सक्रिय स्वयंसेवक',
    citizenChampions: 'परिसरातील जागरूक नागरिक',
    wasteDiverted: 'वर्गीकृत व विल्हेवाट लावलेला कचरा',
    recycledPmc: 'पुणे महानगरपालिकेच्या अधिकृत केंद्रांमार्फत पुनर्प्रक्रिया',
    viewFullImpact: 'संपूर्ण सामाजिक प्रभाव अहवाल, पारदर्शकता तपशील आणि छायाचित्रे पहा',

    // Recent Issues Section
    recentIssuesTitle: 'परिसरातील अलीकडील समस्या',
    recentIssuesSubtitle: 'पुण्यातील नागरिकांनी नोंदवलेल्या आणि सेवादीप समन्वयकांनी मंजूर केलेल्या समस्या.',
    exploreAllIssues: 'सर्व समस्या आणि नकाशा पहा',
    loadingReports: 'तक्रारी लोड होत आहेत...',
    noPhotoEvidence: 'छायाचित्र उपलब्ध नाही',
    confirmations: 'नागरिकांचे समर्थन',
    details: 'तपशील',

    // Upcoming Activities Section
    communityDrivesBadge: 'सामाजिक उपक्रम',
    upcomingActivitiesTitle: 'पुण्यातील आगामी सेवादीप उपक्रम',
    upcomingActivitiesSubtitle: 'आमच्या शनिवार-रविवारच्या स्वच्छता मोहिमा, वृक्षारोपण आणि जलसंधारण उपक्रमांत सहभागी व्हा.',
    viewAllActivities: 'सर्व उपक्रम पहा आणि नोंदणी करा',
    slotsRemaining: 'शिल्लक जागा:',
    registerNow: 'सहभागी व्हा',

    // About Sevadeep Section
    aboutBadge: 'तळागाळातील स्वयंसेवी संस्था',
    aboutTitle: 'सेवादीप स्वयंसेवी संस्था, पुणे विषयी',
    aboutP1: 'सेवादीप ही पुणे, महाराष्ट्र येथे कार्यरत असलेली नोंदणीकृत स्वयंसेवी संस्था आहे. आम्ही नागरिक, विद्यार्थी, पर्यावरणप्रेमी आणि मनपा प्रशासनासोबत काम करून शहरात वृक्षसंपदा वाढवणे, नदीकाठ स्वच्छ ठेवणे, परिसरातील दुर्लक्षित समस्या सोडवणे आणि नागरिक कर्तव्य भावना वाढवण्यासाठी कार्यरत आहोत.',
    aboutP2: 'सिविक-कनेक्टच्या माध्यमातून आम्ही समस्या पाहणारे नागरिक आणि कृती करण्यास तयार असलेले स्वयंसेवक यांना जोडतो. ज्या समस्यांसाठी सरकारी मदतीची गरज असते, त्या आम्ही अधिकृतपणे पुणे महानगरपालिकेकडे पाठवतो.',
    readMission: 'संपूर्ण ध्येय आणि कार्यप्रणाली वाचा',
    contactCoordinators: 'समन्वयकांशी संपर्क साधा',
    teamPhotoCaption: 'आठवड्याच्या शेवटी स्वच्छता मोहिमेनंतर सेवादीप पुणे समन्वयक आणि स्वयंसेवक नेते.',

    // CTA Section
    ctaTitle: 'पुण्याला अधिक स्वच्छ आणि हरित बनवण्यासाठी तयार आहात?',
    ctaSubtitle: 'कचरा किंवा खड्डे यांची तक्रार नोंदवणे असो, वृक्षारोपणात सहभागी होणे असो किंवा स्वयंसेवक चमूचे नेतृत्व करणे असो — तुमचा प्रत्येक पुढाकार महत्त्वाचा आहे.',
    ctaReportNow: 'आताच नागरी तक्रार नोंदवा',
    ctaVolunteer: 'स्वयंसेवक म्हणून सामील व्हा',

    // Volunteer Dashboard
    volWorkspace: 'सेवादीप स्वयंसेवक कार्यकक्ष',
    volDashboardTitle: 'स्वयंसेवक डॅशबोर्ड:',
    volDashboardDesc: 'तुम्हाला सोपवलेल्या क्षेत्रीय कामांचे व्यवस्थापन करा, काम पूर्ण झाल्याचे फोटो अपलोड करा आणि तुमचे सेवा तास तपासा.',
    impactPoints: 'प्रभाव गुण',
    assignedTasks: 'सोपवलेली कामे',
    generateCertificate: 'अधिकृत प्रमाणपत्र मिळवा',
    myAssignedTasks: 'माझ्याकडे सोपवलेली नागरी कामे',
    coordinatorReviewRequired: 'तक्रार बंद करण्यापूर्वी समन्वयकांचे पुनरावलोकन आवश्यक',
    loadingAssignedTasks: 'सोपवलेली कामे लोड होत आहेत...',
    allCaughtUp: 'सर्व कामे पूर्ण झाली आहेत!',
    noPendingTasks: 'सध्या तुमच्याकडे कोणतेही काम प्रलंबित नाही. आगामी शनिवार-रविवारच्या स्वच्छता मोहिमा पहा!',
    browseActivities: 'स्वयंसेवक उपक्रम पहा',
    coordinatorInstructions: 'समन्वयकांच्या सूचना:',
    defaultInstructions: 'कृपया घटनास्थळी भेट द्या, परिस्थितीची पाहणी करा आणि स्वच्छता मोहिमेचे नियोजन करा.',
    taskStatus: 'कामाची स्थिती:',
    uploadActionProof: 'कृतीचा पुरावा / फोटो अपलोड करा',
    updateTaskProgress: 'कामाची प्रगती नोंदवा',
    updateModalDesc: 'प्रत्यक्ष पाहणी अहवाल, कामाची माहिती आणि छायाचित्र पुरावा सादर करा.',
    newProgressStatus: 'प्रगतीची स्थिती',
    uploadCompletionPhoto: 'पूर्ण झालेल्या कामाचा फोटो अपलोड करा',
    notesPlaceholder: 'काय कारवाई केली त्याचे वर्णन लिहा (उदा. ५ पोती कचरा उचलला, औषध फवारणी केली...)',
    submittingUpdate: 'सादर करत आहे...',
    submitFieldReport: 'क्षेत्रीय अहवाल सादर करा',

    // Volunteer Certificate Modal
    certHeaderTitle: 'सेवादीप अधिकृत स्वयंसेवक सन्मान',
    certAppreciation: 'स्वयंसेवक प्रशंसा प्रमाणपत्र',
    certPresented: 'हे प्रमाणपत्र अभिमानाने सन्मानपूर्वक बहाल करण्यात येत आहे',
    certReason: 'पुणे, महाराष्ट्र परिसरामध्ये पर्यावरण संवर्धन, सार्वजनिक स्वच्छता आणि नागरी सुधारणेसाठी दिलेल्या समर्पित सेवेबद्दल आणि सक्रिय योगदानाबद्दल हे प्रमाणपत्र कृतज्ञतापूर्वक प्रदान करण्यात येत आहे.',
    certServiceHours: 'प्रमाणित सेवा तास',
    certImpactScore: 'नागरी प्रभाव गुण',
    certVerification: 'प्रमाणित स्वयंसेवी संस्था नोंद',
    certDirector: 'डॉ. अनन्या जोशी',
    certDirectorTitle: 'कार्यकारी संचालक, सेवादीप स्वयंसेवी संस्था, पुणे',
    printDownload: 'प्रमाणपत्र प्रिंट / डाउनलोड करा',

    // Resident / Member Dashboard
    residentWorkspaceBadge: 'परिसरातील नागरिक कार्यकक्ष',
    welcomeBack: 'स्वागत आहे,',
    residentDesc: 'तुम्ही नोंदवलेल्या समस्यांची सद्यस्थिती तपासा, समन्वयकांचे अभिप्राय पहा आणि इतर नागरिकांचे समर्थन जाणून घ्या.',
    civicPoints: 'नागरी गुण',
    reportNewIssue: 'नवीन समस्या नोंदवा',
    mySubmittedReports: 'मी नोंदवलेल्या नागरी तक्रारी',
    includesStatuses: 'प्रलंबित, पुनरावलोकन आणि मंजूर सर्व तक्रारींचा समावेश',
    loadingMyReports: 'तुमच्या तक्रारी लोड होत आहेत...',
    noReportsYet: 'तुम्ही अद्याप कोणतीही समस्या नोंदवलेली नाही',
    noReportsDesc: 'तुमच्या परिसरात कचऱ्याचे ढीग, तुटलेले फुटपाथ किंवा पाण्याची गळती दिसल्यास आजच तक्रार नोंदवा!',
    reportIssueNowBtn: 'आताच तक्रार नोंदवा',
    coordinatorUpdate: 'समन्वयक सूचना / अभिप्राय:',
    viewIssueDetails: 'पूर्ण तपशील व सद्यस्थिती पहा',

    // Footer
    footerAbout: 'पुण्यातील नागरिकांना समस्या ओळखण्यासाठी, स्वयंसेवकांशी समन्वय साधण्यासाठी आणि आपला परिसर स्वच्छ, सुरक्षित व सुंदर बनवण्यासाठी सक्षम करत आहोत.',
    coreMotto: 'आमचे ब्रीदवाक्य',
    mottoQuote: '"तुमचा परिसर. तुमचा आवाज. एकत्र मिळून आणूया बदल."',
    quickNavigation: 'जलद दुवे',
    homeLink: 'मुख्यपृष्ठ',
    reportIssueLink: 'नागरी तक्रार नोंदवा',
    searchIssuesLink: 'समस्या शोधा व पहा',
    volunteerDrivesLink: 'स्वयंसेवक स्वच्छता मोहिमा',
    impactTransparencyLink: 'सामाजिक प्रभाव व पारदर्शकता',
    puneWardsCovered: 'कार्यरत पुणे मनपा प्रभाग',
    wardsList: 'डेक्कन जिमखाना, शिवाजीनगर, कोथरूड, स्वारगेट, हडपसर, कसबा पेठ, विमान नगर, औंध',
    contactNgo: 'सेवादीप संस्थेशी संपर्क',
    officeAddress: 'कार्यालय: फर्ग्युसन कॉलेज रस्ता, शिवाजीनगर, पुणे ४११००४, महाराष्ट्र',
    phone: 'फोन: +९१ ९८२२० ११००० / +९१ २० २५५३ ००००',
    email: 'ईमेल: contact@sevadeep.org',
    hours: 'वेळ: सोम – शनि, सकाळी ९:०० ते संध्याकाळी ६:००',
    allRightsReserved: 'सर्व हक्क राखीव. पुणे नागरी सेवेसाठी समर्पित.'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sevadeep_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sevadeep_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  const t = (key, fallback) => {
    if (translations[lang] && translations[lang][key] !== undefined) {
      return translations[lang][key];
    }
    if (translations['en'] && translations['en'][key] !== undefined) {
      return translations['en'][key];
    }
    return fallback !== undefined ? fallback : key;
  };

  const translateCategory = (cat) => {
    if (!cat) return '';
    if (lang === 'mr') {
      const map = {
        'Garbage and Waste Management': 'कचरा आणि सांडपाणी व्यवस्थापन',
        'Public Cleanliness': 'सार्वजनिक स्वच्छता',
        'Water Leakage': 'पाण्याची गळती',
        'Damaged Public Facilities': 'सार्वजनिक सुविधांचे नुकसान',
        'Environmental Problems': 'पर्यावरणीय समस्या',
        'Other Community Issues': 'इतर नागरी समस्या'
      };
      return map[cat] || cat;
    }
    return cat;
  };

  const translateStatus = (st) => {
    if (!st) return '';
    if (lang === 'mr') {
      const map = {
        'Submitted': 'दाखल केले',
        'Under Review': 'पुनरावलोकन सुरू',
        'Approved': 'मंजूर',
        'In Progress': 'काम सुरू आहे',
        'Resolved': 'निकाली काढले',
        'Needs More Information': 'अधिक माहिती हवी',
        'Needs More Info': 'अधिक माहिती हवी',
        'Rejected': 'नाकारले',
        'Pending Assignment': 'नियुक्ती बाकी',
        'Assigned': 'नेमणूक झाली',
        'Optimal': 'पूर्ण उपस्थिती',
        'Understaffed': 'अपूर्ण उपस्थिती',
        'Uncovered': 'स्वयंसेवक बाकी'
      };
      return map[st] || st;
    }
    return st;
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      toggleLanguage,
      t,
      translateCategory,
      translateStatus
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
