/**
 * Core resume analysis engine.
 * Handles text preprocessing, skill extraction, scoring, and recommendation generation.
 */

import { SKILLS_DATABASE } from "./skillsDatabase.js";
import { getJobRoleById, JobRole } from "./jobRoles.js";

// ────────────────────────────────────────────────────────────
// Text Preprocessing
// ────────────────────────────────────────────────────────────

/**
 * Lowercases and normalises whitespace in raw resume text.
 */
function preprocessText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

// ────────────────────────────────────────────────────────────
// Information Extraction (Regex + Heuristics)
// ────────────────────────────────────────────────────────────

/**
 * Extract a candidate name from the first non-empty lines.
 * Heuristic: the first capitalised line that does not look like an email/phone/URL.
 */
function extractName(raw: string): string {
  const lines = raw
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 10)) {
    if (
      /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) &&
      !line.includes("@") &&
      !/\d{5,}/.test(line)
    ) {
      return line.trim();
    }
  }
  return "";
}

/**
 * Extract an email address using a simple regex.
 */
function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-z]{2,}/);
  return match ? match[0] : "";
}

/**
 * Extract a phone number using a simple regex.
 */
function extractPhone(text: string): string {
  const match = text.match(
    /(?:\+?(\d{1,3})\s?)?(?:\(?\d{3,4}\)?[\s\-.]?){1,3}\d{3,4}/
  );
  return match ? match[0].trim() : "";
}

/**
 * Extract education institutions/degrees from the resume.
 */
function extractEducation(text: string): string[] {
  const degrees = [
    "b\\.tech", "m\\.tech", "b\\.e", "m\\.e", "bsc", "msc", "ba", "ma",
    "phd", "mba", "bca", "mca", "bachelor", "master", "doctoral",
    "diploma", "associate",
  ];
  const pattern = new RegExp(
    `(${degrees.join("|")})[^\\n.]{0,120}`,
    "gi"
  );
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches.map((m) => m.trim()))];
}

/**
 * Extract project titles from the resume.
 * Heuristic: lines immediately after "project" headings.
 */
function extractProjects(text: string): string[] {
  const projectSection = text.match(
    /project[s]?[:\s]+(.{20,2000}?)(?=\n{2,}|\n[A-Z]{4,}|\n(?:experience|education|skill|certification))/is
  );
  if (!projectSection) return [];

  const lines = projectSection[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && l.length < 150);
  return lines.slice(0, 6);
}

/**
 * Extract certifications from the resume.
 */
function extractCertifications(text: string): string[] {
  const certSection = text.match(
    /certif(?:ication|ied)[s]?[:\s]+(.{20,1000}?)(?=\n{2,}|\n[A-Z]{4,}|\n(?:experience|education|skill|project))/is
  );
  if (!certSection) return [];

  const lines = certSection[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 5 && l.length < 150);
  return lines.slice(0, 8);
}

/**
 * Heuristically determine experience level (years or seniority words).
 */
function extractExperience(text: string): string {
  const yearMatch = text.match(/(\d+)\+?\s*years?\s+(?:of\s+)?experience/i);
  if (yearMatch) return `${yearMatch[1]}+ years of experience`;

  const seniorMatch = text.match(
    /\b(senior|lead|principal|junior|entry[\s-]?level|mid[\s-]?level|intern)\b/i
  );
  if (seniorMatch) return `${seniorMatch[1]} level`;

  // Count experience section lines as a proxy
  const expSection = text.match(
    /(?:work\s+)?experience[:\s]+(.{0,2000}?)(?=\n{2,}|\n[A-Z]{4,}|\n(?:education|skill|project|certif))/is
  );
  if (expSection) {
    const lines = expSection[1]
      .split("\n")
      .filter((l) => l.trim().length > 10);
    if (lines.length > 10) return "Extensive experience";
    if (lines.length > 4) return "Moderate experience";
    return "Limited experience";
  }

  return "Not specified";
}

// ────────────────────────────────────────────────────────────
// Skill Extraction
// ────────────────────────────────────────────────────────────

/**
 * Extract skills found in the resume text by matching against the skills database.
 */
function extractSkills(text: string): string[] {
  const lower = preprocessText(text);
  const found: string[] = [];

  for (const skill of SKILLS_DATABASE) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) {
      found.push(skill);
    }
  }

  return [...new Set(found)];
}

// ────────────────────────────────────────────────────────────
// Scoring Engine
// ────────────────────────────────────────────────────────────

interface ScoreBreakdown {
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  projectScore: number;
  overallScore: number;
}

/**
 * Compute the weighted scoring.
 * Weights: Skill 50%, Experience 25%, Education 15%, Projects 10%.
 */
