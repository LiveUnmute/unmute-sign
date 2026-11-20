# Claude Code skills

`.claude/plugins/founder/` is a vendored copy of
[emotixco/claude-skills-founder](https://github.com/emotixco/claude-skills-founder)
(MIT, v2.1.7) — 13 founder skills and their slash commands.

It is here so the tooling travels with the repo and is pinned to a version,
rather than each person installing whatever is current.

## Activating it in Claude Code

```
/plugin marketplace add .claude/plugins/founder
/plugin install founder@emotix
```

The first command reads `.claude-plugin/marketplace.json` in that folder; the
second installs the `founder` plugin from the `emotix` marketplace.

## What it provides

| Skill | What it produces |
|---|---|
| `validate-idea` | Pressure-tests an idea before anything is built |
| `product-brief` | One-page brief: problem, user, scope |
| `mvp-scope` | Feature triage into must / should / won't |
| `persona-gen` | Target user personas |
| `competitor-matrix` | Competitor comparison |
| `pricing-strategy` | Pricing model and tiers |
| `go-to-market` | Launch plan |
| `pitch-deck` | Deck structure and copy |
| `fundraise-prep` | Raise narrative and numbers |
| `landing-page` | Page copy |
| `email-sequence` | Onboarding / outreach sequence |
| `metrics-dashboard` | Which numbers to track |
| `user-interviews` | Interview script and synthesis |

Outputs are written to `founder/` at the repository root, which is how the
skills chain: later ones read what earlier ones saved.

## Note

These are written for Claude Code and rely on `${CLAUDE_PLUGIN_ROOT}` and the
`/plugin` system. They do not run in other agent environments, including this
one — the copy is here for whoever opens the repo in Claude Code.
