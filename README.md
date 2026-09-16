# @ateve/agent-skills

The official [Ateve](https://ateve.ai/) npm package for installing the `ateve-search-api` skill in coding agents such as Codex, Claude Code, and Cursor.

The package currently includes one skill: instructions and examples for searching the web with the Ateve Search API. Your agent reads the skill and makes HTTP requests using its shell or HTTP tool. Search results provide source URLs and, when available, snippets and other metadata that the agent can use in its answer.

## Install

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

API requests require a valid key and sufficient account credits. Skill installation and API key configuration are separate steps; running a search uses your Ateve account.

## Use the skill

After installation and API key setup, ask your agent:

> Use the ateve-search-api skill to find recent Apple announcements. Set include_domains to ["apple.com"] and date_range to "week", and cite the source URLs.

The skill documents requests to `POST https://api.ateve.ai/v1/search`, including:

- Search queries and result-count control using `query` and `maxResults`.
- Date filtering using `date_range`.
- Domain filtering using `include_domains` and `exclude_domains`.
- Reading JSON results, citing sources, and handling API errors.

Open the installed `ateve-search-api/SKILL.md` for request examples, parameter limits, response fields, and error handling. The same file is included at `skills/ateve-search-api/SKILL.md` in the npm package.

The agent needs a shell with cURL or an HTTP tool to execute the requests. A timeout may occur after a billable search has executed, so retries need to take account of your request budget.

## Related integrations

For application code, the [Ateve JavaScript/TypeScript SDK](https://www.npmjs.com/package/ateve) provides an API client. For an MCP client, configure the Ateve MCP integration separately. This package supplies the skill and its installer; API requests are executed by your agent's tools.

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0).