function computeScores(
  matchedSkills: string[],
  requiredSkills: string[],
  experience: string,
  education: string[],
  projects: string[]
): ScoreBreakdown {
  // Skill score: matched / required ratio
  const skillScore =
    requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  // Experience score
  let experienceScore = 0;
  if (/extensive/i.test(experience)) experienceScore = 90;
  else if (/\d+\+?\s*years?/i.test(experience)) {
    const yrs = parseInt(experience, 10);
    experienceScore = Math.min(100, yrs * 12);
  } else if (/moderate/i.test(experience)) experienceScore = 60;
  else if (/limited/i.test(experience)) experienceScore = 30;
  else if (/not specified/i.test(experience)) experienceScore = 20;
  else experienceScore = 40;

  // Education score
  let educationScore = 0;
  if (education.some((e) => /phd|doctoral/i.test(e))) educationScore = 100;
  else if (education.some((e) => /m\.?tech|msc|master|mba|mca/i.test(e)))
    educationScore = 85;
  else if (education.some((e) => /b\.?tech|bsc|bachelor|be\b|bca/i.test(e)))
    educationScore = 70;
  else if (education.some((e) => /diploma|associate/i.test(e)))
    educationScore = 50;
  else if (education.length > 0) educationScore = 40;

  // Project score: based on number of projects
  const projectScore = Math.min(100, projects.length * 20);

  // Weighted overall
  const overallScore = Math.round(
    skillScore * 0.5 +
    experienceScore * 0.25 +
    educationScore * 0.15 +
    projectScore * 0.1
  );

  return {
    skillScore: Math.min(100, skillScore),
    experienceScore: Math.min(100, experienceScore),
    educationScore: Math.min(100, educationScore),
    projectScore: Math.min(100, projectScore),
    overallScore: Math.min(100, overallScore),
  };
}

// ────────────────────────────────────────────────────────────
// Recommendations & Summary
// ────────────────────────────────────────────────────────────

/**
 * Generate a short resume summary.
 */
function generateSummary(
  name: string,
  jobRole: JobRole,
  matchedSkills: string[],
  experience: string,
  education: string[]
): string {
  const candidate = name || "The candidate";
  const degreeStr = education.length > 0 ? education[0] : "";
  const eduNote = degreeStr ? ` with a background in ${degreeStr}` : "";
  const expNote = experience !== "Not specified" ? ` and ${experience}` : "";
  const skillCount = matchedSkills.length;

  return (
    `${candidate}${eduNote}${expNote}. ` +
    `The resume demonstrates proficiency in ${skillCount} of the required skills for the ${jobRole.title} role, ` +
    `including ${matchedSkills.slice(0, 3).join(", ")}` +
    (matchedSkills.length > 3 ? ", and more" : "") +
    "."
  );
}

/**
 * Identify strength areas (top matched skills + education/experience highlights).
 */
function identifyStrengths(
  matchedSkills: string[],
  experience: string,
  education: string[],
  projects: string[]
): string[] {
  const strengths: string[] = [];
  if (matchedSkills.length > 0)
    strengths.push(`Proficient in ${matchedSkills.slice(0, 4).join(", ")}`);
  if (education.length > 0) strengths.push(`Educational background: ${education[0]}`);
  if (!/not specified/i.test(experience)) strengths.push(`Work experience: ${experience}`);
  if (projects.length > 0)
    strengths.push(`Has ${projects.length} relevant project(s) showcased`);
  return strengths;
}

/**
 * Generate improvement tips based on missing skills.
 */
function generateImprovementTips(
  missingSkills: string[],
  overallScore: number
): string[] {
  const tips: string[] = [];

  if (missingSkills.length > 0) {
    tips.push(
      `Acquire or highlight skills in: ${missingSkills.slice(0, 3).join(", ")}`
    );
  }

  if (overallScore < 50) {
    tips.push("Consider adding more measurable achievements and project outcomes to your resume.");
    tips.push("Ensure your resume clearly highlights relevant technical skills for this role.");
  } else if (overallScore < 75) {
    tips.push("Strengthen your resume with certifications in the missing skill areas.");
    tips.push("Add more project details that demonstrate hands-on experience.");
  } else {
    tips.push("Your resume is strong — consider tailoring the summary section for each application.");
    tips.push("Quantify your achievements (e.g., 'Improved model accuracy by 15%').");
  }

  tips.push("Include links to GitHub, portfolio, or LinkedIn to support your application.");
  return tips;
}

/**
 * Recommend skills to learn next based on missing role skills.
 */
