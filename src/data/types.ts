/**
 * Shared content metadata types.
 * Keep cross-cutting types here so individual content files stay focused.
 */

export type TempleSource = {
  title: string;
  organization: string;
  url: string;
  type: "Official Temple" | "Government" | "Tourism" | "Ministry" | "Reference";
  purpose: string;
  lastVerified: string;
  dynamic?: boolean;
};
