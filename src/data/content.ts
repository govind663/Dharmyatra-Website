/**
 * MASTER CONTENT ENTRYPOINT
 *
 * Keep components importing from this file:
 *   import { TEMPLES, PANDITS, SERVICES } from "@/content/content";
 *
 * Individual sections live in their own files. Edit those files when
 * maintaining content; avoid putting large data arrays back here.
 */

import { TEMPLE_DATA } from "./temples";
import { TEMPLE_SOURCES, CONTENT_SOURCE_NOTE } from "./sources";
import { PANDITS } from "./pandits";
import { SERVICES } from "./services";
import { ASHRAMS } from "./ashrams";
import { COURSES } from "./courses";
import { EVENTS } from "./events";
import { PLACES } from "./places";
import { PACKAGES } from "./packages";
import { ARTICLES } from "./articles";
import { STATES, CATEGORIES } from "./taxonomy";
import { GALLERY } from "./gallery";

export * from "./types";
export type { Temple } from "./temples";
export type { Pandit } from "./pandits";
export type { Service } from "./services";
export type { Ashram } from "./ashrams";
export type { Course } from "./courses";
export type { DhamEvent } from "./events";
export type { Place } from "./places";
export type { YatraPackage } from "./packages";
export type { Article } from "./articles";

export { PANDITS, SERVICES, ASHRAMS, COURSES, EVENTS, PLACES, PACKAGES, ARTICLES };
export { STATES, CATEGORIES, GALLERY };
export { TEMPLE_SOURCES, CONTENT_SOURCE_NOTE };

export const TEMPLES = TEMPLE_DATA.map((temple) => ({
  ...temple,
  sources: TEMPLE_SOURCES[temple.slug] ?? [],
  contentNote: CONTENT_SOURCE_NOTE,
}));

export const findTemple = (slug: string) =>
  TEMPLES.find((temple) => temple.slug === slug);

export const findPandit = (slug: string) =>
  PANDITS.find((pandit) => pandit.slug === slug);

export const findService = (slug: string) =>
  SERVICES.find((service) => service.slug === slug);

export const findAshram = (slug: string) =>
  ASHRAMS.find((ashram) => ashram.slug === slug);

export const findCourse = (slug: string) =>
  COURSES.find((course) => course.slug === slug);

export const findEvent = (slug: string) =>
  EVENTS.find((event) => event.slug === slug);

export const findPlace = (slug: string) =>
  PLACES.find((place) => place.slug === slug);

export const findPackage = (slug: string) =>
  PACKAGES.find((pkg) => pkg.slug === slug);

export const findArticle = (slug: string) =>
  ARTICLES.find((article) => article.slug === slug);
