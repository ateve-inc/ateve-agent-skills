# @ateve/agent-skills

The official [Ateve](https://ateve.ai/) npm package for installing the `ateve-search-api` skill in coding agents such as Codex, Claude Code, and Cursor.

The package includes one skill with instructions for web, image, and video search, Fetch, and Jev decisions through the Ateve API. Your agent reads the skill and makes HTTP requests using its shell or HTTP tool.

## Install

For an agent-readable setup workflow, see the [installation guide](install/agent-skills.md). It covers agent selection, installation scope, API key configuration, and verification using this package.

Requires Node.js 22.20.0 or later and npm. Run one of these commands in your project:

### Codex

```bash
npx @ateve/agent-skills@latest --agent codex
```

### Claude Code

```bash
npx @ateve/agent-skills@latest --agent claude-code
```

### Cursor

```bash
npx @ateve/agent-skills@latest --agent cursor
```

By default, the skill is installed in the current project. Add `--global` to install in the selected agent's user-level skill directory, or `--yes` to accept the skill installer's prompts. Follow your agent's instructions to discover or reload the installed skill.

The installer uses the skill files included in the selected npm package version and delegates installation to its [Skills CLI](https://github.com/vercel-labs/skills) dependency. To select a specific release, replace `@latest` with its version, for example `@0.1.1`.

## Configure your API key

Obtain an API key from your [Ateve account](https://ateve.ai/) and make it available as `ATEVE_API_KEY` in the environment used by your agent's shell or HTTP tool. Keep the key out of chats, source files, and version control.

In a POSIX-compatible shell, check that the variable is set without printing its value:

```bash
: "${ATEVE_API_KEY:?Set ATEVE_API_KEY before calling Ateve Search}"
```

API requests require a valid key and access to the selected product. Images and Videos are PAYG at USD 0.008 per successful request. Fetch has a daily plan allowance and USD 0.001 PAYG beyond plan benefits. Skill installation and API key configuration are separate steps.

## Use the skill

After installation and API key setup, ask your agent:

> Use the ateve-search-api skill to find recent Apple announcements. Set include_domains to ["apple.com"] and date_range to "week", and cite the source URLs.

The skill documents requests to `POST https://api.ateve.ai/v1/search`, including:

- Search queries and result-count control using `query` and `max_results`.
- Date filtering using `date_range`.
- Domain filtering using `include_domains` and `exclude_domains`.
- Optional matching excerpts using `content.highlights` and the returned `highlights` array.
- Always-present snippets that cannot be disabled, including when highlights are enabled.
- Prioritizing highlights for token-efficient workflows and using snippets when more context is needed; actual savings depend on what is passed to the model.
- Reading JSON results, citing sources, and handling API errors.

It also documents `POST /v1/images` and `POST /v1/videos`. These endpoints accept `query` and optional `max_results` (1–10), return image or video source URLs and optional media metadata, and have separate Team access rules. For example, ask the agent to find lighthouse images and cite their source pages, or find lighthouse videos and cite their viewing pages.

For a known page, ask the agent to call `POST /v1/fetch` with its URL and inspect the title and Markdown content. For a structured decision, ask it to call `GET /v1/models` and `POST /v1/systemone` with state and choice, score, or noul questions. The installed skill includes request examples and the published Fetch allowance.

Open the installed `ateve-search-api/SKILL.md` for request examples, parameter limits, response fields, and error handling. The same file is included at `skills/ateve-search-api/SKILL.md` in the npm package.

The agent needs a shell with cURL or an HTTP tool to execute the requests. A timeout may occur after a billable search has executed, so retries need to take account of your request budget.

## Related integrations

For application code, the [Ateve JavaScript/TypeScript SDK](https://www.npmjs.com/package/ateve) provides an API client. For an MCP client, configure the Ateve MCP integration separately. This package supplies the skill and its installer; API requests are executed by your agent's tools.

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0).
