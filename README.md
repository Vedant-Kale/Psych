# PSYCH

An immersive 3D narrative portfolio of Vedant Kale — One Night in Melbourne, the Mind Palace, and The Order: an AI bartender that only says what the work can prove.

**Status:** planning done, building in the open. Track progress in [Issues](../../issues) and [Pull requests](../../pulls).

## Docs

| File | What it holds |
|---|---|
| [Context](md-files/Context.md) | Why the project exists; decision log. Read first |
| [Design](md-files/Design.md) | The experience and page map |
| [Architecture](md-files/Architecture.md) | How the system fits together |
| [Technology](md-files/Technology.md) | The stack and why |
| [Research](md-files/Research.md) | Evidence behind decisions |
| [Plan](md-files/Plan.md) | Roadmap M0–M8 and task detail |
| [Workflow](md-files/Workflow.md) | How changes move from idea to production |

## Layout

```
app/          Next.js routes (static export)
components/   UI components
content/      MDX/YAML content — the only source of site content
lib/          schemas, loaders, shared logic
scripts/      build-time generators and checks
worker/       Cloudflare Worker for /api/* (The Order)
e2e/          Playwright + axe tests
evals/        The Order eval cases
spikes/       throwaway experiments, never imported
public/       static assets
md-files/     project docs
reports/, research_notes/, docs/   research history
```

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).
