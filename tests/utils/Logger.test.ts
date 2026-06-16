import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "../../src/utils/logger";

describe("Logger", () => {
  let logSpy: any;
  let infoSpy: any;
  let warnSpy: any;
  let errorSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not log debug or info when debug mode is disabled", () => {
    Logger.setDebugMode(false);
    Logger.debug("test debug");
    Logger.info("test info");

    expect(logSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should log debug and info when debug mode is enabled", () => {
    Logger.setDebugMode(true);
    Logger.debug("test debug");
    Logger.info("test info");

    expect(logSpy).toHaveBeenCalledWith("[KnowledgeHeatMap]", "test debug");
    expect(infoSpy).toHaveBeenCalledWith("[KnowledgeHeatMap]", "test info");
  });

  it("should always log warn and error", () => {
    Logger.setDebugMode(false);
    Logger.warn("test warn");
    Logger.error("test error");

    expect(warnSpy).toHaveBeenCalledWith("[KnowledgeHeatMap]", "test warn");
    expect(errorSpy).toHaveBeenCalledWith("[KnowledgeHeatMap]", "test error");
  });
});