function generateSkillRecommendations(
  missingSkills: string[],
  jobRole: JobRole
): string[] {
  const high = missingSkills.slice(0, 5);
  const recs = high.map((s) => `Learn ${s} (required for ${jobRole.title})`);
  if (recs.length === 0) recs.push("Keep up-to-date with the latest trends in your field.");
  return recs;
}

/**
 * Generate a human-readable explainability statement.
 */
function generateExplainability(
  name: string,
  jobRole: JobRole,
  overallScore: number,
  matchedSkills: string[],
  missingSkills: string[],
  scores: ScoreBreakdown
): string {
  const candidate = name || "Your resume";
  return (
    `${candidate} matches ${overallScore}% of the requirements for the ${jobRole.title} role. ` +
    `The skill match contributes the most, with ${matchedSkills.length} out of ${jobRole.requiredSkills.length} required skills identified. ` +
    `Experience contributes ${scores.experienceScore}% to the score, education ${scores.educationScore}%, and projects ${scores.projectScore}%. ` +
    (missingSkills.length > 0
      ? `Key gaps include: ${missingSkills.slice(0, 4).join(", ")}.`
      : "No major skill gaps were detected — excellent match!")
  );
}

// ────────────────────────────────────────────────────────────
// Main Analysis Function
// ────────────────────────────────────────────────────────────

export interface AnalysisResult {
  candidateName: string;
  email: string;
  phone: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  projectScore: number;
  detectedSkills: string[];
  missingSkills: string[];
  matchedSkills: string[];
  requiredSkills: string[];
  education: string[];
  experience: string;
  projects: string[];
  certifications: string[];
  resumeSummary: string;
  strengthAreas: string[];
  improvementTips: string[];
  skillRecommendations: string[];
  explainability: string;
  skillCoveragePercent: number;
}

/**
 * Run a full analysis of a resume against a custom user-defined role and skill list.
 */
export function analyzeResumeCustom(
  resumeText: string,
  roleTitle: string,
  requiredSkills: string[]
): AnalysisResult {
  const customRole = {
    id: "__custom__",
    title: roleTitle,
    category: "Custom",
    description: `Custom role: ${roleTitle}`,
    requiredSkills,
  };
  return runAnalysis(resumeText, customRole);
}

/**
 * Run a full analysis of a resume against a given job role.
 */
export function analyzeResume(
  resumeText: string,
  jobRoleId: string
): AnalysisResult {
  const jobRole = getJobRoleById(jobRoleId);
  if (!jobRole) {
    throw new Error(`Unknown job role: ${jobRoleId}`);
  }

  return runAnalysis(resumeText, jobRole);
}

/**
 * Internal: shared analysis logic used by both analyzeResume and analyzeResumeCustom.
 */
function runAnalysis(resumeText: string, jobRole: { id: string; title: string; requiredSkills: string[] }): AnalysisResult {
  // Extract structured info
  const name = extractName(resumeText);
  const email = extractEmail(resumeText);
  const phone = extractPhone(resumeText);
  const education = extractEducation(resumeText);
  const projects = extractProjects(resumeText);
  const certifications = extractCertifications(resumeText);
  const experience = extractExperience(resumeText);

  // Skill extraction and matching
  const detectedSkills = extractSkills(resumeText);
  const requiredSkills = jobRole.requiredSkills;

  // Case-insensitive matching
  const requiredLower = requiredSkills.map((s) => s.toLowerCase());
  const detectedLower = detectedSkills.map((s) => s.toLowerCase());

  const matchedSkills = requiredSkills.filter((s) =>
    detectedLower.includes(s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(
    (s) => !detectedLower.includes(s.toLowerCase())
  );

  // Score computation
  const scores = computeScores(
    matchedSkills,
    requiredSkills,
    experience,
    education,
    projects
  );

  // Coverage
  const skillCoveragePercent =
    requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  // Generate narrative content
  const resumeSummary = generateSummary(
    name,
    jobRole,
    matchedSkills,
    experience,
    education
  );
  const strengthAreas = identifyStrengths(
    matchedSkills,
    experience,
    education,
    projects
  );
  const improvementTips = generateImprovementTips(
    missingSkills,
    scores.overallScore
  );
  const skillRecommendations = generateSkillRecommendations(
    missingSkills,
    jobRole
  );
  const explainability = generateExplainability(
    name,
    jobRole,
    scores.overallScore,
    matchedSkills,
    missingSkills,
    scores
  );

  return {
    candidateName: name,
    email,
    phone,
    ...scores,
    detectedSkills,
    missingSkills,
    matchedSkills,
    requiredSkills,
    education,
    experience,
    projects,
    certifications,
    resumeSummary,
    strengthAreas,
    improvementTips,
    skillRecommendations,
    explainability,
    skillCoveragePercent,
  };
}
