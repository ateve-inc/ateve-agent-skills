# Ateve Agent Skills

Official agent skills for the [Ateve Search API](https://ateve.ai/). Give your coding agent direct web search through HTTP, with source URLs, snippets, date and domain filters, and pagination.

| Skill | Entry point | Integration |
| --- | --- | --- |
| `ateve-search-api` | [SKILL.md](skills/ateve-search-api/SKILL.md) | `POST https://api.ateve.ai/v1/search` |

## Install

Requires Node.js 22.20.0 or later. Install the skill in your current project:

```bash
npx skills add ateve-inc/ateve-agent-skills --skill ateve-search-api --agent codex
```

For Claude Code or Cursor:

```bash
npx skills add ateve-inc/ateve-agent-skills --skill ateve-search-api --agent claude-code
npx skills add ateve-inc/ateve-agent-skills --skill ateve-search-api --agent cursor
```

Add `--global` to install for your user account instead of the current project. Add `--yes` to accept the installer's prompts. Without `--agent`, the installer lets you select the target agents.

These commands use the [Skills CLI](https://github.com/vercel-labs/skills). Or copy `skills/ateve-search-api/` to your agent's supported skill directory. Follow your agent's instructions to reload or discover newly installed skills.

### npm package

The `ateve-agent-skills` package is prepared for its first npm release. Until it is published, use the GitHub installation commands above. After publication, the equivalent versioned command will be:

```bash
npx ateve-agent-skills@0.1.0 --agent codex
```

The package bundles the Skill and installs that version using the same installer. The `--agent`, `--global`, and `--yes` options work as above.

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

Releases use version tags (`v0.1.0`, for example). The [release workflow](.github/workflows/release.yml) publishes to npm with OIDC and provenance after the package's trusted publisher has been configured for this repository. The package version must match the tag. Initial publication requires an authorized npm account; GitHub publication does not automatically create an npm package.

See [CHANGELOG.md](CHANGELOG.md) for release notes. Licensed under [Apache-2.0](LICENSE).
