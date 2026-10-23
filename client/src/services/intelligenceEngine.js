/**
 * SEVADEEP CIVIC IMPACT INTELLIGENCE ENGINE
 * Core Analytical Algorithms & Deterministic Rule Engine
 * 
 * Provides:
 * 1. Spatiotemporal Clustering & Duplicate Detection
 * 2. Recurrence Frequency & Timeline Analysis
 * 3. Transparent Configurable Priority Scoring with Reason Codes
 * 4. Curated Intervention Recommendation Rules
 * 5. Deterministic AI-Style Natural Language Explanations
 * 6. Sustained Resolution & Observation Window Calculations
 */

// Default Priority Scoring Weights (Configurable)
export const DEFAULT_WEIGHTS = {
  severityWeight: 0.30,
  recurrenceWeight: 0.25,
  timeUnresolvedWeight: 0.15,
  confirmationsWeight: 0.10,
  environmentalWeight: 0.10,
  urgencyWeight: 0.10
};

// Default Analysis Settings
export const DEFAULT_SETTINGS = {
  analysisWindowDays: 60,
  clusteringRadiusMeters: 250,
  observationWindowDays: 30,
  duplicateDistanceMeters: 50,
  duplicateTimeWindowHours: 12
};

/**
 * Calculate Haversine distance between two coordinates in meters
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter incidents within the specified analysis window
 */
export function filterIncidentsByWindow(incidents, windowDays, referenceDate = new Date('2026-10-23T20:00:00Z')) {
  const cutoffTime = new Date(referenceDate).getTime() - (windowDays * 24 * 60 * 60 * 1000);
  return incidents.filter(inc => {
    const reportTime = new Date(inc.reportedAt).getTime();
    return reportTime >= cutoffTime;
  });
}

/**
 * Duplicate Submissions Detection
 * Identifies submissions that are close in distance and time
 */
export function detectDuplicates(incidents, distanceThreshold = 50, timeWindowHours = 12) {
  const sorted = [...incidents].sort((a, b) => new Date(a.reportedAt) - new Date(b.reportedAt));
  const duplicateMap = new Map();
  const physicalIncidents = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    let isDupe = false;
    let primaryMatch = null;

    // Check against prior non-duplicate incidents
    for (const primary of physicalIncidents) {
      const dist = calculateDistanceMeters(
        current.coordinates[0], current.coordinates[1],
        primary.coordinates[0], primary.coordinates[1]
      );
      const timeDiffHours = Math.abs(
        (new Date(current.reportedAt) - new Date(primary.reportedAt)) / (1000 * 60 * 60)
      );

      if (dist <= distanceThreshold && timeDiffHours <= timeWindowHours) {
        // Also verify category similarity if available
        isDupe = true;
        primaryMatch = primary;
        break;
      }
    }

    if (isDupe && primaryMatch) {
      duplicateMap.set(current.id, {
        isDuplicate: true,
        primaryId: primaryMatch.id,
        reason: `Within ${Math.round(distanceThreshold)}m and ${timeWindowHours}h of ${primaryMatch.id}`
      });
    } else {
      duplicateMap.set(current.id, { isDuplicate: false, primaryId: null });
      physicalIncidents.push(current);
    }
  }

  return { duplicateMap, physicalCount: physicalIncidents.length, totalSubmissions: incidents.length };
}

/**
 * Calculate Data Sufficiency & Confidence
 */
export function calculateDataSufficiency(scenario, physicalIncidents) {
  let score = 0;
  const missingFields = [];

  if (physicalIncidents.length > 0) {
    const hasAnyProof = physicalIncidents.some(i => !!i.photo || (i.confirmations > 0));
    score += hasAnyProof ? 30 : 15;
  } else {
    missingFields.push('No physical incidents found in window');
  }

  // Check photographic evidence
  const incidentsWithPhoto = physicalIncidents.filter(i => !!i.photo);
  if (incidentsWithPhoto.length === physicalIncidents.length && physicalIncidents.length > 0) {
    score += 30;
  } else if (incidentsWithPhoto.length > 0) {
    score += 15;
    missingFields.push('Some incidents lack photographic evidence');
  } else {
    score -= 10; // Penalty for zero photo proof
    missingFields.push('Missing all incident photographs');
  }

  // Check community confirmations
  const totalConfirmations = physicalIncidents.reduce((acc, i) => acc + (i.confirmations || 0), 0);
  if (totalConfirmations >= 10) {
    score += 20;
  } else if (totalConfirmations > 0) {
    score += 10;
  } else {
    missingFields.push('No community confirmations or corroboration');
  }

  // Check coordinates precision
  if (scenario.coordinates && scenario.coordinates[0] && scenario.coordinates[1]) {
    score += 20;
  } else {
    missingFields.push('Imprecise geospatial coordinates');
  }

  let rating = 'High Confidence';
  if (score < 50) rating = 'Low / Insufficient Evidence';
  else if (score < 75) rating = 'Moderate Confidence';

  return {
    score: Math.max(0, Math.min(100, score)),
    rating,
    isSufficient: score >= 50,
    missingFields,
    photoCoveragePercent: physicalIncidents.length ? Math.round((incidentsWithPhoto.length / physicalIncidents.length) * 100) : 0
  };
}

