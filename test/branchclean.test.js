const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync, spawnSync } = require("node:child_process");
const { branches } = require("../src");
const bin = path.join(__dirname, "../bin/branchclean.js");
const mk = () => { const d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "bc-")), "r"); execFileSync("sh", [path.join(__dirname, "../examples/make-demo-repo.sh"), d]); return d; };
const now = new Date("2026-10-26T12:00:00").getTime();

test("classifies branches", () => {
  const d = mk(); const by = Object.fromEntries(branches(d, { now }).map((b) => [b.name, b]));
  assert.ok(by["feat/login"].merged); assert.ok(by["fix/typo"].merged);
  assert.ok(by["feat/dark-mode"].squashed && !by["feat/dark-mode"].merged);
  assert.ok(by["experiment/ai-chat"].stale && !by["experiment/ai-chat"].safe);
  assert.ok(by["feat/payments"].current && !by["feat/payments"].candidate);
  assert.ok(by["release/1.0"].protected && !by["release/1.0"].candidate);
  assert.ok(by.main.protected);
});
test("cli delete --yes removes only safe branches", () => {
  const d = mk();
  const r = spawnSync("node", [bin, d, "--delete", "--yes", "--now", "2026-10-26T12:00:00"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const left = execFileSync("git", ["branch", "--format=%(refname:short)"], { cwd: d, encoding: "utf8" }).trim().split("\n").sort();
  assert.deepEqual(left, ["experiment/ai-chat", "feat/payments", "main", "release/1.0"]);
  spawnSync("node", [bin, d, "--delete", "--yes", "--include-stale", "--now", "2026-10-26T12:00:00"]);
  assert.ok(!execFileSync("git", ["branch"], { cwd: d, encoding: "utf8" }).includes("experiment"));
});
test("not a repo", () => { assert.equal(spawnSync("node", [bin, os.tmpdir()]).status, 2); });
