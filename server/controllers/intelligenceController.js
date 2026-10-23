import { getAllScenarios, getScenarioById } from '../../client/src/services/scenarioData.js';
import {
  analyzeRecurrence,
  calculatePriorityScore,
  calculateDataSufficiency,
  generateInterventionRecommendation,
  generateAnalyticalExplanation,
  calculateDashboardMetrics,
  DEFAULT_WEIGHTS
} from '../../client/src/services/intelligenceEngine.js';

/**
 * Controller for Civic Impact Intelligence API
 */
export async function getScenarios(req, res) {
  try {
    const scenarios = getAllScenarios();
    return res.json({
      success: true,
      count: scenarios.length,
      scenarios
    });
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve scenarios.' });
  }
}

export async function getScenarioDetails(req, res) {
  try {
    const { id } = req.params;
    const scenario = getScenarioById(id);
    if (!scenario) {
      return res.status(404).json({ success: false, message: `Scenario ${id} not found.` });
    }

    const recurrence = analyzeRecurrence(scenario, 60);
    const sufficiency = calculateDataSufficiency(scenario, (scenario.incidents || []).filter(i => !i.isDuplicate));
    const priority = calculatePriorityScore(scenario, recurrence, sufficiency);
    const recommendation = generateInterventionRecommendation(scenario, recurrence, priority, sufficiency);
    const explanation = generateAnalyticalExplanation(scenario, recurrence, priority, recommendation, sufficiency);

    return res.json({
      success: true,
      scenario,
      analysis: {
        recurrence,
        sufficiency,
        priority,
        recommendation,
        explanation
      }
    });
  } catch (err) {
    console.error('Error in getScenarioDetails:', err);
    return res.status(500).json({ success: false, message: 'Analysis failed.' });
  }
}

export async function analyzeCustomScenario(req, res) {
  try {
    const { scenario, weights, windowDays } = req.body;
    if (!scenario || !scenario.incidents) {
      return res.status(400).json({ success: false, message: 'Valid scenario object with incidents required.' });
    }

    const recurrence = analyzeRecurrence(scenario, windowDays || 60);
    const sufficiency = calculateDataSufficiency(scenario, (scenario.incidents || []).filter(i => !i.isDuplicate));
    const priority = calculatePriorityScore(scenario, recurrence, sufficiency, weights || DEFAULT_WEIGHTS);
    const recommendation = generateInterventionRecommendation(scenario, recurrence, priority, sufficiency);
    const explanation = generateAnalyticalExplanation(scenario, recurrence, priority, recommendation, sufficiency);

    return res.json({
      success: true,
      analysis: {
        recurrence,
        sufficiency,
        priority,
        recommendation,
        explanation
      }
    });
  } catch (err) {
    console.error('Error analyzing custom scenario:', err);
    return res.status(500).json({ success: false, message: 'Analysis failed.' });
  }
}

export async function getMetrics(req, res) {
  try {
    const scenarios = getAllScenarios();
    const metrics = calculateDashboardMetrics(scenarios, 'SCN-01', null, 30);
    return res.json({
      success: true,
      metrics
    });
  } catch (err) {
    console.error('Error calculating dashboard metrics:', err);
    return res.status(500).json({ success: false, message: 'Metrics calculation failed.' });
  }
}
