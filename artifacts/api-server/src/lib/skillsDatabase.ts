/**
 * Comprehensive skills database used for skill extraction from resume text.
 * Skills are categorized for better detection and matching.
 */

export const SKILLS_DATABASE = [
  // Programming Languages
  "python", "java", "javascript", "typescript", "c++", "c#", "c", "r", "go",
  "scala", "kotlin", "swift", "ruby", "php", "rust", "matlab", "julia",
  "bash", "shell", "perl", "dart", "elixir", "haskell", "erlang", "fortran",

  // Web Technologies
  "html", "css", "react", "react.js", "angular", "vue", "vue.js", "node.js",
  "next.js", "express", "django", "flask", "fastapi", "spring", "asp.net",
  "jquery", "bootstrap", "tailwind", "sass", "graphql", "rest api", "soap",
  "websocket", "redux", "svelte", "nuxt",

  // Data Science / ML
  "machine learning", "deep learning", "nlp", "natural language processing",
  "computer vision", "reinforcement learning", "transfer learning", "feature engineering",
  "model deployment", "mlops", "statistics", "probability", "linear algebra",
  "hypothesis testing", "a/b testing", "time series", "clustering", "classification",
  "regression", "neural networks", "cnn", "rnn", "lstm", "transformers", "llm",
  "rag", "prompt engineering", "langchain", "hugging face", "bert", "gpt",

  // ML/AI Frameworks
  "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "xgboost",
  "lightgbm", "catboost", "spacy", "nltk", "opencv", "detectron", "yolo",
  "fastai", "jax", "paddle",

  // Data Tools
  "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly", "bokeh",
  "tableau", "power bi", "looker", "excel", "google sheets", "dbt",
  "data visualization", "data analysis", "data cleaning", "data wrangling",
  "etl", "data pipeline", "airflow", "spark", "hadoop", "hive", "pig",
  "kafka", "flink",

  // Databases
  "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
  "cassandra", "dynamodb", "firebase", "sqlite", "oracle", "mssql",
  "neo4j", "influxdb", "snowflake", "bigquery", "redshift",

  // Cloud / DevOps
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
  "ansible", "jenkins", "ci/cd", "git", "github", "gitlab", "bitbucket",
  "linux", "bash", "devops", "cloud computing", "microservices", "serverless",
  "heroku", "vercel", "netlify",

  // Business / Soft Skills
  "communication", "leadership", "teamwork", "problem solving", "critical thinking",
  "project management", "agile", "scrum", "kanban", "jira", "confluence",
  "presentation", "business intelligence", "reporting", "stakeholder management",

  // Other Technical
  "api development", "rest", "oop", "data structures", "algorithms",
  "system design", "networking", "security", "blockchain", "iot",
  "embedded systems", "mobile development", "android", "ios", "react native",
  "flutter", "testing", "unit testing", "selenium", "cypress", "figma", "ui/ux",
];

/**
 * Returns all known skills as a set for fast lookup.
 */
export function getSkillsSet(): Set<string> {
  return new Set(SKILLS_DATABASE.map((s) => s.toLowerCase()));
}
