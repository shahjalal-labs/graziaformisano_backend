import generateOTP, { generateRefferCode } from "../generateOtp";

describe("generateOTP Helper", () => {
  it("should return a string of exactly 4 digits", () => {
    const otp = generateOTP();

    // 1. Check type
    expect(typeof otp).toBe("string");

    // 2. Check length is 4
    expect(otp.length).toBe(4);

    // 3. Check it represents a valid number between 1000 and 9999
    const numericOtp = Number(otp);
    expect(numericOtp).toBeGreaterThanOrEqual(1000);
    expect(numericOtp).toBeLessThanOrEqual(9999);
  });

  it("should generate different OTP values on multiple calls", () => {
    const otp1 = generateOTP();
    const otp2 = generateOTP();

    // It's statistically extremely unlikely that 10 random OTPs are all identical
    const set = new Set([otp1, otp2, generateOTP(), generateOTP()]);
    expect(set.size).toBeGreaterThan(1);
  });
});

describe("generateRefferCode Helper", () => {
  it("should return a 7-character referral code starting with 'F'", () => {
    const code = generateRefferCode();
    expect(typeof code).toBe("string");
    expect(code.length).toBe(7);
    expect(code.startsWith("F")).toBe(true);
  });

  it("should only contain uppercase letters and numbers", () => {
    const code = generateRefferCode();
    // Regex matching 'F' followed by 6 uppercase letters/digits
    expect(code).toMatch(/^F[A-Z0-9]{6}$/);
  });
});
