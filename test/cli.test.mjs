import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const packageRoot = resolve(import.meta.dirname, "..");

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", ...options });
}

test("packed CLI forwards installer options and installs only into an isolated project", () => {
  const sandbox = mkdtempSync(join(tmpdir(), "ateve-agent-skills-test-"));
  const project = join(sandbox, "project");
  const home = join(sandbox, "home");
  mkdirSync(project);
  mkdirSync(home);
  const archive = run("npm", ["pack", "--json"], { cwd: packageRoot });
  const [{ filename }] = JSON.parse(archive);
  const tarball = join(packageRoot, filename);

  try {
    run("npm", ["init", "--yes"], { cwd: project });
    run("npm", ["install", "--ignore-scripts", tarball], { cwd: project });

    const installedPackage = join(project, "node_modules", "@ateve", "agent-skills");
    const readme = readFileSync(join(installedPackage, "README.md"), "utf8");
    const guideLink = readme.match(/\[installation guide\]\(([^)]+)\)/);
    assert.ok(guideLink, "README must link to the installation guide");
    assert.match(readFileSync(join(installedPackage, guideLink[1]), "utf8"), /^# Install the Ateve agent skill/m);

    const cli = join(project, "node_modules", ".bin", "ateve-agent-skills");
    const result = spawnSync(cli, ["--agent", "codex", "--yes"], {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });

    assert.equal(result.status, 0, result.stderr);
    const installedSkill = join(project, ".agents", "skills", "ateve-search-api", "SKILL.md");
    const installedSkillText = readFileSync(installedSkill, "utf8");
    assert.match(installedSkillText, /Ateve Search API/);
    assert.match(installedSkillText, /maxResults/);
    assert.match(installedSkillText, /content\.highlights\b/);
    assert.match(installedSkillText, /each result's `highlights` field is an array of strings/);
    assert.doesNotMatch(installedSkillText, /limit|offset/i);
    verifyPublicContract(installedSkillText);
    verifyMediaContract(installedSkillText);
    verifyPublicContract(readme, false);

    const globalResult = spawnSync(cli, ["--global", "--agent", "codex", "--yes"], {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });

    assert.equal(globalResult.status, 0, globalResult.stderr);
    const globalSkill = join(home, ".agents", "skills", "ateve-search-api", "SKILL.md");
    const globalSkillText = readFileSync(globalSkill, "utf8");
    assert.match(globalSkillText, /Ateve Search API/);
    assert.match(globalSkillText, /maxResults/);
    assert.match(globalSkillText, /content\.highlights\b/);
    assert.match(globalSkillText, /each result's `highlights` field is an array of strings/);
    assert.doesNotMatch(globalSkillText, /limit|offset/i);
    verifyPublicContract(globalSkillText);
    verifyMediaContract(globalSkillText);
  } finally {
    // npm creates the tarball in the package root; remove only this known test artifact.
    const cleanup = spawnSync("rm", ["-f", tarball]);
    assert.equal(cleanup.status, 0, cleanup.stderr);
    rmSync(sandbox, { recursive: true, force: true });
  }
});

// Check the actual packaged documents and JSON requests users install.
function verifyPublicContract(text, parseExamples = true) {
  assert.doesNotMatch(text, /content\.highlight\b|total_estimated_matches|totalEstimatedMatches/);
  assert.match(text, /cannot be disabled/);
  assert.match(text, /token-efficient workflows/);
  if (!parseExamples) return;
  const examples = [...text.matchAll(/```json\n([\s\S]*?)\n```/g)];
  assert.ok(examples.length > 0);
  let enabled = false;
  for (const [, source] of examples) {
    const example = JSON.parse(source);
    if (example.content) {
      assert.equal(Object.hasOwn(example.content, 'highlight'), false);
      assert.equal(Object.hasOwn(example.content, 'snippet'), false);
      enabled ||= example.content.highlights === true;
    }
  }
  assert.ok(enabled, 'Packaged skill must contain a usable highlights request');
  assert.match(text, /empty string/);
  assert.match(text, /does not itself reduce model input tokens/);
}

function verifyMediaContract(text) {
  assert.match(text, /https:\/\/api\.ateve\.ai\/v1\/images/);
  assert.match(text, /https:\/\/api\.ateve\.ai\/v1\/videos/);
  assert.match(text, /"max_results":3/);
  assert.match(text, /host_page_url/);
  assert.match(text, /duration_seconds/);
  assert.match(text, /team_not_allowed/);
}
