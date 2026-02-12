/**
 * Logging mínimo del Wizard: [INFO] stdout, [WARN]/[ERROR] stderr.
 */
export function logInfo(msg: string): void {
  process.stdout.write(`[INFO] ${msg}\n`);
}

export function logWarn(msg: string): void {
  process.stderr.write(`[WARN] ${msg}\n`);
}

export function logError(msg: string): void {
  process.stderr.write(`[ERROR] ${msg}\n`);
}
