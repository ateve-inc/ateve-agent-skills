# Ateve Search API Skill

This repository contains the direct API Skill for Ateve Search.

Install it with:

```bash
npx skills add ateve-inc/ateve-agent-skills --skill ateve-search-api
```

The Skill documents `POST https://api.ateve.ai/v1/search` with `query` and `limit`. Set `ATEVE_API_KEY` in the agent execution environment. The Skill does not install or start an MCP server.
