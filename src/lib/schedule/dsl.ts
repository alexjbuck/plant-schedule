// Parser + resolver for the schedule DSL used in plant JSON files.
//   "LFD"          last frost date
//   "FFD"          first frost date
//   "LFD-42d"      LFD minus 42 days
//   "LFD+6w"       LFD plus 6 weeks (sugar for 42 days)
//   "Mar-15"       absolute calendar date for the given year

export type Anchor = 'LFD' | 'FFD';

export type ParsedExpr =
  | { kind: 'anchor'; anchor: Anchor; offsetDays: number }
  | { kind: 'absolute'; month: number; day: number };

const RELATIVE = /^(LFD|FFD)(?:([+-])(\d+)([dw]))?$/;
const ABSOLUTE =
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-([1-9]|[12]\d|3[01])$/;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export function parse(expr: string): ParsedExpr {
  const r = RELATIVE.exec(expr);
  if (r) {
    const [, anchor, sign, n, unit] = r;
    let offsetDays = 0;
    if (sign && n && unit) {
      const magnitude = Number(n) * (unit === 'w' ? 7 : 1);
      offsetDays = sign === '-' ? -magnitude : magnitude;
    }
    return { kind: 'anchor', anchor: anchor as Anchor, offsetDays };
  }
  const a = ABSOLUTE.exec(expr);
  if (a) {
    const month = MONTHS.indexOf(a[1]) + 1;
    return { kind: 'absolute', month, day: Number(a[2]) };
  }
  throw new Error(`Invalid date expression: ${JSON.stringify(expr)}`);
}

export type ResolveContext = {
  lastFrost: Date;
  firstFrost: Date;
  year: number;
};

export function resolve(expr: string, ctx: ResolveContext): Date {
  const p = parse(expr);
  if (p.kind === 'absolute') {
    return new Date(ctx.year, p.month - 1, p.day);
  }
  const anchor = p.anchor === 'LFD' ? ctx.lastFrost : ctx.firstFrost;
  const d = new Date(anchor);
  d.setDate(d.getDate() + p.offsetDays);
  return d;
}