/**
 * Recurrence Analysis
 */
export function analyzeRecurrence(scenario, windowDays = 60, referenceDate = new Date('2026-10-23T20:00:00Z')) {
  const allIncidents = scenario.incidents || [];
  const windowIncidents = filterIncidentsByWindow(allIncidents, windowDays, referenceDate);
  const { duplicateMap, physicalCount } = detectDuplicates(windowIncidents);

  // Filter out duplicates for physical timeline analysis
  const physicalList = windowIncidents.filter(inc => !duplicateMap.get(inc.id)?.isDuplicate);

  // Days since most recent incident
  let daysSinceLast = null;
  if (physicalList.length > 0) {
    const latestDate = new Date(Math.max(...physicalList.map(i => new Date(i.reportedAt))));
    daysSinceLast = Math.max(0, Math.floor((referenceDate - latestDate) / (1000 * 60 * 60 * 24)));
  }

  // Calculate average interval between physical incidents (in days)
  let averageIntervalDays = null;
  if (physicalList.length >= 2) {
    const sorted = [...physicalList].sort((a, b) => new Date(a.reportedAt) - new Date(b.reportedAt));
    let totalSpanDays = (new Date(sorted[sorted.length - 1].reportedAt) - new Date(sorted[0].reportedAt)) / (1000 * 60 * 60 * 24);
    averageIntervalDays = Math.max(1, Math.round(totalSpanDays / (physicalList.length - 1)));
  }

  // Previous interventions
  const interventions = scenario.previousInterventions || [];
  const completedInterventions = interventions.filter(i => i.outcomeStatus === 'Completed');

  // Check if recurrence occurred AFTER an intervention
  let recurrenceAfterIntervention = false;
  let recurrenceLagDays = null;

  if (completedInterventions.length > 0) {
    const lastInterventionDate = new Date(Math.max(...completedInterventions.map(i => new Date(i.date))));
    const postInterventionIncidents = physicalList.filter(i => new Date(i.reportedAt) > lastInterventionDate);

    if (postInterventionIncidents.length > 0) {
      recurrenceAfterIntervention = true;
      const firstRelapseDate = new Date(Math.min(...postInterventionIncidents.map(i => new Date(i.reportedAt))));
      recurrenceLagDays = Math.max(0, Math.floor((firstRelapseDate - lastInterventionDate) / (1000 * 60 * 60 * 24)));
    }
  }

  // Check pending follow-up state
  const pendingFollowUp = scenario.pendingFollowUp || {};
  const isFollowUpOverdue = pendingFollowUp.dueDate
    ? new Date(referenceDate) > new Date(pendingFollowUp.dueDate)
    : false;

  // Determine recurrence classification
  let recurrenceCategory = 'Isolated Single Event';
  let isChronic = false;

  if (physicalCount >= 3 || (physicalCount >= 2 && recurrenceAfterIntervention)) {
    recurrenceCategory = 'Chronic Black Spot';
    isChronic = true;
  } else if (recurrenceAfterIntervention) {
    recurrenceCategory = 'Post-Resolution Relapse';
  } else if (physicalCount >= 2 && averageIntervalDays !== null && averageIntervalDays <= 7) {
    recurrenceCategory = 'Rapid Emerging Hotspot';
  } else if (physicalCount >= 2) {
    recurrenceCategory = 'Intermittent Recurrence';
  }

  return {
    windowDays,
    totalSubmissionsInWindow: windowIncidents.length,
    physicalIncidentCount: physicalCount,
    duplicateCount: windowIncidents.length - physicalCount,
    daysSinceLast,
    averageIntervalDays,
    completedInterventionsCount: completedInterventions.length,
    recurrenceAfterIntervention,
    recurrenceLagDays,
    isFollowUpOverdue,
    recurrenceCategory,
    isChronic
  };
}

/**
 * Transparent Priority Scoring Engine with Reason Codes
 */
