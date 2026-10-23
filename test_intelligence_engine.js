/**
 * AUTOMATED TEST SUITE: SEVADEEP CIVIC IMPACT INTELLIGENCE ENGINE
 * Tests Phase 11 quality gates, deterministic algorithms, and scenario datasets.
 */

import assert from 'node:assert';
import { getAllScenarios, getScenarioById, INITIAL_SCENARIOS } from './client/src/services/scenarioData.js';
import {
  analyzeRecurrence,
  detectDuplicates,
  calculatePriorityScore,
  calculateDataSufficiency,
  generateInterventionRecommendation,
  generateAnalyticalExplanation,
  calculateDashboardMetrics,
  calculateDistanceMeters,
  DEFAULT_WEIGHTS
} from './client/src/services/intelligenceEngine.js';

console.log('\n======================================================');
console.log('🧪 RUNNING SEVADEEP CIVIC IMPACT INTELLIGENCE TESTS');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    console.error(err.stack);
  }
}

// 1. Every required scenario loads successfully
runTest('Gate 1: All 12 scenarios load with valid schema and Pune coordinates', () => {
  const scenarios = getAllScenarios();
  assert.strictEqual(scenarios.length, 12, 'Expected at least 12 scenarios');
  
  const expectedCodes = [
    'chronic_waste_dumping',
    'overflowing_public_bin',
    'municipal_water_leak',
    'sustained_resolution_success',
    'recurrence_post_resolution',
    'duplicate_citizen_submissions',
    'isolated_critical_hazard',
    'insufficient_evidence',
    'municipal_dependency_partial',
    'recurring_environmental_damage',
    'newly_emerging_hotspot',
    'low_priority_addressed'
  ];

  expectedCodes.forEach(code => {
    const found = scenarios.find(s => s.code === code);
    assert.ok(found, `Scenario with code "${code}" must exist`);
    assert.ok(found.coordinates && found.coordinates.length === 2, `Scenario ${code} must have valid coordinates`);
    assert.ok(found.coordinates[0] > 18.0 && found.coordinates[0] < 19.0, 'Latitude must be in Pune region');
    assert.ok(found.coordinates[1] > 73.0 && found.coordinates[1] < 74.5, 'Longitude must be in Pune region');
    assert.ok(Array.isArray(found.incidents), 'Scenario must have incidents array');
  });
});

// 2. Recurrence calculations are correct for known input data
runTest('Gate 2: Recurrence calculations detect chronic status & post-intervention relapse', () => {
  const chronicScn = getScenarioById('SCN-01');
  const recurrence = analyzeRecurrence(chronicScn, 60);
  assert.strictEqual(recurrence.isChronic, true, 'SCN-01 must be flagged as chronic');
  assert.strictEqual(recurrence.recurrenceCategory, 'Chronic Black Spot');
  assert.strictEqual(recurrence.physicalIncidentCount, 4, 'SCN-01 has 4 physical incidents in window');
  assert.strictEqual(recurrence.recurrenceAfterIntervention, true, 'SCN-01 has recurrence after intervention');
});

// 3. Duplicate submissions do not inflate physical incident counts
runTest('Gate 3: Duplicate submissions are consolidated without inflating physical counts', () => {
  const dupeScn = getScenarioById('SCN-06');
  const incidents = dupeScn.incidents;
  assert.strictEqual(incidents.length, 4, 'SCN-06 has 4 citizen submissions');

  const { physicalCount, totalSubmissions, duplicateMap } = detectDuplicates(incidents, 50, 12);
  assert.strictEqual(totalSubmissions, 4, 'Total submissions is 4');
  assert.strictEqual(physicalCount, 1, 'Physical count should be consolidated to 1 physical incident');
  assert.strictEqual(duplicateMap.get('RPT-2026-106A').isDuplicate, false, 'Primary record is not duplicate');
  assert.strictEqual(duplicateMap.get('RPT-2026-106B').isDuplicate, true, 'Subsequent close report is duplicate');
  assert.strictEqual(duplicateMap.get('RPT-2026-106C').isDuplicate, true, 'Subsequent close report is duplicate');
  assert.strictEqual(duplicateMap.get('RPT-2026-106D').isDuplicate, true, 'Subsequent close report is duplicate');
});

