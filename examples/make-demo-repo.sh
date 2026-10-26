#!/bin/sh
# Fake repo with merged, squash-merged, stale and active branches: sh examples/make-demo-repo.sh /tmp/demo
set -e
D=${1:-/tmp/branchclean-demo}; rm -rf "$D"; mkdir -p "$D"; cd "$D"
export GIT_AUTHOR_NAME="Soumya" GIT_AUTHOR_EMAIL="s@prism.dev" GIT_COMMITTER_NAME="Soumya" GIT_COMMITTER_EMAIL="s@prism.dev"
c() { GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1" git commit -q --allow-empty-message -m "$2"; }
w() { echo "$2" >> "$1"; git add -A; }
git init -q -b main; w README.md "# app"; c 2026-06-01T10:00:00 "init"
git switch -q -c feat/login;   w login.js a; c 2026-10-10T10:00:00 "feat: login form"
git switch -q main; git merge -q --no-ff feat/login -m "Merge feat/login"
git switch -q -c feat/dark-mode; w theme.css dark; c 2026-10-15T10:00:00 "feat: dark mode"; w theme.css more; c 2026-10-15T11:00:00 "fix: contrast"
git switch -q main; git merge -q --squash feat/dark-mode; c 2026-10-16T10:00:00 "feat: dark mode (#12)"
git switch -q -c fix/typo;     w README.md typo; c 2026-10-20T10:00:00 "docs: fix typo"
git switch -q main; git merge -q fix/typo
git switch -q -c experiment/ai-chat; w chat.js wip; c 2026-07-02T10:00:00 "wip: streaming chat"
git switch -q main; git switch -q -c feat/payments; w pay.js stripe; c 2026-10-25T18:00:00 "feat: stripe checkout"
git switch -q main; git switch -q -c release/1.0; git switch -q feat/payments
echo "demo repo: $D"
