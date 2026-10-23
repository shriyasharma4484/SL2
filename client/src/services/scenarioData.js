/**
 * SEVADEEP CIVIC IMPACT INTELLIGENCE ENGINE
 * Curated Scenario Dataset (12 End-to-End Scenarios)
 * 
 * Provenance: Synthetic & illustrative civic intelligence data modeled on
 * Pune Municipal Corporation (PMC) wards and Sevadeep NGO operations.
 * Coordinates centered on Pune, Maharashtra [18.5204, 73.8567].
 */

export const INITIAL_SCENARIOS = [
  {
    id: 'SCN-01',
    code: 'chronic_waste_dumping',
    title: 'Chronic Waste-Dumping Black Spot',
    subtitle: 'Mutha Riverbed / Omkareshwar Ghat, Shaniwar Peth',
    category: 'Garbage & Waste',
    area: 'Shaniwar Peth',
    coordinates: [18.5186, 73.8512],
    description: 'Persistent solid waste accumulation along the riverbank path despite two previous volunteer cleanup drives within the last 60 days.',
    environmentalSensitivity: 'High (Riparian Buffer Zone & Waterbody Contamination)',
    observationWindowDays: 30,
    incidents: [
      {
        id: 'RPT-2026-101',
        title: 'Fresh heap of plastic and wet vegetable waste near river steps',
        description: 'Commercial vegetable crates and decomposing organic waste dumped overnight next to the Omkareshwar temple ghat walkway.',
        reportedAt: '2026-10-21T06:30:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Sunita Deshmukh',
        confirmations: 12,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5188, 73.8514]
      },
      {
        id: 'RPT-2026-088',
        title: 'Single-use plastic bags and thermocol packing dumped along retaining wall',
        description: 'Dumping resumed just 5 days after Sevadeep volunteer drive.',
        reportedAt: '2026-10-14T08:15:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Rahul Sharma',
        confirmations: 8,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5185, 73.8510]
      },
      {
        id: 'RPT-2026-065',
        title: 'Debris and mixed waste dumped under bridge approach',
        description: 'Night dumping of commercial packaging and temple floral waste.',
        reportedAt: '2026-09-29T10:00:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Aarav Kulkarni',
        confirmations: 15,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5186, 73.8512]
      },
      {
        id: 'RPT-2026-042',
        title: 'Open garbage burning and plastic litter at riverbank',
        description: 'Local shopkeepers dumping and burning paper/plastic packaging.',
        reportedAt: '2026-09-08T18:45:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Vikram Joshi',
        confirmations: 19,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5187, 73.8513]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-012',
        date: '2026-09-12T09:00:00Z',
        type: 'Volunteer Cleanup Drive',
        executor: 'Sevadeep Volunteer Wing (24 volunteers)',
        wasteCollectedKg: 420,
        notes: 'Cleared 420 kg of accumulated plastic and organic debris; handed over to PMC Ghantagadi.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Completed',
        costInr: 2500
      },
      {
        id: 'INT-2026-019',
        date: '2026-10-02T08:30:00Z',
        type: 'Gandhi Jayanti Riverbed Cleanliness Drive',
        executor: 'Sevadeep + Local Resident Association',
        wasteCollectedKg: 310,
        notes: 'Installed warning board against river dumping. Site was pristine at handover.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Completed',
        costInr: 4000
      }
    ],
    followUpHistory: [
      {
        id: 'FLP-2026-004',
        scheduledDate: '2026-10-18T10:00:00Z',
        completedDate: '2026-10-19T11:00:00Z',
        inspector: 'Dr. Ananya Joshi (Coordinator)',
        findings: 'Recurrence confirmed: Waste reappeared within 12 days. Cleanup alone is insufficient.',
        status: 'Recurrence Detected'
      }
    ],
    pendingFollowUp: {
      isDue: true,
      dueDate: '2026-10-25T10:00:00Z',
      assignedTo: 'Sevadeep Field Coordinator'
    },
    knownFacts: [
      'Two full cleanups removed 730 kg total waste within 40 days.',
      'Waste reappeared within 5 to 12 days after each cleanup.',
      'Location is adjacent to fish and vegetable vendor unloading zone.'
    ],
    hypotheses: [
      'Commercial wholesale vendors lack nocturnal door-to-door collection access.',
      'Absence of PMC streetlights and deterrent CCTV enables undetected night dumping.'
    ]
  },
  {
    id: 'SCN-02',
    code: 'overflowing_public_bin',
    title: 'Overflowing Public Waste Collection Point',
    subtitle: 'Mandai Market, Ganpati Chowk, Shukrawar Peth',
    category: 'Garbage & Waste',
    area: 'Shukrawar Peth',
    coordinates: [18.5128, 73.8553],
    description: '240L PMC community container perpetually overflowing into vegetable market pedestrian corridor.',
    environmentalSensitivity: 'Medium (High Footfall Food Market Vector Risk)',
    observationWindowDays: 14,
    incidents: [
      {
        id: 'RPT-2026-102',
        title: 'Waste bin overflowing across main vegetable market lane',
        description: 'Stray cattle and dogs scattering rotten produce; bin filled to 200% capacity by midday.',
        reportedAt: '2026-10-22T11:20:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Sunita Deshmukh',
        confirmations: 24,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5129, 73.8554]
      },
      {
        id: 'RPT-2026-095',
        title: 'Rotten fruit piles outside market dustbin',
        description: 'Disposal volume far exceeds current bin container dimensions.',
        reportedAt: '2026-10-17T14:10:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Suresh Tambe (Vendor)',
        confirmations: 16,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5128, 73.8552]
      },
      {
        id: 'RPT-2026-081',
        title: 'Foul odor and blocked drainage from overflowing Mandai bin',
        description: 'Morning clearing at 7 AM fills up completely before 11 AM.',
        reportedAt: '2026-10-09T09:30:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Priya Patil',
        confirmations: 11,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5127, 73.8553]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-015',
        date: '2026-10-10T12:00:00Z',
        type: 'Coordinator Site Audit & Sweeper Coordination',
        executor: 'Sevadeep Field Liaison',
        wasteCollectedKg: 180,
        notes: 'Coordinated an ad-hoc afternoon clearance with PMC ward sanitary inspector.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Completed',
        costInr: 500
      }
    ],
    followUpHistory: [],
    pendingFollowUp: {
      isDue: true,
      dueDate: '2026-10-24T12:00:00Z',
      assignedTo: 'Sanitary Ward Inspector Liaison'
    },
    knownFacts: [
      'Bin is emptied once daily at 07:00 AM by PMC vehicle.',
      'Peak market organic waste generation is between 10:00 AM and 02:00 PM.',
      'Estimated daily market waste volume is 850 kg against a 240 kg capacity bin.'
    ],
    hypotheses: [
      'Collection frequency is misaligned with market peak business hours.',
      'Capacity upgrade to 1100L compactor bin or secondary 2 PM collection cycle is required.'
    ]
  },
  {
    id: 'SCN-03',
    code: 'municipal_water_leak',
    title: 'Major Subsurface Potable Water Pipeline Leak',
    subtitle: 'Deccan Gymkhana, Goodluck Chowk Intersection',
    category: 'Water Leakage',
    area: 'Deccan Gymkhana',
    coordinates: [18.5173, 73.8415],
    description: 'Pressurized treated water gushing through road asphalt fissure for 9 consecutive days; beyond NGO manual repair scope.',
    environmentalSensitivity: 'High (Precious Potable Water Depletion & Subgrade Road Cavitation)',
    observationWindowDays: 15,
    incidents: [
      {
        id: 'RPT-2026-103',
        title: 'Road pavement erupting with clean drinking water near Goodluck Cafe',
        description: 'Water has spread across 40 meters of roadway; traffic congestion and severe water wastage.',
        reportedAt: '2026-10-20T07:40:00Z',
        severity: 'Critical',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Vikram Deshmukh',
        confirmations: 38,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5173, 73.8415]
      },
      {
        id: 'RPT-2026-091',
        title: 'Water pooling on FC road turn from ruptured water main',
        description: 'Estimated loss of over 15,000 liters daily during morning municipal supply hours.',
        reportedAt: '2026-10-15T06:15:00Z',
        severity: 'Critical',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Sunita Deshmukh',
        confirmations: 29,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5174, 73.8416]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-020',
        date: '2026-10-16T11:00:00Z',
        type: 'Statutory Escalation & Field Barricading',
        executor: 'Sevadeep Municipal Affairs Team',
        wasteCollectedKg: 0,
        notes: 'Placed reflective cones around road depression; logged PMC Water Supply Docket #PMC-WTR-2026-8812. Awaiting municipal backhoe team.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Partially Completed',
        costInr: 800
      }
    ],
    followUpHistory: [
      {
        id: 'FLP-2026-006',
        scheduledDate: '2026-10-21T09:00:00Z',
        completedDate: '2026-10-21T10:00:00Z',
        inspector: 'Vikram Deshmukh (Municipal Liaison)',
        findings: 'Municipal excavation team visited but delayed work due to underground electric cable cross-clearance.',
        status: 'Awaiting Municipal Execution'
      }
    ],
    pendingFollowUp: {
      isDue: true,
      dueDate: '2026-10-24T16:00:00Z',
      assignedTo: 'PMC Ward 7 Junior Engineer Follow-Up'
    },
    knownFacts: [
      'Potable line pressure causes visible surface flooding between 06:00 and 10:30 AM.',
      'Requires heavy asphalt cutter and municipal pipeline replacement weld.',
      'Sevadeep cannot execute sub-surface engineering repairs independently.'
    ],
    hypotheses: [
      'Fissure caused by heavy bus axle load atop vintage cast-iron transmission pipe.',
      'Potential sinkhole development if water undermines road sub-base over 14 days.'
    ]
  },
  {
    id: 'SCN-04',
    code: 'sustained_resolution_success',
    title: 'Sustained Ecological Remediation & Green Buffer',
    subtitle: 'Taljai Hills Forest Reserve, Trail Entry 3',
    category: 'Illegal Dumping',
    area: 'Sahakarnagar',
    coordinates: [18.4892, 73.8475],
    description: 'Former chronic construction debris dump remediated with community boulder bund, native saplings, and 45 days of incident-free observation.',
    environmentalSensitivity: 'High (Reserved Forest Habitat & Urban Biodiversity Corridor)',
    observationWindowDays: 30,
    incidents: [
      {
        id: 'RPT-2026-020',
        title: 'Historic debris dump along Taljai nature trail entry',
        description: 'Construction tiles and mortar dumped inside forest reserve boundary.',
        reportedAt: '2026-08-28T09:00:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Aarav Kulkarni',
        confirmations: 14,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.4892, 73.8475]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-008',
        date: '2026-09-05T08:00:00Z',
        type: 'Ecological Restoration & Boulder Barrier Installation',
        executor: 'Sevadeep Greening Taskforce + Forest Dept Range Officer',
        wasteCollectedKg: 650,
        notes: 'Removed 650 kg rubble, planted 35 indigenous Karanj & Neem saplings, placed natural stone barrier preventing truck tipping.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Completed',
        costInr: 9500
      }
    ],
    followUpHistory: [
      {
        id: 'FLP-2026-001',
        scheduledDate: '2026-09-19T09:00:00Z',
        completedDate: '2026-09-19T10:00:00Z',
        inspector: 'Dr. Ananya Joshi',
        findings: 'Day 14 inspection: Zero waste dumping. All 35 saplings thriving with drip basins maintained.',
        status: 'Clean & Sustained'
      },
      {
        id: 'FLP-2026-002',
        scheduledDate: '2026-10-05T09:00:00Z',
        completedDate: '2026-10-05T10:30:00Z',
        inspector: 'Aarav Kulkarni',
        findings: 'Day 30 inspection: Observation window successfully passed with zero recurrence. Physical boulders intact.',
        status: 'Clean & Sustained'
      },
      {
        id: 'FLP-2026-005',
        scheduledDate: '2026-10-20T09:00:00Z',
        completedDate: '2026-10-20T09:30:00Z',
        inspector: 'Priya Patil',
        findings: 'Day 45 inspection: 100% sustained improvement confirmed. Morning joggers report pristine condition.',
        status: 'Clean & Sustained'
      }
    ],
    pendingFollowUp: {
      isDue: false,
      dueDate: '2026-11-20T09:00:00Z',
      assignedTo: 'Quarterly Ecology Monitor'
    },
    knownFacts: [
      'Site was completely cleared of 650 kg debris on Sep 5, 2026.',
      'Natural boulder barrier physical obstruction prevents vehicle access.',
      'Three consecutive inspections (Day 14, 30, 45) recorded zero new incidents.'
    ],
    hypotheses: [
      'Physical deterrent + visible ecological ownership permanently broke the dumping habit.'
    ]
  },
  {
    id: 'SCN-05',
    code: 'recurrence_post_resolution',
    title: 'Post-Resolution Relapse & Dumping Re-Emergence',
    subtitle: 'Viman Nagar, Datta Mandir Road Culvert',
    category: 'Garbage & Waste',
    area: 'Viman Nagar',
    coordinates: [18.5678, 73.9142],
    description: 'Location officially marked Resolved 25 days ago following a weekend volunteer drive, but new commercial dumping has recurred.',
    environmentalSensitivity: 'Medium (Open Storm Culvert Disease Vector)',
    observationWindowDays: 30,
    incidents: [
      {
        id: 'RPT-2026-105',
        title: 'New commercial food waste and plastic cups dumped at culvert',
        description: 'Fresh relapse: garbage dumping has started again at the exact spot cleared three weeks ago.',
        reportedAt: '2026-10-21T19:00:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Rohan Mehra',
        confirmations: 9,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5679, 73.9143]
      },
      {
        id: 'RPT-2026-104',
        title: 'Plastic delivery cartons stacked against culvert wall',
        description: 'Fast-food packaging dumped late evening.',
        reportedAt: '2026-10-19T22:15:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Pooja Kadam',
        confirmations: 6,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5678, 73.9141]
      },
      {
        id: 'RPT-2026-030',
        title: 'Original baseline: clogged culvert and plastic waste',
        description: 'Historical report that prompted initial volunteer cleanup.',
        reportedAt: '2026-09-20T08:00:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Rohan Mehra',
        confirmations: 11,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5678, 73.9142]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-016',
        date: '2026-09-26T08:30:00Z',
        type: 'Youth Volunteer Culvert De-silting & Litter Clearing',
        executor: 'Sevadeep College Volunteers (18 pax)',
        wasteCollectedKg: 280,
        notes: 'Removed 280 kg waste; painted caution sign on culvert parapet. Case marked Resolved.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Completed',
        costInr: 3200
      }
    ],
    followUpHistory: [
      {
        id: 'FLP-2026-003',
        scheduledDate: '2026-10-10T11:00:00Z',
        completedDate: '2026-10-10T11:30:00Z',
        inspector: 'Priya Patil',
        findings: 'Day 14 check was satisfactory. Culvert clear.',
        status: 'Temporary Pass'
      }
    ],
    pendingFollowUp: {
      isDue: true,
      dueDate: '2026-10-23T11:00:00Z',
      assignedTo: 'Sevadeep Ward Coordinator'
    },
    knownFacts: [
      'Initial cleanup cleared 280 kg on Sep 26, 2026.',
      'Relapse occurred around Oct 19 (Day 23 after intervention).',
      'Dumped materials are homogeneous: branded takeaway containers from nearby food street.'
    ],
    hypotheses: [
      'Late-night cloud kitchens or food delivery riders dump transit trash after shops close.',
      'Simple cleanup will continue to fail without engagement of nearby commercial food businesses.'
    ]
  },
  {
    id: 'SCN-06',
    code: 'duplicate_citizen_submissions',
    title: 'Clustered Duplicate Citizen Ingestion',
    subtitle: 'Fergusson College Road, Main Gate Footpath',
    category: 'Damaged Public Facilities',
    area: 'Shivajinagar',
    coordinates: [18.5235, 73.8402],
    description: 'Four separate citizens submitted emergency alerts within 3 hours regarding a single fallen banyan branch obstructing the cycle track.',
    environmentalSensitivity: 'Low (Pedestrian & Cyclist Safety Impairment)',
    observationWindowDays: 7,
    incidents: [
      {
        id: 'RPT-2026-106A',
        title: 'Large tree branch snapped and blocking footpath near FC main gate',
        description: 'Heavy rain branch fall completely blocking bicycle lane and walking path; students forced onto busy road.',
        reportedAt: '2026-10-22T08:10:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Amit Deshpande',
        confirmations: 18,
        isDuplicate: false, // Primary record
        duplicateOf: null,
        coordinates: [18.5235, 73.8402]
      },
      {
        id: 'RPT-2026-106B',
        title: 'Broken branch outside FC college gate',
        description: 'Big banyan tree branch fell on walkway.',
        reportedAt: '2026-10-22T08:35:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Neha Shinde',
        confirmations: 4,
        isDuplicate: true,
        duplicateOf: 'RPT-2026-106A',
        coordinates: [18.5236, 73.8403]
      },
      {
        id: 'RPT-2026-106C',
        title: 'Fallen tree obstacle on FC road footpath',
        description: 'Students having trouble walking, branch across pavement.',
        reportedAt: '2026-10-22T09:15:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Siddharth Rao',
        confirmations: 7,
        isDuplicate: true,
        duplicateOf: 'RPT-2026-106A',
        coordinates: [18.5234, 73.8401]
      },
      {
        id: 'RPT-2026-106D',
        title: 'Tree branch down opposite Vaishali restaurant footpath',
        description: 'Same branch blocking the path since morning storm.',
        reportedAt: '2026-10-22T10:45:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Kavita Gadgil',
        confirmations: 5,
        isDuplicate: true,
        duplicateOf: 'RPT-2026-106A',
        coordinates: [18.5235, 73.8402]
      }
    ],
    previousInterventions: [],
    followUpHistory: [],
    pendingFollowUp: {
      isDue: false,
      dueDate: '2026-10-24T18:00:00Z',
      assignedTo: 'PMC Tree Authority Liaison'
    },
    knownFacts: [
      'Four separate citizen submissions within a 2.5 hour window.',
      'Geographic variance is under 15 meters.',
      'Refers to one discrete physical fallen branch incident.'
    ],
    hypotheses: [
      'High community vigilance area; citizens spontaneously report the same high-visibility obstacle.',
      'System must consolidate into 1 physical incident to avoid inflating civic triage metrics.'
    ]
  },
  {
    id: 'SCN-07',
    code: 'isolated_critical_hazard',
    title: 'High-Severity Acute Environmental Hazard',
    subtitle: 'Katraj-Dehu Road Bypass, Old Tunnel Ravine',
    category: 'Illegal Dumping',
    area: 'Katraj',
    coordinates: [18.4485, 73.8580],
    description: 'Punctured industrial chemical drum discarding corrosive caustic sludge near headwaters of Katraj Lake feeder stream; zero prior history.',
    environmentalSensitivity: 'Critical (Drinking Water Catchment & Toxic Chemical Runoff)',
    observationWindowDays: 14,
    incidents: [
      {
        id: 'RPT-2026-107',
        title: 'Chemical drum leaking foul pungent solvent down hillside drain',
        description: 'Blue 200L metal drum with hazardous skull marking pushed down slope into natural nala; bubbling yellow liquid flowing toward lake.',
        reportedAt: '2026-10-22T16:20:00Z',
        severity: 'Critical',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Ganesh Shinde (Farmer)',
        confirmations: 7,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.4485, 73.8580]
      }
    ],
    previousInterventions: [],
    followUpHistory: [],
    pendingFollowUp: {
      isDue: true,
      dueDate: '2026-10-23T08:00:00Z',
      assignedTo: 'Maharashtra Pollution Control Board (MPCB) Liaison'
    },
    knownFacts: [
      'Only 1 reported incident in location history (no historical recurrence).',
      'Visual evidence shows labeled toxic industrial chemical drum leaking into stream.',
      'Direct contamination pathway to Katraj Lake aquatic ecosystem.'
    ],
    hypotheses: [
      'Illegal fly-tipping by midnight industrial carrier avoiding MPCB treatment fees.',
      'Priority engine must rank this above recurring routine litter based on catastrophic severity.'
    ]
  },
  {
    id: 'SCN-08',
    code: 'insufficient_evidence',
    title: 'Data Insufficiency & Ambiguous Complaint',
    subtitle: 'Hadapsar Gadital Flyover, Pillar #14 Area',
    category: 'Other Civic Grievances',
    area: 'Hadapsar',
    coordinates: [18.5022, 73.9285],
    description: 'Vague 1-sentence citizen submission without photographs, specific address, or verifiable category; requires validation triage.',
    environmentalSensitivity: 'Unknown (Unverified Claims)',
    observationWindowDays: 7,
    incidents: [
      {
        id: 'RPT-2026-108',
        title: 'Something smells bad and there is dirt near pillar',
        description: 'Please send volunteer to look at something dirty near the bridge.',
        reportedAt: '2026-10-21T13:45:00Z',
        severity: 'Low',
        photo: null, // Missing photographic proof
        reporter: 'Anonymous Contributor',
        confirmations: 0,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5022, 73.9285]
      }
    ],
    previousInterventions: [],
    followUpHistory: [],
    pendingFollowUp: {
      isDue: false,
      dueDate: '2026-10-26T12:00:00Z',
      assignedTo: 'Volunteer Verification Scout'
    },
    knownFacts: [
      'No photographic evidence provided.',
      'Zero community confirmations or upvotes.',
      'Coordinates are snapped to a general traffic junction centroid.'
    ],
    hypotheses: [
      'May be routine street sweeper dust or unverified odor.',
      'Engine must explicitly mark confidence as "Low / Insufficient Data" and request scouting.'
    ]
  },
  {
    id: 'SCN-09',
    code: 'municipal_dependency_partial',
    title: 'Multi-Stakeholder Municipal Dependency',
    subtitle: 'Kothrud, Chandani Chowk Hillside Culvert',
    category: 'Stormwater & Drainage',
    area: 'Kothrud',
    coordinates: [18.5065, 73.7842],
    description: 'Sevadeep volunteers cleared 340 kg surface plastic trash; subsurface culvert desilting requires PMC hydraulic excavator.',
    environmentalSensitivity: 'High (Monsoon Flash Flooding Risk on Highway Bypass)',
    observationWindowDays: 21,
    incidents: [
      {
        id: 'RPT-2026-109',
        title: 'Deep culvert blocked with reinforced concrete boulders and silt',
        description: 'Volunteer team cleared upper grating, but lower 2-meter culvert pipe is 80% choked with highway construction debris.',
        reportedAt: '2026-10-18T10:30:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Aarav Kulkarni (Volunteer Lead)',
        confirmations: 13,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5065, 73.7842]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-021',
        date: '2026-10-19T08:30:00Z',
        type: 'Volunteer Grate Surface Cleanup',
        executor: 'Sevadeep Kothrud Volunteer Team (14 pax)',
        wasteCollectedKg: 340,
        notes: 'Hand-picked 340 kg surface plastic bags and bottles. Logged PMC Drainage Dept Ticket #PMC-DRN-2026-4401 for heavy backhoe dredging.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Partially Completed',
        costInr: 1800
      }
    ],
    followUpHistory: [
      {
        id: 'FLP-2026-007',
        scheduledDate: '2026-10-22T10:00:00Z',
        completedDate: '2026-10-22T11:15:00Z',
        inspector: 'Dr. Ananya Joshi',
        findings: 'NGO scope 100% complete; Municipal scope 0% complete. Water still backs up during heavy downpour.',
        status: 'Municipal Dependency Active'
      }
    ],
    pendingFollowUp: {
      isDue: true,
      dueDate: '2026-10-25T14:00:00Z',
      assignedTo: 'PMC Ward 9 Drainage Liaison'
    },
    knownFacts: [
      'Sevadeep completed volunteer surface clearance (340 kg waste diverted).',
      'Structural culvert obstruction requires motorized municipal machinery.',
      'Problem cannot be closed as "Resolved" until PMC machinery clears the deep chamber.'
    ],
    hypotheses: [
      'Dual-responsibility tracking avoids misleading donors with premature "100% resolved" claims.'
    ]
  },
  {
    id: 'SCN-10',
    code: 'recurring_environmental_damage',
    title: 'Recurrent Eco-Zone Sapling Vandalism',
    subtitle: 'ARAI Hills (Vetal Tekdi), Slope Compartment 4',
    category: 'Tree & Park Maintenance',
    area: 'Erandwane / Kothrud',
    coordinates: [18.5145, 73.8180],
    description: 'Afforestation saplings repeatedly trampled and uprooted by illegal off-road motorbike stunts on pedestrian ridge path.',
    environmentalSensitivity: 'High (Native Urban Green Lung & Hill Slope Soil Stabilization)',
    observationWindowDays: 30,
    incidents: [
      {
        id: 'RPT-2026-110',
        title: 'Twelve newly planted Khair and Palas saplings crushed by motorbikes',
        description: 'Tire tracks found across fenced greening contour trench; wooden protective guards broken down.',
        reportedAt: '2026-10-20T17:30:00Z',
        severity: 'High',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Priya Patil',
        confirmations: 21,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5146, 73.8182]
      },
      {
        id: 'RPT-2026-075',
        title: 'Off-road bike riding damaging soil bunds on Vetal Tekdi',
        description: 'Second time in 4 weeks that motorcycle tracks have ruined soil bund contouring.',
        reportedAt: '2026-10-01T07:10:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Aarav Kulkarni',
        confirmations: 16,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5144, 73.8179]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-017',
        date: '2026-10-05T08:00:00Z',
        type: 'Re-planting & Wooden Guard Staking Drive',
        executor: 'Sevadeep + Vetal Tekdi Bachao Samiti',
        wasteCollectedKg: 40,
        notes: 'Replanted 20 native saplings, reinforced bamboo tree guards, posted forest advisory notices.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Completed',
        costInr: 5500
      }
    ],
    followUpHistory: [
      {
        id: 'FLP-2026-008',
        scheduledDate: '2026-10-15T09:00:00Z',
        completedDate: '2026-10-15T09:45:00Z',
        inspector: 'Aarav Kulkarni',
        findings: 'Signs of fresh tire tracks despite bamboo guards. Bamboo guards are too fragile.',
        status: 'Deterrent Ineffective'
      }
    ],
    pendingFollowUp: {
      isDue: true,
      dueDate: '2026-10-24T09:00:00Z',
      assignedTo: 'Forest Guard Coordinator'
    },
    knownFacts: [
      'Two successive replantation efforts suffered motorized vehicle damage.',
      'Bamboo tree guards offer zero resistance to off-road motorcycles.',
      'Entry is through an unmanned municipal gate lacking a chicane barrier.'
    ],
    hypotheses: [
      'Replanting without mechanical bollards or trench barriers at trail entrance will result in repeated losses.'
    ]
  },
  {
    id: 'SCN-11',
    code: 'newly_emerging_hotspot',
    title: 'Newly Emerging Commercial Waste Hotspot',
    subtitle: 'Baner High Street, Behind Jupiter Hospital Link Road',
    category: 'Garbage & Waste',
    area: 'Baner',
    coordinates: [18.5601, 73.7820],
    description: 'Previously pristine commercial connector showing sudden acceleration from 0 to 3 dumping incidents in 6 days following new night food truck stalls.',
    environmentalSensitivity: 'Medium (Open Suburban Water Runoff)',
    observationWindowDays: 14,
    incidents: [
      {
        id: 'RPT-2026-111A',
        title: 'New pile of paper coffee cups and packaging dumped on curb',
        description: 'Food truck operators dumping disposable plastics behind electric transformer.',
        reportedAt: '2026-10-22T02:30:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Tanmay Saxena',
        confirmations: 8,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5601, 73.7820]
      },
      {
        id: 'RPT-2026-111B',
        title: 'Cooking oil canisters and cardboard cartons stacked on median',
        description: 'Second food stall dumping incident this week.',
        reportedAt: '2026-10-19T23:45:00Z',
        severity: 'Medium',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Kishore Bapat',
        confirmations: 5,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5603, 73.7822]
      },
      {
        id: 'RPT-2026-111C',
        title: 'Used single-use plates scattering across vacant plot',
        description: 'New roadside stalls attracting evening crowds with no trash bins.',
        reportedAt: '2026-10-17T21:10:00Z',
        severity: 'Low',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Tanmay Saxena',
        confirmations: 6,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5600, 73.7819]
      }
    ],
    previousInterventions: [],
    followUpHistory: [],
    pendingFollowUp: {
      isDue: false,
      dueDate: '2026-10-26T17:00:00Z',
      assignedTo: 'Baner Ward Volunteer Circle'
    },
    knownFacts: [
      'Zero incidents logged for preceding 180 days.',
      'Three incidents clustered within the last 6 calendar days.',
      'Direct temporal correlation with 4 new evening food truck vendors opening.'
    ],
    hypotheses: [
      'Early-stage emergent hotspot: intervening now with vendor bins will prevent crystallization into a chronic black spot.'
    ]
  },
  {
    id: 'SCN-12',
    code: 'low_priority_addressed',
    title: 'Low-Severity Incident Successfully Closed',
    subtitle: 'Model Colony Lake Promenade, Near West Gate',
    category: 'Public Cleanliness',
    area: 'Shivajinagar / Model Colony',
    coordinates: [18.5332, 73.8378],
    description: 'Minor bench graffiti and dispersed snack packaging resolved in a single 2-volunteer sweep; 35 days incident-free.',
    environmentalSensitivity: 'Low (Well-Maintained Neighborhood Park Perimeter)',
    observationWindowDays: 30,
    incidents: [
      {
        id: 'RPT-2026-035',
        title: 'Bench spray paint scribble and peanut shells under garden bench',
        description: 'Aesthetic nuisance on one concrete park bench.',
        reportedAt: '2026-09-12T16:00:00Z',
        severity: 'Low',
        photo: '/assets/drive_cleanliness_1.jpeg',
        reporter: 'Sunita Deshmukh',
        confirmations: 3,
        isDuplicate: false,
        duplicateOf: null,
        coordinates: [18.5332, 73.8378]
      }
    ],
    previousInterventions: [
      {
        id: 'INT-2026-010',
        date: '2026-09-14T10:00:00Z',
        type: 'Spot Cleanliness & Paint Touch-Up',
        executor: 'Sevadeep Model Colony Volunteers (2 pax)',
        wasteCollectedKg: 15,
        notes: 'Repainted bench slat with anti-graffiti enamel; swept litter into compost bin.',
        evidencePhoto: '/assets/drive_cleanliness_1.jpeg',
        outcomeStatus: 'Completed',
        costInr: 450
      }
    ],
    followUpHistory: [
      {
        id: 'FLP-2026-009',
        scheduledDate: '2026-10-14T10:00:00Z',
        completedDate: '2026-10-14T10:30:00Z',
        inspector: 'Dr. Ananya Joshi',
        findings: 'Day 30 inspection: Bench pristine, zero re-tagging. Observation window completed.',
        status: 'Clean & Sustained'
      }
    ],
    pendingFollowUp: {
      isDue: false,
      dueDate: '2026-11-14T10:00:00Z',
      assignedTo: 'Model Colony Resident Watch'
    },
    knownFacts: [
      'Low severity baseline issue (cost < INR 500 to address).',
      'Observation window of 30 days completed without recurrence.',
      'Contributes validly to overall sustained-resolution rate.'
    ],
    hypotheses: [
      'Low priority tasks require minimal resources and provide fast citizen satisfaction wins.'
    ]
  }
];

export function getScenarioById(id) {
  return INITIAL_SCENARIOS.find(s => s.id === id) || INITIAL_SCENARIOS[0];
}

export function getAllScenarios() {
  return INITIAL_SCENARIOS;
}