export function calculatePriorityScore(scenario, recurrenceData, sufficiencyData, weights = DEFAULT_WEIGHTS) {
  // Normalize components to 0 - 100
  const physicalIncidents = (scenario.incidents || []).filter(i => !i.isDuplicate);

  // 1. Severity Component (0-100)
  const maxSeverity = physicalIncidents.reduce((max, inc) => {
    const s = inc.severity;
    if (s === 'Critical') return Math.max(max, 100);
    if (s === 'High') return Math.max(max, 75);
    if (s === 'Medium') return Math.max(max, 45);
    return Math.max(max, 20);
  }, 20);

  // 2. Recurrence Frequency Component (0-100)
  // 1 incident = 20, 2 = 50, 3 = 75, 4+ = 100
  let recurrenceScore = 0;
  if (recurrenceData.physicalIncidentCount >= 4) recurrenceScore = 100;
  else if (recurrenceData.physicalIncidentCount === 3) recurrenceScore = 80;
  else if (recurrenceData.physicalIncidentCount === 2) recurrenceScore = 55;
  else if (recurrenceData.physicalIncidentCount === 1) recurrenceScore = 25;

  if (recurrenceData.recurrenceAfterIntervention) {
    recurrenceScore = Math.min(100, recurrenceScore + 20);
  }

  // 3. Time Unresolved Component (0-100)
  // If recent < 3 days -> 80 (fresh urgency), if > 30 days stagnant -> 100
  let timeScore = 50;
  if (recurrenceData.daysSinceLast !== null) {
    if (recurrenceData.daysSinceLast <= 2) timeScore = 90;
    else if (recurrenceData.daysSinceLast <= 7) timeScore = 75;
    else if (recurrenceData.daysSinceLast <= 14) timeScore = 55;
    else timeScore = 35;
  }

  // 4. Community Confirmations Component (0-100)
  const totalConfirmations = physicalIncidents.reduce((acc, i) => acc + (i.confirmations || 0), 0);
  const confirmationScore = Math.min(100, totalConfirmations * 3.5);

  // 5. Environmental Sensitivity Component (0-100)
  let envScore = 40;
  const sens = scenario.environmentalSensitivity || '';
  if (sens.toLowerCase().includes('critical')) envScore = 100;
  else if (sens.toLowerCase().includes('high')) envScore = 80;
  else if (sens.toLowerCase().includes('medium')) envScore = 50;
  else if (sens.toLowerCase().includes('low')) envScore = 20;

  // 6. Urgency Component (0-100)
  let urgencyScore = 30;
  if (recurrenceData.isFollowUpOverdue) urgencyScore += 40;
  if (scenario.pendingFollowUp?.isDue) urgencyScore += 25;
  urgencyScore = Math.min(100, urgencyScore);

  // Calculate raw weighted sum
  let rawScore = (
    maxSeverity * weights.severityWeight +
    recurrenceScore * weights.recurrenceWeight +
    timeScore * weights.timeUnresolvedWeight +
    confirmationScore * weights.confirmationsWeight +
    envScore * weights.environmentalWeight +
    urgencyScore * weights.urgencyWeight
  );

  // Apply Uncertainty & Data Insufficiency Penalty
  const reasonCodes = [];
  if (!sufficiencyData.isSufficient) {
    rawScore = Math.max(15, rawScore * 0.55); // Dampen score when data is ambiguous
    reasonCodes.push({
      code: 'INSUFFICIENT_EVIDENCE_PENALTY',
      label: 'Score lowered due to missing photographic evidence or uncorroborated report'
    });
  }

  // High-Severity Critical Override
  if (maxSeverity === 100 && rawScore < 85) {
    rawScore = Math.max(rawScore, 88);
    reasonCodes.push({
      code: 'CRITICAL_HAZARD_OVERRIDE',
      label: 'Critical environmental safety hazard elevated priority despite low recurrence history'
    });
  }

  if (recurrenceData.isChronic) {
    reasonCodes.push({
      code: 'CHRONIC_BLACK_SPOT',
      label: 'Multiple recurring occurrences detected across analysis window'
    });
  }

  if (recurrenceData.recurrenceAfterIntervention) {
    reasonCodes.push({
      code: 'POST_RESOLUTION_RELAPSE',
      label: 'Problem re-emerged after prior completed intervention'
    });
  }

  if (recurrenceData.recurrenceCategory === 'Rapid Emerging Hotspot') {
    reasonCodes.push({
      code: 'RAPID_SURGE_EMERGING',
      label: 'Sudden frequency acceleration detected in previously quiet zone'
    });
  }

  const finalScore = Math.round(Math.min(100, Math.max(1, rawScore)));

  let priorityTier = 'Low';
  if (finalScore >= 80) priorityTier = 'Critical';
  else if (finalScore >= 65) priorityTier = 'High';
  else if (finalScore >= 45) priorityTier = 'Medium';

  return {
    finalScore,
    priorityTier,
    breakdown: {
      severity: Math.round(maxSeverity),
      recurrence: Math.round(recurrenceScore),
      timeUnresolved: Math.round(timeScore),
      communityConfirmations: Math.round(confirmationScore),
      environmentalSensitivity: Math.round(envScore),
      urgency: Math.round(urgencyScore)
    },
    reasonCodes
  };
}

