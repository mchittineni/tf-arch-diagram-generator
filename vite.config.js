import { defineConfig } from 'vite';

/**
 * A statically hosted build (GitHub Pages, S3, any CDN) cannot send response
 * headers, so the built page carries its own CSP as a meta tag. It is injected
 * at build time only: the dev server needs a websocket for HMR, which this
 * policy deliberately does not allow.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join('; ');

function cspMetaTag() {
  return {
    name: 'csp-meta-tag',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`
      );
    }
  };
}

export default defineConfig({
  // Relative asset URLs so the build works from any sub-path (e.g. GitHub Pages
  // project sites) as well as from the CLI's server at the root.
  base: './',
  plugins: [cspMetaTag()],
  css: {
    postcss: {}
  },
  server: {
    port: 5173,
    open: false,
    host: true
  }
});
