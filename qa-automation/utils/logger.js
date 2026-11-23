/**
 * Simple structured console logger for test execution steps
 */
export const logger = {
  info: (msg) => console.log(`\x1b[34mℹ [INFO] [${new Date().toISOString()}] ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✔ [SUCCESS] [${new Date().toISOString()}] ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠ [WARN] [${new Date().toISOString()}] ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m✖ [ERROR] [${new Date().toISOString()}] ${msg}\x1b[0m`),
  step: (stepName) => console.log(`\x1b[36m▶ [STEP] ${stepName}\x1b[0m`)
};