/**
 * Curated Intervention Recommendation Engine
 */
export function generateInterventionRecommendation(scenario, recurrenceData, priorityData, sufficiencyData) {
  const code = scenario.code || '';
  const category = scenario.category || '';
  const isChronic = recurrenceData.isChronic;
  const hasPostRelapse = recurrenceData.recurrenceAfterIntervention;

  // Default recommendation template
  let recommendation = {
    title: 'Comprehensive Field Inspection & Stakeholder Review',
    actionType: 'Field Inspection',
    responsibleParty: 'Sevadeep Field Coordinator + Municipal Ward Liaison',
    urgencyWindow: 'Within 48 Hours',
    confidenceScore: sufficiencyData.score,
    reasonForRecommendation: 'Assessment required to align intervention scope with field realities.',
    proposedNextAction: 'Dispatch senior coordinator to inspect physical site and interview nearby stakeholders.',
    requiredVerification: 'Coordinator signed photo inspection log and PMC liaison confirmation.',
    expectedFollowUpWindow: '7 Days post-inspection',
    stakeholderMatrix: {
      primary: 'Sevadeep Operations Wing',
      secondary: 'Ward Sanitary Inspector',
      communityRole: 'Resident Association Feedback'
    },
    requiredResources: ['Digital camera / inspection app', 'Measurement tape', 'Signage template']
  };

  // Rule 1: Chronic Waste Dumping Hotspot
  if (code === 'chronic_waste_dumping' || (category.includes('Garbage') && isChronic && hasPostRelapse)) {
    recommendation = {
      title: 'Root-Cause Commercial Source Audit & PMC Surveillance Coordination',
      actionType: 'Systemic Intervention & Surveillance',
      responsibleParty: 'Sevadeep Operations Head + PMC Solid Waste Management Dept',
      urgencyWindow: 'Within 24 Hours',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Repeated cleanups (730 kg cleared) have failed because waste reappears within 5-12 days. Simple repeat cleanup will waste volunteer effort without source containment.',
      proposedNextAction: 'Conduct nocturnal site surveillance to identify commercial dumping sources, request PMC solar CCTV and night Ghantagadi collection route adjustment.',
      requiredVerification: 'Verify shopkeeper garbage collection handover and monitor site daily for 14 continuous days.',
      expectedFollowUpWindow: '14 Days (Bi-weekly inspections)',
      stakeholderMatrix: {
        primary: 'Sevadeep Field Operations',
        secondary: 'PMC Ward 7 Solid Waste Management Dept',
        communityRole: 'Local Traders Association & Temple Trust'
      },
      requiredResources: ['Night surveillance log', 'Solar floodlight requisition', 'Marathi anti-dumping deterrent boards', 'Vendor waste survey sheets']
    };
  }
  // Rule 2: Overflowing Public Waste Bin
  else if (code === 'overflowing_public_bin' || (category.includes('Garbage') && scenario.title.toLowerCase().includes('bin'))) {
    recommendation = {
      title: 'Container Capacity Upgrade & Midday Secondary Clearance Request',
      actionType: 'Municipal Capacity Requisition',
      responsibleParty: 'PMC Solid Waste Management Department (Sanitary Ward Inspector)',
      urgencyWindow: 'Within 48 Hours',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: '240L bin is overflowing at 200% capacity due to high daytime market vegetable volume. Morning 7 AM clearance is insufficient for peak 11 AM-2 PM generation.',
      proposedNextAction: 'Submit formal PMC requisition for 1100L heavy-duty compactor bin and schedule a secondary 2:00 PM Ghantagadi clearance cycle.',
      requiredVerification: 'Sanitary Inspector receipt of requisition docket and photo verification of afternoon clearance.',
      expectedFollowUpWindow: '7 Days',
      stakeholderMatrix: {
        primary: 'PMC Ward Sanitary Inspector',
        secondary: 'Sevadeep Market Liaison',
        communityRole: 'Mandai Vegetable & Fruit Vendors Committee'
      },
      requiredResources: ['PMC Ward Requisition Form 4B', 'Waste volume measurement sheet', 'Vendor segregation flyers']
    };
  }
  // Rule 3: Water Leakage / Potable Mains Fissure
  else if (code === 'municipal_water_leak' || category.includes('Water Leakage')) {
    recommendation = {
      title: 'Statutory PMC Water Supply Escalation & Road Safety Barricade',
      actionType: 'Municipal Engineering Referral',
      responsibleParty: 'PMC Water Supply Department (Ward Executive Engineer)',
      urgencyWindow: 'Immediate (Within 4 Hours)',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Potable water main ruptured under roadway asphalt; loss exceeds 10,000L daily and creates road cavitation risk. Outside NGO manual repair scope.',
      proposedNextAction: 'Formal RTS statutory escalation under Maharashtra Public Services Act to Ward Executive Engineer. Deploy physical safety reflective cones.',
      requiredVerification: 'Municipal pipeline excavation docket number and road reinstatement sign-off.',
      expectedFollowUpWindow: '24 Hours statutory SLA',
      stakeholderMatrix: {
        primary: 'PMC Water Supply Engineering Cell',
        secondary: 'Traffic Police Branch (Shivajinagar/Deccan)',
        communityRole: 'Sevadeep Incident Monitor'
      },
      requiredResources: ['Reflective safety cones (4 units)', 'Hazard caution tape', 'PMC RTS Escalation Dossier']
    };
  }
  // Rule 4: Isolated Critical Toxic / Hazardous Dumping
  else if (code === 'isolated_critical_hazard' || priorityData.finalScore >= 85) {
    recommendation = {
      title: 'Emergency Hazardous Substance Containment & MPCB Notification',
      actionType: 'Hazardous Incident Response',
      responsibleParty: 'Maharashtra Pollution Control Board (MPCB) + PMC Disaster Management',
      urgencyWindow: 'Immediate (Critical Emergency)',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Industrial corrosive solvent drum actively discharging into natural lake feeder nala. Immediate toxic threat to Katraj reservoir ecosystem.',
      proposedNextAction: 'Notify MPCB regional field officer and PMC Disaster Cell; place absorbent earthen bund to arrest downstream waterbody ingress.',
      requiredVerification: 'MPCB industrial manifest sample analysis and hazardous material vacuum truck clearance receipt.',
      expectedFollowUpWindow: 'Daily until chemical threat neutralized',
      stakeholderMatrix: {
        primary: 'MPCB Field Inspector',
        secondary: 'PMC Disaster Management Cell',
        communityRole: 'Katraj Village Advisory Committee'
      },
      requiredResources: ['Chemical PPE hazard suits', 'Soil absorption barrier material', 'Emergency water quality testing kit']
    };
  }
  // Rule 5: Post-Resolution Relapse
  else if (code === 'recurrence_post_resolution' || hasPostRelapse) {
    recommendation = {
      title: 'Post-Remediation Relapse Investigation & Merchant Accountability Pact',
      actionType: 'Relapse Investigation',
      responsibleParty: 'Sevadeep Community Organizer + Viman Nagar Resident Forum',
      urgencyWindow: 'Within 72 Hours',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Site was resolved 25 days ago but commercial fast-food packaging has recurred. Another cleanup alone will not deter nightly food stalls.',
      proposedNextAction: 'Convene joint meeting with adjacent commercial food truck operators; establish private merchant waste collection contractor pact.',
      requiredVerification: 'Signed merchant waste charter and zero new dumping at Day 14 follow-up.',
      expectedFollowUpWindow: '14 Days',
      stakeholderMatrix: {
        primary: 'Viman Nagar Merchants Association',
        secondary: 'Sevadeep Monitoring Team',
        communityRole: 'Neighborhood Resident Watch'
      },
      requiredResources: ['Merchant code-of-conduct charter', 'Night surveillance log', 'Culvert mesh protector']
    };
  }
  // Rule 6: Duplicate Ingestion
  else if (code === 'duplicate_citizen_submissions') {
    recommendation = {
      title: 'Consolidated Incident Dispatch to PMC Tree Authority',
      actionType: 'Rapid Consolidated Dispatch',
      responsibleParty: 'PMC Tree Authority & Garden Department',
      urgencyWindow: 'Within 12 Hours',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Four distinct citizen reports clustered within 2.5 hours refer to a single fallen banyan branch on the FC Road footpath.',
      proposedNextAction: 'Merge 4 citizen tickets into master incident SVD-2026-106; alert PMC Tree cutting squad with motorized saw for pedestrian clearance.',
      requiredVerification: 'Photograph of cleared pavement and push notification sent to all 4 citizen reporters.',
      expectedFollowUpWindow: '24 Hours',
      stakeholderMatrix: {
        primary: 'PMC Tree Authority Woodcutting Squad',
        secondary: 'FC Road Traffic Ward',
        communityRole: 'Citizen Reporters (4 Corroborators)'
      },
      requiredResources: ['Motorized chain saw (PMC team)', 'Log transporter truck', 'Automated SMS / app status blast']
    };
  }
  // Rule 7: Insufficient Evidence / Ambiguous Report
  else if (code === 'insufficient_evidence' || !sufficiencyData.isSufficient) {
    recommendation = {
      title: 'Volunteer Ground Scout Verification & Photographic Ingestion',
      actionType: 'Evidence Gathering & Field Scout',
      responsibleParty: 'Sevadeep Hadapsar Volunteer Scout',
      urgencyWindow: 'Within 5 Days',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Complaint lacks photographs, specific landmark details, and community confirmations. Direct deployment of municipal machinery or cleanup crew is unwarranted without verification.',
      proposedNextAction: 'Assign a local student volunteer to visit Hadapsar Gadital flyover pillar #14, take geo-tagged photographs, and interview local shopkeeper.',
      requiredVerification: 'Two geo-tagged photos uploaded and problem category confirmed.',
      expectedFollowUpWindow: '3 Days',
      stakeholderMatrix: {
        primary: 'Sevadeep Volunteer Scout',
        secondary: 'Original Citizen Reporter (clarification call)',
        communityRole: 'Gadital Auto Stand Drivers'
      },
      requiredResources: ['Sevadeep Scout Mobile App', 'Verification checklist']
    };
  }
  // Rule 8: Multi-Stakeholder Municipal Dependency (Partial Progress)
  else if (code === 'municipal_dependency_partial') {
    recommendation = {
      title: 'Municipal Heavy Hydraulic Machinery Desilting Requisition',
      actionType: 'Inter-Agency Handover & Tracking',
      responsibleParty: 'PMC Road & Stormwater Drainage Department',
      urgencyWindow: 'Within 3 Days',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Sevadeep volunteers cleared 340 kg surface debris, but subsurface culvert remains 80% choked by concrete highway rubble requiring a backhoe excavator.',
      proposedNextAction: 'Maintain ticket in "Partially Completed / Municipal Dependency Active" state. Escalate PMC Docket #PMC-DRN-2026-4401 to Ward 9 Executive Engineer.',
      requiredVerification: 'Joint site inspection with PMC Junior Engineer following backhoe desilting.',
      expectedFollowUpWindow: '10 Days',
      stakeholderMatrix: {
        primary: 'PMC Ward 9 Drainage Division',
        secondary: 'Highway Authority (NHAI) Liaison',
        communityRole: 'Sevadeep Kothrud Volunteers'
      },
      requiredResources: ['JCB Hydraulic Excavator (PMC)', 'Silt disposal dumpers', 'Culvert depth water gauge']
    };
  }
  // Rule 9: Recurring Environmental Damage (Tekdi sapling trampling)
  else if (code === 'recurring_environmental_damage') {
    recommendation = {
      title: 'Physical Chicane Bollard Installation & Forest Trail Enforcement',
      actionType: 'Physical Access Control & Joint Patrol',
      responsibleParty: 'Forest Department Range Officer + Sevadeep Tekdi Guardians',
      urgencyWindow: 'Within 5 Days',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Replanting without physical barriers will fail again; bamboo guards cannot stop off-road motorcycles from crushing native saplings.',
      proposedNextAction: 'Fabricate and anchor heavy steel chicane bollards at slope compartment 4 entry that permit pedestrian access while blocking motorbikes.',
      requiredVerification: 'Installed steel bollards inspected and zero tire tracks recorded at Day 14 follow-up.',
      expectedFollowUpWindow: '14 Days',
      stakeholderMatrix: {
        primary: 'Maharashtra Forest Department (Range Forest Officer)',
        secondary: 'Sevadeep Greening Taskforce',
        communityRole: 'Vetal Tekdi Morning Walkers Association'
      },
      requiredResources: ['Steel chicane barrier gates (2 sets)', 'Concrete anchor mix', 'Indigenous Khair/Neem saplings (25 units)']
    };
  }
  // Rule 10: Newly Emerging Hotspot
  else if (code === 'newly_emerging_hotspot') {
    recommendation = {
      title: 'Early Preventative Stall Vendor Audit & Waste Bin Placement',
      actionType: 'Early Preventative Containment',
      responsibleParty: 'Sevadeep Baner Volunteer Circle + Baner Ward Sanitary Inspector',
      urgencyWindow: 'Within 72 Hours',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Sudden jump from 0 to 3 dumping incidents in 6 days linked to new evening food truck operators. Immediate intervention stops this from becoming a chronic black spot.',
      proposedNextAction: 'Audit 4 evening food truck vendors, mandate commercial bin placement outside each stall, and arrange commercial night collection route.',
      requiredVerification: 'All 4 vendors equipped with twin-dustbins and zero roadside litter on night audit.',
      expectedFollowUpWindow: '7 Days',
      stakeholderMatrix: {
        primary: 'Baner Ward Sanitary Team',
        secondary: 'Sevadeep Field Volunteers',
        communityRole: 'Food Truck Vendor Collective'
      },
      requiredResources: ['Commercial 120L wet/dry bin pairs (4 sets)', 'Anti-littering warning banners', 'Vendor pledge cards']
    };
  }
  // Rule 11: Sustained Resolution Success
  else if (code === 'sustained_resolution_success') {
    recommendation = {
      title: 'Maintain Quarterly Ecological Monitoring & Volunteer Recognition',
      actionType: 'Maintenance & Long-Term Stewardship',
      responsibleParty: 'Sevadeep Long-Term Ecology Cell + Forest Dept',
      urgencyWindow: 'Quarterly Routine Review',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Location has completed the mandatory 30-day observation window with 3 clean inspections and 0 new incidents following boulder barrier installation.',
      proposedNextAction: 'Transition location from Active Triage to "Sustained Ecological Victory". Include verified 650 kg diversion in annual donor impact disclosure.',
      requiredVerification: 'Quarterly photo archive check and tree canopy growth measurement.',
      expectedFollowUpWindow: '90 Days (Quarterly)',
      stakeholderMatrix: {
        primary: 'Sevadeep Ecological Audit Lead',
        secondary: 'Forest Department Beat Guard',
        communityRole: 'Taljai Morning Walkers Group'
      },
      requiredResources: ['Tree canopy growth chart', 'Quarterly inspection checklist']
    };
  }
  // Rule 12: Low Priority Addressed
  else if (code === 'low_priority_addressed') {
    recommendation = {
      title: 'Case Closed & Integrated into Community Cleanliness Index',
      actionType: 'Closed Case Stewardship',
      responsibleParty: 'Model Colony Resident Watch',
      urgencyWindow: 'Routine Review',
      confidenceScore: sufficiencyData.score,
      reasonForRecommendation: 'Minor aesthetic nuisance resolved 35 days ago with 0 recurrence across full observation window. High volunteer efficiency (INR 450 total cost).',
      proposedNextAction: 'Maintain current status as Sustained Resolution. No further NGO mobilization required.',
      requiredVerification: 'Monthly resident association pass-through.',
      expectedFollowUpWindow: '60 Days',
      stakeholderMatrix: {
        primary: 'Model Colony Resident Watch',
        secondary: 'Sevadeep Shivajinagar Coordinator',
        communityRole: 'Park Visitors'
      },
      requiredResources: ['None (Monitoring only)']
    };
  }

  return recommendation;
}

