import { calculateDistance } from "../distanceCalculator";

describe("calculateDistance Helper", () => {
  it("should return 0 when both coordinates are the same", () => {
    const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(distance).toBe(0);
  });

  it("should calculate correct distance between New York and London (~5570 km)", () => {
    // New York: 40.7128, -74.0060
    // London: 51.5074, -0.1278
    const distance = calculateDistance(40.7128, -74.006, 51.5074, -0.1278);

    // Should be approximately 5570 km (within a 50km margin)
    expect(distance).toBeGreaterThan(5500);
    expect(distance).toBeLessThan(5650);
  });
});
