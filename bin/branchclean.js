#!/usr/bin/env node
"use strict";
const path = require("node:path");
const readline = require("node:readline/promises");
const { parseArgs } = require("node:util");
const { branches, remove, tryGit } = require("../src");
const { c, header, table, plural } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("branchclean", "delete the branches you forgot about")}

${c.bold("Usage")}
  branchclean                 show branches + what's safe to delete
  branchclean --delete        delete merged / squash-merged branches (asks first)
  branchclean --delete --yes  …without asking

${c.bold("Options")}
  -b, --base <branch>      compare against (default: origin/HEAD, main or master)
      --stale <days>       mark branches idle for N days (default 30)
      --include-stale      also delete stale and remote-deleted branches (uses -D)
      --remote             also delete the branch on origin
      --fetch              git fetch --prune first (detects deleted remotes)
      --protect <list>     never touch these, e.g. "demo,exp/*"
  -y, --yes                don't ask
      --json               machine-readable output
  -v, --version / -h, --help

${c.dim("Never deletes: current branch, base, main/master/develop/staging/production/release/*")}`;

let a;
try { a = parseArgs({ allowPositionals: true, options: { base: { type: "string", short: "b" }, stale: { type: "string", default: "30" }, "include-stale": { type: "boolean" }, delete: { type: "boolean", short: "d" }, remote: { type: "boolean" }, fetch: { type: "boolean" }, protect: { type: "string" }, yes: { type: "boolean", short: "y" }, json: { type: "boolean" }, now: { type: "string" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } }); }
catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values;
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }
const cwd = path.resolve(a.positionals[0] || ".");
if (tryGit(cwd, ["rev-parse", "--git-dir"]) == null) { console.error(c.red(`✖ Not a git repository: ${cwd}`)); process.exit(2); }

(async () => {
  if (o.fetch) tryGit(cwd, ["fetch", "--prune", "--quiet"]);
  const list = branches(cwd, { base: o.base, staleDays: +o.stale || 30, now: o.now ? new Date(o.now).getTime() : Date.now(), protect: (o.protect || "").split(",").map((s) => s.trim()).filter(Boolean) });
  const base = o.base || require("../src").defaultBranch(cwd);
  const targets = list.filter((b) => b.candidate && (b.safe || o["include-stale"]));
  if (o.json && !o.delete) { console.log(JSON.stringify({ base, branches: list }, null, 2)); return; }

  console.log(header("branchclean", `${plural(list.length, "branch", "branches")} · base ${base}`));
  const ago = (d) => (d < 1 ? "today" : d < 2 ? "yesterday" : d < 60 ? `${d}d ago` : `${Math.floor(d / 30)}mo ago`);
  const tag = (b) => b.current ? c.accent("● current") : b.protected ? c.dim("protected") : b.merged ? c.green("✔ merged") : b.squashed ? c.green("✔ squash-merged") : b.gone ? c.yellow("⚠ remote deleted") : b.stale ? c.yellow(`⚠ stale`) : c.dim("active");
  const sync = (b) => [b.ahead && c.green(`↑${b.ahead}`), b.behind && c.red(`↓${b.behind}`), !b.upstream && c.dim("local")].filter(Boolean).join(" ");
  console.log("\n" + table(list.map((b) => [(b.candidate && (b.safe || o["include-stale"]) ? c.red("✖ ") : "  ") + (b.current ? c.accent(b.name) : c.bold(b.name)), tag(b), c.dim(ago(b.age)), sync(b), c.gray(b.subject.slice(0, 34))]), { head: ["  BRANCH", "STATUS", "LAST COMMIT", "SYNC", "MESSAGE"] }));

  const staleOnly = list.filter((b) => b.candidate && !b.safe);
  if (!targets.length) {
    console.log(`\n${c.green("✔")} Nothing safe to delete.${staleOnly.length ? c.dim(` ${plural(staleOnly.length, "stale branch", "stale branches")} kept — add --include-stale to remove.`) : ""}`);
    return;
  }
  console.log(`\n${c.red("✖")} ${c.bold(plural(targets.length, "branch", "branches"))} can go${staleOnly.length && !o["include-stale"] ? c.dim(` (+${staleOnly.length} stale, add --include-stale)`) : ""}`);
  if (!o.delete) { console.log(`${c.dim("Run")} ${c.cyan("branchclean --delete")} ${c.dim("to remove them.")}`); return; }
  if (!o.yes) {
    if (!process.stdin.isTTY) { console.error(c.yellow("⚠ Not a TTY — pass --yes to delete")); process.exit(1); }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ans = await rl.question(`${c.accent("?")} Delete ${targets.map((t) => t.name).join(", ")}${o.remote ? " (and on origin)" : ""}? ${c.dim("(y/N)")} `); rl.close();
    if (!/^y/i.test(ans.trim())) { console.log(c.dim("Cancelled.")); return; }
  }
  const res = remove(cwd, targets, { remote: o.remote });
  if (o.json) { console.log(JSON.stringify(res, null, 2)); return; }
  console.log();
  for (const r of res) console.log(r.ok ? `  ${c.green("✔")} deleted ${c.bold(r.name)}${r.note}  ${c.dim(`restore: git branch ${r.name} ${r.sha}`)}` : `  ${c.red("✖")} ${r.name}: ${r.error}`);
  process.exit(res.every((r) => r.ok) ? 0 : 1);
})();
