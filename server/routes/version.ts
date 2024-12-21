import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";


function getCommitHash(): string | null {
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    return commitHash;
  } catch (error) {
    console.error("Failed to get commit hash", error);
    return null;
  }
}


function getVersion(): string {
  const packageJsonPath = resolve(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version || "Unknown";
}

export default defineEventHandler((event) => {
  const version = getVersion();
  const commitHash = getCommitHash();
  return { version, commitHash };
});
