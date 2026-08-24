/**
 * Public programmatic API for `tf-arch-diagram-generator`.
 *
 *   import { parseTerraformPlan, computeArchitectureLayout, renderStandaloneSvg }
 *     from 'tf-arch-diagram-generator';
 *
 *   const plan = JSON.parse(fs.readFileSync('plan.json', 'utf8'));
 *   const svg = renderStandaloneSvg(
 *     computeArchitectureLayout(parseTerraformPlan(plan)),
 *     { title: 'Production' }
 *   );
 *
 * Nothing in this entry point touches the DOM, so it runs in Node as well as
 * in the browser.
 */
export { parseTerraformPlan } from './parser/tfPlanParser.js';
export { computeArchitectureLayout } from './canvas/layoutEngine.js';
export {
  renderStandaloneSvg,
  renderContainers,
  renderEdges,
  renderNodes,
  escapeXml,
  ACTION_COLORS,
  SVG_DEFS
} from './canvas/svgRenderer.js';
export {
  PROVIDERS,
  PROVIDER_IDS,
  getProvider,
  getProviderForType,
  getIconForType,
  getMergedCategories
} from './providers/index.js';
export { SAMPLE_PLANS, SAMPLE_GROUPS, DEFAULT_SAMPLE_KEY } from './data/samplePlans.js';

/** Convenience one-shot: plan JSON (object or string) → standalone SVG string. */
export async function planToSvg(planData, options = {}) {
  const [{ parseTerraformPlan }, { computeArchitectureLayout }, { renderStandaloneSvg }] = await Promise.all([
    import('./parser/tfPlanParser.js'),
    import('./canvas/layoutEngine.js'),
    import('./canvas/svgRenderer.js')
  ]);
  return renderStandaloneSvg(computeArchitectureLayout(parseTerraformPlan(planData)), options);
}
