# Commit Message Generation Instructions

- Use conventional commit format: type(scope): description
- Use imperative mood: 'Add feature' not 'Added feature'
- Keep subject line under 50 characters
- Use types:
  - **feat**: for new features
  - **fix**: for bug fixes
  - **docs**: for documentation changes
  - **style**: for formatting, missing semi colons, etc; no code change
  - **refactor**: for code changes that neither fixes a bug nor adds a feature
  - **perf**: for performance improvements
  - **test**: for adding or updating tests
  - **chore**: for changes to the build process or auxiliary tools
  - **ci**: for CI/CD configuration changes
- Always use the commit type that matches the kind of change you are making. For example, do **not** use `feat` for documentation changes—use `docs` instead.
- Include scope when relevant (e.g., api, ui, auth)
- Reference issue numbers with # prefix
