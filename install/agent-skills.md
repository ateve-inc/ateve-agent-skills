# Install the Ateve agent skill

Use this guide when the user asks to install the Ateve skill. The official [@ateve/agent-skills package](https://github.com/ateve-inc/ateve-agent-skills) installs `ateve-search-api`, which teaches the agent to call the Ateve Search API using its shell or HTTP tool. It does not install an MCP server or run a background service.

## 1. Choose the agent and installation scope

Identify the current or requested agent and target project. Install at project level by default. Add `--global` only when the user requests the selected agent's user-level installation.

Check the agent's recognized skill directories, including symlink targets, for an existing `ateve-search-api` installation. If it already satisfies the request, skip installation. Otherwise, compare and back it up, and resolve local modifications before replacing it. The installer can replace the entire skill directory and may skip prompts when it detects an agent, even without `--yes`.

If you cannot access the filesystem or run commands, provide the appropriate command without claiming installation succeeded.

## 2. Install the skill

Requires Node.js **22.20.0 or later** and npm. Check `node --version` and `npm --version`; report missing or unsupported prerequisites before proceeding.

From the target project directory, run **one** command for the selected agent after completing the existing-installation check above:

| Agent | Command |
| --- | --- |
| Codex | `npx --yes @ateve/agent-skills@latest --agent codex --yes` |
| Claude Code | `npx --yes @ateve/agent-skills@latest --agent claude-code --yes` |
| Cursor | `npx --yes @ateve/agent-skills@latest --agent cursor --yes` |

For another agent, check the installer's supported targets rather than guessing. Check the exit status and the actual `ateve-search-api/SKILL.md` at the final installed location. Reload the agent's skills or start a new session if required.

## 3. Configure an API key

Obtain a key through the user's [Ateve account](https://ateve.ai/) and provide it as `ATEVE_API_KEY` in the environment used by the agent's shell or HTTP tool. Keep the key out of chats, skill files, source control, and logs. Keep shell tracing disabled.

Check that the variable is set without printing its value:

```sh
: "${ATEVE_API_KEY:?Set ATEVE_API_KEY in the agent execution environment}"
```

Without a key, finish verifying the installed files and report **skill installed; API key configuration pending**. API access also requires sufficient account credits.

## 4. Verify the installation

Confirm the installed file has the frontmatter name `ateve-search-api` and is in a location recognized by the selected agent. Distinguish files installed from skill loaded.

When a key is configured and a live search is within the user's request, use the installed skill to make one verification request with `query: "Ateve search API"` and `maxResults: 1`. It may consume account credits. Verify a 2xx response with a JSON `results` array; an empty array is valid. Follow the skill's error handling, and do not automatically retry a timeout because the search may already have been billed.

Report the selected agent, installation scope and location, and whether skill loading, API configuration, and the live check succeeded or remain pending. Do not expose credentials or raw response bodies.
