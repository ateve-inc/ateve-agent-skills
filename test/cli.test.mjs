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

    const cli = join(project, "node_modules", ".bin", "ateve-agent-skills");
    const result = spawnSync(cli, ["--agent", "codex", "--yes"], {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });

    assert.equal(result.status, 0, result.stderr);
    const installedSkill = join(project, ".agents", "skills", "ateve-search-api", "SKILL.md");
    assert.match(readFileSync(installedSkill, "utf8"), /Ateve Search API/);

    const globalResult = spawnSync(cli, ["--global", "--agent", "codex", "--yes"], {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });

    assert.equal(globalResult.status, 0, globalResult.stderr);
    const globalSkill = join(home, ".agents", "skills", "ateve-search-api", "SKILL.md");
    assert.match(readFileSync(globalSkill, "utf8"), /Ateve Search API/);
  } finally {
    // npm creates the tarball in the package root; remove only this known test artifact.
    const cleanup = spawnSync("rm", ["-f", tarball]);
    assert.equal(cleanup.status, 0, cleanup.stderr);
    rmSync(sandbox, { recursive: true, force: true });
  }
});
