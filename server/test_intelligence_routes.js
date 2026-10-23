import assert from 'node:assert';
import express from 'express';
import intelligenceRoutes from './routes/intelligenceRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/impact-intelligence', intelligenceRoutes);

const server = app.listen(5099, async () => {
  console.log('\n--- Testing Backend /api/impact-intelligence Endpoints ---');

  try {
    // 1. GET /api/impact-intelligence/scenarios
    const resScenarios = await fetch('http://localhost:5099/api/impact-intelligence/scenarios');
    const dataScenarios = await resScenarios.json();
    assert.strictEqual(dataScenarios.success, true);
    assert.strictEqual(dataScenarios.count, 12);
    console.log('✓ [PASS] GET /scenarios: 12 scenarios returned');

    // 2. GET /api/impact-intelligence/scenarios/SCN-01
    const resScn1 = await fetch('http://localhost:5099/api/impact-intelligence/scenarios/SCN-01');
    const dataScn1 = await resScn1.json();
    assert.strictEqual(dataScn1.success, true);
    assert.strictEqual(dataScn1.analysis.priority.priorityTier, 'Critical');
    assert.strictEqual(dataScn1.analysis.recurrence.isChronic, true);
    console.log(`✓ [PASS] GET /scenarios/SCN-01: Analysis score ${dataScn1.analysis.priority.finalScore}/100, Tier: ${dataScn1.analysis.priority.priorityTier}`);

    // 3. GET /api/impact-intelligence/metrics
    const resMetrics = await fetch('http://localhost:5099/api/impact-intelligence/metrics');
    const dataMetrics = await resMetrics.json();
    assert.strictEqual(dataMetrics.success, true);
    assert.ok(dataMetrics.metrics.totalTrackedLocations === 12);
    console.log(`✓ [PASS] GET /metrics: Sustained resolution rate ${dataMetrics.metrics.sustainedResolutionRate}%`);

    // 4. POST /api/impact-intelligence/analyze
    const resAnalyze = await fetch('http://localhost:5099/api/impact-intelligence/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: dataScn1.scenario,
        windowDays: 30
      })
    });
    const dataAnalyze = await resAnalyze.json();
    assert.strictEqual(dataAnalyze.success, true);
    assert.ok(dataAnalyze.analysis.explanation.recommendationRationale.length > 20);
    console.log('✓ [PASS] POST /analyze: Custom analysis computation executed successfully');

    console.log('\n🎉 ALL 4 BACKEND ROUTE TESTS PASSED!\n');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('Test Failed:', err);
    server.close(() => process.exit(1));
  }
});
