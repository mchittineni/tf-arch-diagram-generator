import { AWS_SAMPLES } from './samples/aws.js';
import { GCP_SAMPLES } from './samples/gcp.js';
import { AZURE_SAMPLES } from './samples/azure.js';
import { MULTI_CLOUD_SAMPLES } from './samples/multiCloud.js';

/**
 * Built-in demo plans, grouped by the cloud they showcase. Each entry carries
 * `provider` ('aws' | 'gcp' | 'azure' | 'multi'), a display `name`, a
 * `description` and the raw plan JSON in `data`.
 */
export const SAMPLE_PLANS = {
  ...AWS_SAMPLES,
  ...GCP_SAMPLES,
  ...AZURE_SAMPLES,
  ...MULTI_CLOUD_SAMPLES
};

export const DEFAULT_SAMPLE_KEY = 'threeTier';

/** Groups the sample keys by provider for grouped selectors. */
export const SAMPLE_GROUPS = [
  { providerId: 'aws', label: 'Amazon Web Services', keys: Object.keys(AWS_SAMPLES) },
  { providerId: 'gcp', label: 'Google Cloud', keys: Object.keys(GCP_SAMPLES) },
  { providerId: 'azure', label: 'Microsoft Azure', keys: Object.keys(AZURE_SAMPLES) },
  { providerId: 'multi', label: 'Multi-Cloud', keys: Object.keys(MULTI_CLOUD_SAMPLES) }
];
