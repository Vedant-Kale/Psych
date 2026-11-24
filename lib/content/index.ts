import {
  allCertificates as certificates,
  allHouseMenus,
  allPosts as posts,
  allProfiles,
  allProjects as projects,
  allRoadmaps,
} from 'content-collections';

const byDateDesc = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);

export const allPosts = () => [...posts].sort(byDateDesc);
export const allProjects = () => [...projects].sort((a, b) => b.started.localeCompare(a.started));
export const allCertificates = () => [...certificates].sort(byDateDesc);
export const allRoadmap = () => [...allRoadmaps];

function single<T>(items: readonly T[], file: string): T {
  if (items.length !== 1) throw new Error(`expected exactly one ${file}, found ${items.length}`);
  return items[0]!;
}
export const profile = () => single(allProfiles, 'content/profile.yaml');
export const houseMenu = () => single(allHouseMenus, 'content/house-menu.yaml');

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);
