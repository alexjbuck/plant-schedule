import { describe, expect, test } from 'vitest';
import { parse, resolve } from './dsl';

const ctx = {
  lastFrost: new Date(2026, 4, 1), // May 1
  firstFrost: new Date(2026, 9, 15), // Oct 15
  year: 2026
};

describe('parse', () => {
  test('bare anchor', () => {
    expect(parse('LFD')).toEqual({ kind: 'anchor', anchor: 'LFD', offsetDays: 0 });
    expect(parse('FFD')).toEqual({ kind: 'anchor', anchor: 'FFD', offsetDays: 0 });
  });

  test('anchor with day offset', () => {
    expect(parse('LFD-42d')).toEqual({ kind: 'anchor', anchor: 'LFD', offsetDays: -42 });
    expect(parse('LFD+7d')).toEqual({ kind: 'anchor', anchor: 'LFD', offsetDays: 7 });
  });

  test('anchor with week offset', () => {
    expect(parse('LFD-6w')).toEqual({ kind: 'anchor', anchor: 'LFD', offsetDays: -42 });
    expect(parse('FFD+2w')).toEqual({ kind: 'anchor', anchor: 'FFD', offsetDays: 14 });
  });

  test('absolute date', () => {
    expect(parse('Mar-15')).toEqual({ kind: 'absolute', month: 3, day: 15 });
    expect(parse('Oct-1')).toEqual({ kind: 'absolute', month: 10, day: 1 });
  });

  test('invalid expression throws', () => {
    expect(() => parse('LFD-3y')).toThrow();
    expect(() => parse('LFD * 2')).toThrow();
    expect(() => parse('Foo-1')).toThrow();
    expect(() => parse('')).toThrow();
  });
});

describe('resolve', () => {
  test('LFD resolves to lastFrost', () => {
    expect(resolve('LFD', ctx).toDateString()).toBe(ctx.lastFrost.toDateString());
  });

  test('LFD-42d is 42 days before lastFrost', () => {
    const expected = new Date(2026, 2, 20); // Mar 20
    expect(resolve('LFD-42d', ctx).toDateString()).toBe(expected.toDateString());
  });

  test('FFD+2w is 14 days after firstFrost', () => {
    const expected = new Date(2026, 9, 29); // Oct 29
    expect(resolve('FFD+2w', ctx).toDateString()).toBe(expected.toDateString());
  });

  test('absolute date uses the resolve year', () => {
    expect(resolve('Mar-15', ctx).toDateString()).toBe(new Date(2026, 2, 15).toDateString());
  });
});