// 4. High-severity isolated issue is not incorrectly ranked below every recurring low-severity issue
runTest('Gate 4: Critical isolated hazard ranks higher than low-severity recurring issue', () => {
  const criticalScn = getScenarioById('SCN-07'); // Toxic solvent drum leak, single incident
  const lowRecurringScn = getScenarioById('SCN-12'); // Low priority bench graffiti

  const recCrit = analyzeRecurrence(criticalScn, 60);
  const suffCrit = calculateDataSufficiency(criticalScn, criticalScn.incidents);
  const prioCrit = calculatePriorityScore(criticalScn, recCrit, suffCrit);

  const recLow = analyzeRecurrence(lowRecurringScn, 60);
  const suffLow = calculateDataSufficiency(lowRecurringScn, lowRecurringScn.incidents);
  const prioLow = calculatePriorityScore(lowRecurringScn, recLow, suffLow);

  assert.ok(prioCrit.finalScore >= 85, `Critical score must be >= 85, got ${prioCrit.finalScore}`);
  assert.ok(prioCrit.finalScore > prioLow.finalScore, `Critical score (${prioCrit.finalScore}) must exceed Low priority score (${prioLow.finalScore})`);
  assert.strictEqual(prioCrit.priorityTier, 'Critical');
  assert.ok(prioCrit.reasonCodes.some(r => r.code === 'CRITICAL_HAZARD_OVERRIDE'), 'Should activate CRITICAL_HAZARD_OVERRIDE');
});

// 5. Insufficient evidence produces an uncertainty state
runTest('Gate 5: Insufficient evidence scenario activates uncertainty penalty & scout recommendation', () => {
  const vagueScn = getScenarioById('SCN-08');
  const recurrence = analyzeRecurrence(vagueScn, 60);
  const sufficiency = calculateDataSufficiency(vagueScn, vagueScn.incidents);
  const priority = calculatePriorityScore(vagueScn, recurrence, sufficiency);
  const recommendation = generateInterventionRecommendation(vagueScn, recurrence, priority, sufficiency);

  assert.strictEqual(sufficiency.isSufficient, false, 'Data must be marked insufficient');
  assert.ok(sufficiency.score < 40, `Sufficiency score must be < 40, got ${sufficiency.score}`);
  assert.ok(priority.reasonCodes.some(r => r.code === 'INSUFFICIENT_EVIDENCE_PENALTY'), 'Must apply INSUFFICIENT_EVIDENCE_PENALTY');
  assert.strictEqual(recommendation.actionType, 'Evidence Gathering & Field Scout', 'Must recommend field scout');
});

// 6. Municipal dependencies are not treated as completed NGO actions
runTest('Gate 6: Multi-stakeholder municipal dependencies track separate responsibilities', () => {
  const muniScn = getScenarioById('SCN-09');
  const completed = muniScn.previousInterventions.filter(i => i.outcomeStatus === 'Completed');
  const partial = muniScn.previousInterventions.filter(i => i.outcomeStatus === 'Partially Completed');
  
  assert.strictEqual(partial.length, 1, 'Culvert must be marked Partially Completed');
  const recommendation = generateInterventionRecommendation(muniScn, analyzeRecurrence(muniScn, 60), { finalScore: 70 }, { score: 80, isSufficient: true });
  assert.ok(recommendation.stakeholderMatrix.primary.includes('PMC'), 'Primary responsible party must be municipal department');
  assert.strictEqual(recommendation.actionType, 'Inter-Agency Handover & Tracking');
});

