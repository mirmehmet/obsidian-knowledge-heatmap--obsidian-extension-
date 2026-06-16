const PREFIX = "[KnowledgeHeatMap]";

let debugEnabled = false;

/**
 * Centralized logging utility for the Knowledge Heat Map plugin.
 * Respects the debugMode setting — debug and info messages are only
 * logged when debug mode is enabled. Warnings and errors always log.
 */
export class Logger {
  /**
   * Enables or disables debug-level logging.
   * @param enabled - Whether debug mode is active.
   */
  public static setDebugMode(enabled: boolean): void {
    debugEnabled = enabled;
  }

  /**
   * Logs a debug message (only when debug mode is on).
   */
  public static debug(...args: unknown[]): void {
    if (debugEnabled) {
      console.log(PREFIX, ...args);
    }
  }

  /**
   * Logs an informational message (only when debug mode is on).
   */
  public static info(...args: unknown[]): void {
    if (debugEnabled) {
      console.info(PREFIX, ...args);
    }
  }

  /**
   * Logs a warning message (always visible).
   */
  public static warn(...args: unknown[]): void {
    console.warn(PREFIX, ...args);
  }

  /**
   * Logs an error message (always visible).
   */
  public static error(...args: unknown[]): void {
    console.error(PREFIX, ...args);
  }
}
