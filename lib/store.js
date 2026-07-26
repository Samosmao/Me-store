import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // format: "owner/repo"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const DATA_PATH = "data/apps.json";
const LOCAL_PATH = path.join(process.cwd(), DATA_PATH);

const hasGitHub = Boolean(GITHUB_TOKEN && GITHUB_REPO);

async function githubGetFile() {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error(`GitHub read failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { apps: JSON.parse(content), sha: json.sha };
}

async function githubPutFile(apps, sha) {
  const content = Buffer.from(JSON.stringify(apps, null, 2)).toString("base64");
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: "Update app list",
        content,
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`GitHub write failed: ${res.status} ${await res.text()}`);
  }
}

export async function getApps() {
  if (hasGitHub) {
    const { apps } = await githubGetFile();
    return apps;
  }
  const raw = fs.readFileSync(LOCAL_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function saveApps(apps) {
  if (hasGitHub) {
    const { sha } = await githubGetFile();
    await githubPutFile(apps, sha);
    return;
  }
  // Local dev fallback: write straight to the file on disk.
  fs.writeFileSync(LOCAL_PATH, JSON.stringify(apps, null, 2));
}
