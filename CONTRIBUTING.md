# Contributing

Thanks for considering a contribution. Before opening a PR, please read this in full -- it covers expectations that prevent the most common reasons we close PRs without merging.

## AI-assisted contributions

If any portion of your PR was generated, refactored, or scaffolded by an AI coding assistant (Claude, Copilot, Cursor, Codex, ChatGPT, Gemini, etc.), **disclose it in the PR description** using this block:

```markdown
### AI assistance disclosure
- Tool(s) used:
- Scope (which files / which kinds of changes):
- Human review performed:
```

Undisclosed AI contributions are not a moral failing, but they do change how we review. We've seen patterns from other projects where AI-PR floods consumed maintainer time without producing merges (see, e.g., the RPCS3 maintainers' 2026 statement). We'd rather review fewer, well-prepared PRs than many speculative ones.

We are **not** going to reject AI-assisted PRs categorically. We will reject PRs that:

- Don't compile, don't pass tests locally, or weren't run by the contributor.
- Modify files the author cannot explain.
- Contain hallucinated APIs, imports, or library calls (functions that don't exist, signatures that don't match upstream, dependencies not in the lockfile).
- Add features nobody asked for "while we were in there."
- Refactor code outside the scope of the bug or feature in the title.

## Before you open the PR

1. Open an issue first if the change is non-trivial (>50 lines or new dependency).
2. Run the local test suite. If the project has a `make test` or equivalent, it must pass.
3. If you added a feature, add a test. If you fixed a bug, add a regression test.
4. Keep the diff small. One logical change per PR.
5. Reference the issue you're closing (`Closes #N`) in the PR description.

## What we'll do

- Maintainers triage within 7 days.
- Reviews use both human review and our automated `/ultrareview` toolkit. Automated review is **a signal, not a decision** -- a green automated review does not mean merge.
- If we ask for changes and don't hear back in 30 days, we'll close the PR. You can always reopen.

## Conduct

Be kind, be specific, and assume good faith from the other party. We extend the same.
