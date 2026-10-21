const MONTHS_PER_YEAR = 12;

const ANNUAL_RATE = 0.115;

const YEARS_TO_MATURITY = 7;

/** Illustrative monthly compounding; contributions arrive at month end. */
export function projectCapital(initial: number, monthly: number): number {
  const monthlyRate = ANNUAL_RATE / MONTHS_PER_YEAR;
  const months = YEARS_TO_MATURITY * MONTHS_PER_YEAR;
  const growth = Math.pow(
    1 + monthlyRate,
    months
  );
  return initial * growth + monthly * (growth - 1) / monthlyRate;
}
