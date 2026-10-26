"use strict";
const { execFileSync } = require("node:child_process");
// commit-tree needs an identity; this throwaway commit is never referenced, so a placeholder is fine
const ID = { GIT_AUTHOR_NAME: "branchclean", GIT_AUTHOR_EMAIL: "branchclean@localhost", GIT_COMMITTER_NAME: "branchclean", GIT_COMMITTER_EMAIL: "branchclean@localhost" };
const git = (cwd, args, env) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20, env: env ? { ...process.env, ...env } : process.env }).trimEnd();
const tryGit = (cwd, args, env) => { try { return git(cwd, args, env); } catch { return null; } };
const PROTECTED = ["main", "master", "develop", "dev", "staging", "production", "prod", "release", "trunk", "gh-pages"];

function defaultBranch(cwd) {
  const r = tryGit(cwd, ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"]);
  if (r) return r.replace(/^origin\//, "");
  for (const b of ["main", "master", "trunk", "develop"]) if (tryGit(cwd, ["rev-parse", "--verify", "--quiet", `refs/heads/${b}`])) return b;
  return tryGit(cwd, ["branch", "--show-current"]) || "main";
}
/** List local branches with merge / gone / stale info. */
function branches(cwd, { base, staleDays = 30, now = Date.now(), protect = [] } = {}) {
  base ||= defaultBranch(cwd);
  const current = tryGit(cwd, ["branch", "--show-current"]) || "";
  const fmt = "%(refname:short)\x1f%(upstream:short)\x1f%(upstream:track)\x1f%(committerdate:unix)\x1f%(authorname)\x1f%(subject)\x1f%(objectname:short)";
  const rows = git(cwd, ["for-each-ref", `--format=${fmt}`, "refs/heads"]).split("\n").filter(Boolean);
  const merged = new Set((tryGit(cwd, ["branch", "--format=%(refname:short)", "--merged", base]) || "").split("\n").filter(Boolean));
  const prot = new Set([...PROTECTED, ...protect, base]);
  const isProt = (n) => prot.has(n) || [...prot].some((p) => p.endsWith("*") && n.startsWith(p.slice(0, -1))) || /^release\//.test(n);
  return rows.map((line) => {
    const [name, upstream, track, ts, author, subject, sha] = line.split("\x1f");
    const date = new Date(+ts * 1000), age = Math.floor((now - date) / 864e5);
    const ahead = +(/ahead (\d+)/.exec(track)?.[1] || 0), behind = +(/behind (\d+)/.exec(track)?.[1] || 0);
    const gone = /gone/.test(track);
    let squashed = false;
    if (!merged.has(name) && !isProt(name)) squashed = isSquashMerged(cwd, name, base);
    const b = { name, sha, upstream: upstream || null, gone, ahead, behind, date, age, author, subject, current: name === current, protected: isProt(name), merged: merged.has(name) && name !== base, squashed, stale: age >= staleDays };
    b.reason = b.merged ? "merged" : b.squashed ? "squash-merged" : b.gone ? "remote deleted" : b.stale ? `stale ${age}d` : null;
    b.safe = b.merged || b.squashed; // safe = content already in base
    b.candidate = !!b.reason && !b.current && !b.protected;
    return b;
  }).sort((x, y) => (y.candidate - x.candidate) || x.age - y.age);
}
/** Squash-merge detection: does a single commit with this branch's tree diff exist in base? (git cherry on a synthetic commit) */
function isSquashMerged(cwd, name, base) {
  const mb = tryGit(cwd, ["merge-base", base, name]); if (!mb) return false;
  const tree = tryGit(cwd, ["rev-parse", `${name}^{tree}`]); if (!tree) return false;
  const tmp = tryGit(cwd, ["commit-tree", tree, "-p", mb, "-m", "_"], ID); if (!tmp) return false;
  const out = tryGit(cwd, ["cherry", base, tmp]);
  return !!out && out.startsWith("-");
}
function remove(cwd, list, { force = false, remote = false } = {}) {
  const res = [];
  for (const b of list) {
    try {
      git(cwd, ["branch", force || !b.merged ? "-D" : "-d", b.name]);
      let r = "";
      if (remote && b.upstream && !b.gone) { const [rem, ...rest] = b.upstream.split("/"); try { git(cwd, ["push", rem, "--delete", rest.join("/")]); r = " + remote"; } catch { r = " (remote delete failed)"; } }
      res.push({ name: b.name, ok: true, sha: b.sha, note: r });
    } catch (e) { res.push({ name: b.name, ok: false, error: String(e.stderr || e.message).trim().split("\n")[0] }); }
  }
  return res;
}
module.exports = { branches, defaultBranch, isSquashMerged, remove, git, tryGit, PROTECTED };
