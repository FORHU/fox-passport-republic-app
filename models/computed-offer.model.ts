export default class MComputedOffer implements TComputedOffer {
  currency: string;
  date: string | null;
  from: string | null;
  to: string | null;
  guests: number | null;
  payment_computation: {
    user: {
      base_rate?: string | null;
      subtotal: string | null;
      cleaning_fee: number | null;
      rebate: number | null;
      grand_total: string | null;
    };
    venue: {
      subtotal: string | null;
      cleaning_fee: number | null;
      commission_fee: number | null;
      grand_total: string | null;
    };
  };
  computation_used?: 'PER_HOUR' | 'PER_DAY';
  type?: 'HIRE_FEE' | 'CUSTOM_PRICE'
  duration?: string

  constructor(computedOffer: Partial<MComputedOffer> = {}) {
    this.currency = computedOffer?.currency || "SGD";
    this.date = computedOffer?.date || null;
    this.from = computedOffer?.from || null;
    this.to = computedOffer?.to || null;
    this.guests = computedOffer?.guests || null;
    this.payment_computation = {
      user: {
        base_rate: computedOffer.payment_computation?.user?.base_rate || null,
        subtotal: computedOffer.payment_computation?.user?.subtotal || null,
        cleaning_fee:
          computedOffer.payment_computation?.user?.cleaning_fee || 0,
        rebate: computedOffer.payment_computation?.user?.rebate || 0,
        grand_total:
          computedOffer.payment_computation?.user?.grand_total || null,
      },
      venue: {
        subtotal: computedOffer.payment_computation?.venue?.subtotal || null,
        cleaning_fee:
          computedOffer.payment_computation?.venue?.cleaning_fee || 0,
        commission_fee:
          computedOffer.payment_computation?.venue?.commission_fee || 0,
        grand_total:
          computedOffer.payment_computation?.venue?.grand_total || null,
      },
    };
    this.computation_used = computedOffer?.computation_used;
    this.type = computedOffer?.type
    this.duration = computedOffer?.duration;
  }
}
