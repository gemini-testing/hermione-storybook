jest.spyOn(console, "log").mockImplementation(jest.fn());
jest.spyOn(console, "warn").mockImplementation(jest.fn());
jest.spyOn(console, "error").mockImplementation(jest.fn());

import logger from "./logger";

describe("logger", () => {
    it("should log messages with a prefix", () => {
        logger.log("test log");

        expect(console.log).toHaveBeenCalledWith("[hermione-storybook]", "test log");
    });

    it("should log warnings with a prefix", () => {
        logger.warn("test warning");

        expect(console.warn).toHaveBeenCalledWith("[hermione-storybook]", "test warning");
    });

    it("should log errors with a prefix", () => {
        logger.error("test error");

        expect(console.error).toHaveBeenCalledWith("[hermione-storybook]", "test error");
    });
});
