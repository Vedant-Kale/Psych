# Contributing

Every change follows [md-files/Workflow.md](md-files/Workflow.md): issue → branch → failing test → commits → PR → green CI → review → squash merge → auto deploy.

- Branches: `<type>/<issue#>-<slug>` (types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `ci`)
- Commits: [Conventional Commits](https://www.conventionalcommits.org)
- PRs: use the template; body must include `Closes #<issue>`
- Never commit secrets, `.env` files or likeness originals
