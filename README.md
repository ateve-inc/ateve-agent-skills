# Ateve Agent Skills

Official agent skills for the [Ateve Search API](https://ateve.ai/). Give your coding agent direct web search through HTTP, with source URLs, snippets, date and domain filters, and pagination.

| Skill | Entry point | Integration |
| --- | --- | --- |
| `ateve-search-api` | [SKILL.md](skills/ateve-search-api/SKILL.md) | `POST https://api.ateve.ai/v1/search` |

## Install

Requires Node.js 22.20.0 or later. Install the skill in your current project:

```bash
npx ateve-agent-skills@0.1.0 --agent codex
```

For Claude Code or Cursor:

```bash
npx ateve-agent-skills@0.1.0 --agent claude-code
npx ateve-agent-skills@0.1.0 --agent cursor
```

Add `--global` to install for your user account instead of the current project. Add `--yes` to accept the installer's prompts. Without `--agent`, the installer lets you select the target agents.

The [npm package](https://www.npmjs.com/package/ateve-agent-skills) bundles the Skill and installs that version using the [Skills CLI](https://github.com/vercel-labs/skills). It does not need access to the GitHub repository. Follow your agent's instructions to reload or discover newly installed skills.

### Install from source

If you have access to this repository, you can install directly from GitHub:

```bash
npx skills add ateve-inc/ateve-agent-skills --skill ateve-search-api --agent codex
```

Or copy `skills/ateve-search-api/` to your agent's supported skill directory. The repository requires access while it remains private; use the public npm package when you do not have repository access.

## Set up and use

Set `ATEVE_API_KEY` in the environment used by your agent's shell or HTTP tool. Obtain a key from your Ateve account. Do not paste the key into a chat, commit, or Skill file.

Check that the environment variable is set without printing it:

```bash
: "${ATEVE_API_KEY:?Set ATEVE_API_KEY before calling Ateve Search}"
```

Then ask your agent, for example:

> Use ateve-search-api to find this week's Apple announcements on apple.com. Cite the source URLs.

The Skill explains the HTTP request and response; your agent executes the request. It needs a shell with cURL or an HTTP tool with access to the key. Installing the Skill does not create an account or configure an API key.

## Search contract

| Parameter | Supported by this Skill |
| --- | --- |
| `query` | Required; 1–2000 characters. |
| `limit` | 1–50; default 10. |
| `offset` | 0–99; default 0. Pagination covers at most the first 100 results. |
| `date_range` | Presets (`day`, `week`, `month`, `year`), a date, or an open/closed date range. |
| `include_domains` | Up to 300 host names. |
| `exclude_domains` | Up to 300 host names. |

Requests use the API's default content settings. The response remains the original JSON, including snippets, source URLs, and the `images` array when returned. Images may be empty. For full pages, your agent can fetch selected result URLs with a separate page-fetch tool.

The [Skill](skills/ateve-search-api/SKILL.md) includes request examples, response fields, and error handling. A timeout may happen after a billable search has executed; retries remain the caller's decision.

## Related integrations

- [Ateve SDKs](https://github.com/ateve-inc/ateve-sdks): Java, JavaScript/TypeScript, and Python API clients.
- An Ateve MCP connection is a separate integration. This Skill works through direct HTTP and does not install or start an MCP server.

## Development and release

```bash
npm ci
npm test
npm pack --dry-run
```

After the first npm publication, configure the package's trusted publisher for this repository and `.github/workflows/release.yml`. Subsequent releases use version tags, with a package version matching the tag. The [release workflow](.github/workflows/release.yml) publishes with OIDC; provenance also requires a public repository. Initial publication requires an authorized npm account; GitHub publication does not automatically create an npm package.

See [CHANGELOG.md](CHANGELOG.md) for release notes. Licensed under [Apache-2.0](LICENSE).
