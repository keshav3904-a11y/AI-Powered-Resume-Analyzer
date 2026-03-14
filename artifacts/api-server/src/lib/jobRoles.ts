/**
 * Job roles module — loads all roles from the JSON database file.
 * Adding new roles is as simple as editing job_roles_database.json.
 * No code changes needed.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jobRolesDb: Record<string, Record<string, { skills: string[] }>> =
  require("../data/job_roles_database.json");

export interface JobRole {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
}

/**
 * Derive a URL-safe id from the role title.
 * e.g. "Data Scientist" → "data-scientist"
 */
function toId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Build a short description from the role title and category.
 */
function buildDescription(title: string, category: string): string {
  const categoryDescriptions: Record<string, string> = {
    Technology: "technical role in software, data, and digital systems",
    Business: "business and management role driving organizational goals",
    Finance: "financial role focused on analysis, compliance, and strategy",
    Healthcare: "healthcare role dedicated to patient care and medical excellence",
    Engineering: "engineering role applying scientific principles to solve problems",
    Creative: "creative role producing visual and digital content",
    Education: "education role focused on teaching, research, and curriculum",
  };
  const suffix =
    categoryDescriptions[category] ?? "professional role in their respective field";
  return `A ${title} is a ${suffix}.`;
}

/** Flat list of all roles parsed from the JSON database. */
export const JOB_ROLES: JobRole[] = Object.entries(jobRolesDb).flatMap(
  ([category, roles]) =>
    Object.entries(roles).map(([title, data]) => ({
      id: toId(title),
      title,
      category,
      description: buildDescription(title, category),
      requiredSkills: data.skills,
    }))
);

/** Sorted list of unique category names. */
export const CATEGORIES: string[] = [...new Set(JOB_ROLES.map((r) => r.category))];

/**
 * Look up a role by its id.
 */
export function getJobRoleById(id: string): JobRole | undefined {
  return JOB_ROLES.find((role) => role.id === id);
}

/**
 * Build a synthetic JobRole for custom user-defined roles.
 */
export function buildCustomRole(
  title: string,
  skills: string[]
): JobRole {
  return {
    id: "__custom__",
    title: title || "Custom Role",
    category: "Custom",
    description: `Custom role with user-specified required skills.`,
    requiredSkills: skills,
  };
}
