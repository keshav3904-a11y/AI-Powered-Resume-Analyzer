/**
 * Resume analysis routes.
 * POST /api/resume/analyze — analyze resume against a job role (or custom skills)
 * GET  /api/resume/job-roles — list all predefined job roles with categories
 */

import { Router, type IRouter } from "express";
import { AnalyzeResumeBody } from "@workspace/api-zod";
import { analyzeResume, analyzeResumeCustom } from "../lib/resumeAnalyzer.js";
import { JOB_ROLES, CATEGORIES } from "../lib/jobRoles.js";

const router: IRouter = Router();

/**
 * GET /resume/job-roles
 * Returns all predefined job roles (with categories) and the list of category names.
 */
router.get("/job-roles", (_req, res) => {
  res.json({ roles: JOB_ROLES, categories: CATEGORIES });
});

/**
 * POST /resume/analyze
 * Accepts { resumeText, jobRole, customSkills?, customRoleTitle? } and returns analysis.
 * When jobRole === "__custom__", uses customSkills for matching.
 */
router.post("/analyze", (req, res) => {
  try {
    const parsed = AnalyzeResumeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parsed.error.message,
      });
      return;
    }

    const { resumeText, jobRole, customSkills, customRoleTitle } = parsed.data;

    if (!resumeText || resumeText.trim().length < 50) {
      res.status(400).json({
        error: "INVALID_RESUME",
        message:
          "Resume text is too short or empty. Please upload a valid resume.",
      });
      return;
    }

    let result;

    if (jobRole === "__custom__") {
      const skills = customSkills ?? [];
      if (skills.length === 0) {
        res.status(400).json({
          error: "MISSING_CUSTOM_SKILLS",
          message: "Please provide at least one required skill for your custom role.",
        });
        return;
      }
      result = analyzeResumeCustom(resumeText, customRoleTitle ?? "Custom Role", skills);
    } else {
      result = analyzeResume(resumeText, jobRole);
    }

    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: "ANALYSIS_ERROR", message });
  }
});

export default router;
