# Website integration

`agent-skills.md` is the source for the public installation guide at:

```text
https://ateve.ai/install/agent-skills.md
```

Publish that file through the `web-open` website's static asset directory at `/install/agent-skills.md`. For a site that serves a `public/` directory from its origin root, the destination is `public/install/agent-skills.md`. Confirm the website's actual asset routing before choosing this path.

Serve the Markdown without a login requirement, an HTML wrapper, or a single-page application fallback. Use a text content type such as `text/markdown; charset=utf-8` or `text/plain; charset=utf-8`.

Once the endpoint is deployed and verified, use this copyable prompt in the website and Agent Skills documentation:

```text
Read https://ateve.ai/install/agent-skills.md and follow the instructions to install the Ateve skill for my agent.
```

## Acceptance checks

- A GET request to `/install/agent-skills.md` returns HTTP 200 and the actual guide, starting with `# Install the Ateve agent skill`.
- The response is readable Markdown, not a login page, application shell, or error page.
- The copyable prompt references the exact path `agent-skills.md` (not `agents-skills.md`).
- In a clean project, the documented command installs `ateve-search-api/SKILL.md` for the selected agent. Repeated setup preserves any local edits by inspecting an existing installation first.
- Without an API key, the agent reports installation status separately from API configuration and skips the live search.
- With a configured key and a requested live check, the agent performs at most one verification search and reports the actual result.

If the documentation page changes, regenerate its derived Markdown and `llms.txt` / `llms-full.txt` using the documentation project's existing build process. Do not edit those generated files independently.

Adding this source file to the skill repository or publishing the npm package does not deploy the website endpoint.
