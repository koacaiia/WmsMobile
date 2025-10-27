# Copilot Instructions for WmsMobile

## Project Overview
This is a static web application for mobile warehouse management. The codebase consists of HTML, JavaScript, and CSS files. There is no build system or framework; all files are loaded directly in the browser.

## Major Components
- `index.html`, `main.js`, `style.css`: Main entry point and core logic/UI.
- `otherPlt.html`, `otherPlt.js`, `otherPlt.css`: Platform-specific features.
- `otherEnF.html`, `otherEnf.js`, `otherEnf.css`: Environment-specific features.
- `imagePop.html`, `imagePop.js`, `img.css`: Image pop-up functionality.
- `favicon-generator.html`, `favicon.ico`, `firebase-messaging-sw.js`: Favicon and service worker for notifications.
- `images/`: Static image assets.

## Patterns & Conventions
- All JavaScript is written in plain ES5/ES6, loaded via `<script>` tags.
- CSS is split by feature (main, image pop, platform, environment).
- No module system; global variables/functions are common.
- Service worker (`firebase-messaging-sw.js`) is used for push notifications.
- File naming is feature-oriented (e.g., `otherPlt`, `otherEnf`).

## Developer Workflows
- **Debugging:** Use browser DevTools. No source maps or build steps.
- **Testing:** Manual, via browser. No automated tests present.
- **Adding Features:** Create new HTML/JS/CSS files per feature, then link them in the main HTML or feature HTML.
- **Static Assets:** Place images in `images/` and reference with relative paths.

## Integration Points
- Firebase Messaging (via service worker) for push notifications.
- No backend integration; all logic is client-side.

## Examples
- To add a new feature, create `feature.html`, `feature.js`, and `feature.css`, then link them together.
- To update the main UI, edit `index.html`, `main.js`, and `style.css`.

## Tips for AI Agents
- Maintain feature separation by following the file naming convention.
- Avoid introducing frameworks or build tools unless explicitly requested.
- Use global functions/variables for cross-file communication.
- Reference images from the `images/` directory using relative paths.

---
_If any section is unclear or missing, please provide feedback for improvement._