/**
 * Generate Explainable AI-Style Analytical Breakdown
 */
export function generateAnalyticalExplanation(scenario, recurrenceData, priorityData, recommendation, sufficiencyData) {
  const physicalIncidents = (scenario.incidents || []).filter(i => !i.isDuplicate);

  // 1. What the data shows
  let dataSummary = `Analysis of ${scenario.title} (${scenario.subtitle || scenario.area}) reveals ${recurrenceData.physicalIncidentCount} unique physical incidents `;
  if (recurrenceData.duplicateCount > 0) {
    dataSummary += `(consolidated from ${recurrenceData.totalSubmissionsInWindow} citizen submissions, filtering out ${recurrenceData.duplicateCount} duplicate entries) `;
  }
  dataSummary += `over the configured ${recurrenceData.windowDays}-day observation window. `;

  if (recurrenceData.daysSinceLast !== null) {
    dataSummary += `The most recent incident was recorded ${recurrenceData.daysSinceLast} days ago. `;
  }

  if (recurrenceData.averageIntervalDays) {
    dataSummary += `Incidents occur at an average interval of once every ${recurrenceData.averageIntervalDays} days. `;
  }

  // 2. Priority scoring rationale
  let priorityRationale = `Assigned a priority score of ${priorityData.finalScore}/100 (${priorityData.priorityTier} Priority). `;
  priorityRationale += `Key scoring drivers include: Severity weighted at ${priorityData.breakdown.severity}/100, `;
  priorityRationale += `Recurrence frequency at ${priorityData.breakdown.recurrence}/100, and `;
  priorityRationale += `Environmental sensitivity at ${priorityData.breakdown.environmentalSensitivity}/100. `;

  if (priorityData.reasonCodes.length > 0) {
    priorityRationale += `Rule activations: ${priorityData.reasonCodes.map(r => r.label).join('; ')}.`;
  }

  // 3. Uncertainties and data gaps
  let uncertaintyStatement = `Data sufficiency is assessed at ${sufficiencyData.score}% (${sufficiencyData.rating}). `;
  if (sufficiencyData.missingFields.length > 0) {
    uncertaintyStatement += `Current analytical uncertainties: ${sufficiencyData.missingFields.join(', ')}. `;
    uncertaintyStatement += `Conclusions are treated as preliminary working hypotheses rather than confirmed legal diagnoses until field verification is logged.`;
  } else {
    uncertaintyStatement += `All required inputs (photo verification, GPS precision, community confirmations) meet high-confidence standards.`;
  }

  // 4. Recommendation rationale
  const recommendationRationale = `The engine recommends "${recommendation.title}" because: ${recommendation.reasonForRecommendation} ` +
    `Action is designated to ${recommendation.responsibleParty} with a timeline of ${recommendation.urgencyWindow}.`;

  // 5. Success measurement
  const successMeasurement = `Success will be verified through: ${recommendation.requiredVerification}. ` +
    `The location must complete an observation window of ${scenario.observationWindowDays || 30} days with zero new incidents before being certified as a Sustained Improvement.`;

  return {
    dataSummary,
    priorityRationale,
    uncertaintyStatement,
    recommendationRationale,
    successMeasurement,
    knownFacts: scenario.knownFacts || [],
    hypotheses: scenario.hypotheses || []
  };
}

