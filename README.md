<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:6C63FF,100:3DDC97&height=200&section=header&text=Prism%20Branch%20Cleaner&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Clean%20up%20merged%20git%20branches&descAlignY=58&descSize=16" width="100%" alt="Prism Branch Cleaner" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=6C63FF&center=true&vCenter=true&width=680&lines=branchclean;%E2%9C%94+squash-merged;branchclean+--delete;restore%3A+git+branch+%E2%80%A6" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-branch-cleaner/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-branch-cleaner/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-6C63FF?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-branch-cleaner?style=for-the-badge&color=3DDC97" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism Branch Cleaner screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" />

## ⚡ Overview

**Prism Branch Cleaner** (`branchclean`) shows every local branch with its status and deletes the ones that are done. Unlike `git branch --merged`, it also detects **squash-merged** branches (the default on GitHub PRs), so `feat/dark-mode` merged as `feat: dark mode (#12)` is recognised as safe to delete. Stale and remote-deleted branches are flagged but only removed when you ask. It never touches the current branch, your base branch, or protected names, and prints a restore command for every deletion.

## ✨ Features

- Detects **merged** and **squash-merged** branches (patch-id comparison, no network)
- Flags **stale** (idle N days) and **remote deleted** (`--fetch` prunes first) branches
- Protected: current branch, base, `main`/`master`/`develop`/`staging`/`production`/`release/*` + `--protect`
- Asks before deleting; `--yes` for scripts. Prints `git branch <name> <sha>` to **restore** each one
- `--remote` also deletes on origin; `--include-stale` for a deep clean
- Ahead / behind / local-only sync info, `--json`, auto-detects `main` vs `master`. Zero deps

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-branch-cleaner 

# or install globally
npm install -g github:krishyaa06/prism-branch-cleaner
branchclean --delete
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
branchclean                 show branches + what's safe to delete
branchclean --delete        delete merged / squash-merged branches (asks first)
branchclean --delete --yes  …without asking

  -b, --base <branch>      compare against (default: origin/HEAD, main or master)
      --stale <days>       mark branches idle for N days (default 30)
      --include-stale      also delete stale and remote-deleted branches
      --remote             also delete the branch on origin
      --fetch              git fetch --prune first
      --protect <list>     never touch these, e.g. "demo,exp/*"
  -y, --yes                don't ask
      --json               machine-readable output
```

### Git alias

```bash
git config --global alias.tidy '!npx --yes github:krishyaa06/prism-branch-cleaner --fetch --delete'
git tidy
```

Try it on a throwaway repo: `sh examples/make-demo-repo.sh /tmp/demo && branchclean /tmp/demo`.

## 📁 Project Structure

```
prism-branch-cleaner/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── branchclean.js   # CLI entry
├── examples/
│   └── make-demo-repo.sh   # throwaway repo with every branch type
├── src/
│   ├── index.js   # branch analysis, squash detection, delete
│   └── ui.js   # colours, tables
├── test/
│   └── branchclean.test.js
├── .gitignore
├── LICENSE
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism Branch Cleaner is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3DDC97,50:6C63FF,100:07060f&height=110&section=footer" width="100%" />
