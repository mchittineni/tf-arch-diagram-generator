/**
 * Conventional Commits enforcement.
 *
 * Commit messages drive releases (see .releaserc.json), so the scope list below
 * mirrors the project's structure — keep them in sync when you add a module.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // new capability (new provider, new CLI command)
      'fix',      // bug fix
      'docs',     // documentation only
      'style',    // formatting, no behaviour change
      'refactor', // restructuring without behaviour change
      'perf',     // performance
      'test',     // tests only
      'build',    // build system, packaging, dependencies
      'ci',       // CI configuration
      'chore',    // maintenance (icon refreshes, housekeeping)
      'revert'    // revert a previous commit
    ]],
    'scope-enum': [2, 'always', [
      'providers', // src/providers — the cloud plug-ins
      'aws',
      'gcp',
      'azure',
      'parser',    // src/parser
      'layout',    // src/canvas/layoutEngine.js
      'renderer',  // src/canvas/svgRenderer.js, DiagramCanvas
      'ui',        // src/components
      'cli',       // bin/cli.js
      'api',       // src/index.js — the programmatic surface
      'samples',   // src/data, examples
      'icons',     // assets/icons, scripts/fetch-icons.mjs
      'scripts',
      'deps',
      'release',
      'readme',
      'docs',
      'test',
      'ci',
      'deps-dev'
    ]],
    'scope-empty': [1, 'never'],
    // Disabled deliberately: subjects here routinely contain proper nouns
    // ("AWS", "GCP", "Cloud Run", "Front Door") that every case rule rejects.
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 100],
    'footer-leading-blank': [2, 'always'],
    'body-leading-blank': [2, 'always']
  }
};