/**
 * Calculate Global Dashboard Metrics across active scenario and dataset
 */
export function calculateDashboardMetrics(scenarios, currentScenarioId, currentModifiedScenario = null, observationWindowDays = 30) {
  let activeList = scenarios.map(s => {
    if (currentModifiedScenario && s.id === currentScenarioId) {
      return currentModifiedScenario;
    }
    return s;
  });

  const totalTrackedLocations = activeList.length;

  let requiringInterventionCount = 0;
  let recurringCount = 0;
  let followUpDueCount = 0;
  let interventionsCompletedCount = 0;
  let highPriorityCount = 0;

  // Sustained Resolution calculation
  let eligibleForSustainedWindow = 0;
  let sustainedResolutionSuccesses = 0;

  // Environmental aggregates
  let totalWasteCollectedKg = 0;
  let totalInterventionCostInr = 0;
  let totalCommunityConfirmations = 0;

  activeList.forEach(scn => {
    const recurrence = analyzeRecurrence(scn, 60);
    const sufficiency = calculateDataSufficiency(scn, (scn.incidents || []).filter(i => !i.isDuplicate));
    const priority = calculatePriorityScore(scn, recurrence, sufficiency);

    if (priority.priorityTier === 'Critical' || priority.priorityTier === 'High') {
      highPriorityCount++;
    }

    if (recurrence.isChronic || recurrence.recurrenceCategory.includes('Recurrence') || recurrence.recurrenceCategory.includes('Relapse')) {
      recurringCount++;
    }

    if (scn.pendingFollowUp?.isDue || recurrence.isFollowUpOverdue) {
      followUpDueCount++;
    }

    // Interventions completed
    const completed = (scn.previousInterventions || []).filter(i => i.outcomeStatus === 'Completed');
    interventionsCompletedCount += completed.length;

    completed.forEach(c => {
      totalWasteCollectedKg += (c.wasteCollectedKg || 0);
      totalInterventionCostInr += (c.costInr || 0);
    });

    const confirmations = (scn.incidents || []).reduce((acc, i) => acc + (i.confirmations || 0), 0);
    totalCommunityConfirmations += confirmations;

    // Check if intervention is needed (any active physical incidents or unresolved follow-ups)
    const hasActiveIncidents = (scn.incidents || []).some(i => !i.isDuplicate);
    if (hasActiveIncidents && scn.code !== 'sustained_resolution_success' && scn.code !== 'low_priority_addressed') {
      requiringInterventionCount++;
    }

    // Sustained Resolution Rate calculation:
    // A location is eligible if it has completed at least one intervention and the configured observation window
    // has elapsed since that intervention.
    if (completed.length > 0) {
      const lastInterventionDate = new Date(Math.max(...completed.map(i => new Date(i.date))));
      const daysSinceIntervention = Math.floor((new Date('2026-10-23T20:00:00Z') - lastInterventionDate) / (1000 * 60 * 60 * 24));

      if (daysSinceIntervention >= observationWindowDays) {
        eligibleForSustainedWindow++;

        // Successful if no new physical incidents were reported after the intervention date
        const postIncidents = (scn.incidents || []).filter(i => !i.isDuplicate && new Date(i.reportedAt) > lastInterventionDate);
        if (postIncidents.length === 0) {
          sustainedResolutionSuccesses++;
        }
      }
    }
  });

  const sustainedResolutionRate = eligibleForSustainedWindow > 0
    ? Math.round((sustainedResolutionSuccesses / eligibleForSustainedWindow) * 100)
    : 0;

  return {
    totalTrackedLocations,
    requiringInterventionCount,
    recurringCount,
    followUpDueCount,
    interventionsCompletedCount,
    highPriorityCount,
    sustainedResolutionRate,
    sustainedDenominator: eligibleForSustainedWindow,
    sustainedNumerator: sustainedResolutionSuccesses,
    observationWindowDays,
    environmentalImpact: {
      totalWasteCollectedKg,
      totalInterventionCostInr,
      totalCommunityConfirmations,
      provenance: {
        waste: 'Measured from Sevadeep weighing logs (kg)',
        cost: 'Audited volunteer materials receipt (INR)',
        confirmations: 'Verified citizen account confirmations'
      }
    }
  };
}
