import { describe, expect, it } from 'vitest';
import type { Profile } from '../content/schema';
import { interviewLink } from './interview';

const profile = (linkedin?: string): Profile => ({
  name: 'Test',
  headline: 'h',
  location: 'l',
  education: [],
  roles: [],
  skills: [],
  contact: { github: 'https://github.com/x', ...(linkedin ? { linkedin } : {}) },
});

describe('interviewLink', () => {
  it('is null when the profile has no LinkedIn, so the button is not shown', () => {
    expect(interviewLink(profile(), 'an engineer')).toBeNull();
  });

  it("opens the profile's LinkedIn and summarises only what the visitor wrote", () => {
    const got = interviewLink(profile('https://www.linkedin.com/in/test'), '  an engineer who ships  ', ' needs more on testing ');
    expect(got?.href).toBe('https://www.linkedin.com/in/test');
    expect(got?.summary).toBe('Ordered: an engineer who ships\nWhat was missing: needs more on testing');
  });

  it('only ever links to https, never javascript: or http:', () => {
    expect(interviewLink(profile('javascript:alert(1)'), 'an engineer')).toBeNull();
    expect(interviewLink(profile('http://www.linkedin.com/in/test'), 'an engineer')).toBeNull();
  });

  it('leaves out the missing line when nothing was written', () => {
    expect(interviewLink(profile('https://www.linkedin.com/in/test'), 'an engineer')?.summary).toBe('Ordered: an engineer');
    expect(interviewLink(profile('https://www.linkedin.com/in/test'), 'an engineer', '   ')?.summary).toBe('Ordered: an engineer');
  });
});