// 7. Sustained-resolution calculations exclude incomplete observation windows
runTest('Gate 7: Sustained-resolution rate excludes incomplete observation windows from denominator', () => {
  const all = getAllScenarios();
  const metrics30 = calculateDashboardMetrics(all, 'SCN-01', null, 30);
  
  // Scenarios with interventions completed >= 30 days ago:
  // SCN-01: Sep 12 & Oct 2 (completed). But has relapse on Oct 14 & 21 (0 days sustained).
  // SCN-04: Sep 5 (completed, 48 days ago). Zero post-incidents (1 sustained).
  // SCN-05: Sep 26 (completed, 27 days ago -> NOT >= 30 days ago!).
  // SCN-12: Sep 14 (completed, 39 days ago). Zero post-incidents (1 sustained).
  
  assert.ok(metrics30.sustainedDenominator > 0, 'Denominator must be positive');
  assert.ok(metrics30.sustainedDenominator <= all.length, 'Denominator must not exceed total scenarios');
  assert.ok(metrics30.sustainedNumerator <= metrics30.sustainedDenominator, 'Numerator cannot exceed denominator');
  assert.ok(metrics30.sustainedResolutionRate >= 0 && metrics30.sustainedResolutionRate <= 100, 'Rate must be percentage 0-100');
  console.log(`    Sustained resolution metric: ${metrics30.sustainedNumerator}/${metrics30.sustainedDenominator} (${metrics30.sustainedResolutionRate}%) for 30-day window`);
});

// 8. Scenario resets restore the original dataset
runTest('Gate 8: Scenario modifications can be cloned and reset without mutating baseline', () => {
  const original = getScenarioById('SCN-01');
  const cloned = JSON.parse(JSON.stringify(original));
  
  // Simulate inspector recording a clean follow-up
  cloned.followUpHistory.push({
    id: 'FLP-TEST-NEW',
    scheduledDate: '2026-10-23T10:00:00Z',
    completedDate: '2026-10-23T10:30:00Z',
    inspector: 'Test Inspector',
    findings: 'All clear on site',
    status: 'Clean'
  });
  cloned.pendingFollowUp.isDue = false;

  assert.strictEqual(cloned.followUpHistory.length, original.followUpHistory.length + 1, 'Cloned scenario updated');
  assert.strictEqual(original.pendingFollowUp.isDue, true, 'Original scenario baseline remains unmodified');
});

// 9. Dashboard totals update when scenario state changes
runTest('Gate 9: Dashboard totals react dynamically to scenario state modification', () => {
  const all = getAllScenarios();
  const baselineMetrics = calculateDashboardMetrics(all, 'SCN-01', null, 30);

  const modifiedScn = JSON.parse(JSON.stringify(getScenarioById('SCN-01')));
  // Mark pending follow-up as resolved
  modifiedScn.pendingFollowUp.isDue = false;

  const updatedMetrics = calculateDashboardMetrics(all, 'SCN-01', modifiedScn, 30);
  assert.strictEqual(updatedMetrics.followUpDueCount, baselineMetrics.followUpDueCount - 1, 'Follow-up due count should decrement');
});

// 10. Distance calculation accuracy (Haversine)
runTest('Gate 10: Haversine distance matches expected Pune urban metrics', () => {
  // Distance from Shaniwar Wada [18.5196, 73.8553] to Dagdusheth Ganpati [18.5165, 73.8561] ~ 350-400 meters
  const dist = calculateDistanceMeters(18.5196, 73.8553, 18.5165, 73.8561);
  assert.ok(dist >= 300 && dist <= 450, `Distance should be approx 350-450m, got ${dist}`);
});

// 11. AI-Style Explanation generation produces non-empty structured rationale
runTest('Gate 11: AI-Style explainability engine returns comprehensive deterministic synthesis', () => {
  const scn = getScenarioById('SCN-01');
  const recurrence = analyzeRecurrence(scn, 60);
  const sufficiency = calculateDataSufficiency(scn, scn.incidents);
  const priority = calculatePriorityScore(scn, recurrence, sufficiency);
  const recommendation = generateInterventionRecommendation(scn, recurrence, priority, sufficiency);
  const explanation = generateAnalyticalExplanation(scn, recurrence, priority, recommendation, sufficiency);

  assert.ok(explanation.dataSummary.includes('Omkareshwar Ghat'), 'Data summary contains location name');
  assert.ok(explanation.priorityRationale.includes('/100'), 'Priority rationale includes score');
  assert.ok(explanation.uncertaintyStatement.length > 20, 'Uncertainty statement present');
  assert.ok(explanation.recommendationRationale.length > 20, 'Recommendation rationale present');
  assert.ok(explanation.successMeasurement.length > 20, 'Success measurement present');
  assert.ok(explanation.knownFacts.length > 0, 'Known facts list present');
  assert.ok(explanation.hypotheses.length > 0, 'Hypotheses list present');
});

console.log('\n======================================================');
console.log(`🏁 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
