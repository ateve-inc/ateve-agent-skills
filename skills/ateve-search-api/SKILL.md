---
name: ateve-search-api
description: Call the Ateve Search API directly with cURL or raw HTTP when an MCP connection is unavailable. Use for web search with configurable result content, freshness, topic, domain, locale, safety, pagination, and source metadata; use the Ateve MCP tool when it is installed.
---

# Ateve Search API

Use `POST https://api.ateve.ai/v1/search` for direct web search. Every request needs an Ateve API key in the `Authorization` header:

```text
Authorization: Bearer $ATEVE_API_KEY
```

The contract in this skill is synchronized with the current Ateve Search API implementation and its `API.md`. The current Ateve MCP exposes only `query` and `max_results` and returns `Title`, `URL`, `Published`, and `Snippet` in flat text. Direct API calls expose the fuller request and response contract documented below.

## Quick start

Check that the key exists without printing its value. Keep shell tracing off. Do not use `curl -v`, `--trace`, or a command that puts the key in a URL.

```bash
: "${ATEVE_API_KEY:?Set ATEVE_API_KEY before calling Ateve Search}"

curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest developments in LLM agents",
    "limit": 3
  }'
```

For a connectivity check that discards the response body and prints only the HTTP status:

```bash
: "${ATEVE_API_KEY:?Set ATEVE_API_KEY before calling Ateve Search}"

curl -sS --max-time 60 -o /dev/null -w '%{http_code}\n' \
  -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"connectivity check","limit":1}'
```

HTTP `000` means that cURL received no HTTP response. Check the cURL exit code, network, TLS, and the configured endpoint. It is not an Ateve status code.

When an agent runs cURL, parse the response locally and pass only the fields needed for the task into the model. Do not paste an unredacted response or upstream error body into the conversation. In particular, do not expose API keys that appear in an unexpected upstream field.

## Request endpoint and authentication

```text
POST https://api.ateve.ai/v1/search
Content-Type: application/json
Authorization: Bearer $ATEVE_API_KEY
```

The API key starts with `sk_`. Store it in the environment or an approved secret store. If a local file is used for shell configuration, set `mode 600`, keep it out of version control, and check permissions without printing the file contents.

## Request parameters

Only `query` is required. Omit optional fields when their defaults are sufficient.

### Top-level fields

| Field | Type | Required | Default | Contract |
| --- | --- | --- | --- | --- |
| `query` | string | Yes | — | 1–2000 characters. Use a self-contained natural-language query. |
| `content` | object | No | — | Controls per-result content fields. |
| `limit` | integer | No | `10` | 1–50 results. |
| `offset` | integer | No | `0` | 0–1000. Use with `limit` for pagination. |
| `date_range` | string | No | — | Freshness filter; see below. |
| `topic` | enum | No | `general` | Category hint; see below. |
| `include_domains` | string[] | No | — | Up to 300 domains. Restricts results. |
| `exclude_domains` | string[] | No | — | Up to 300 domains. Excludes results. |
| `locale` | object | No | — | Market, language, and user-location hints. |
| `safe_search` | boolean | No | `true` | Filters explicit or unsafe content. Set `false` only when requested. |

### Date range

`date_range` is one string. Supported forms:

| Form | Meaning |
| --- | --- |
| `day`, `week`, `month`, `year` | Preset window ending at the request time (UTC). |
| `YYYY-MM-DD` | One UTC calendar day. |
| `YYYY-MM-DD..YYYY-MM-DD` | Closed range; end must be on or after start. |
| `YYYY-MM-DD..` | From start date through today (UTC). |
| `..YYYY-MM-DD` | Up to the end date. |

Dates must be real calendar dates. `2026-02-31`, `2026-99-99`, `all`, and `last-week` are invalid. Omit the field when no time filter is needed. For a request such as “last month,” calculate the exact date window before sending the call when a fixed date range is required.

### Topic

Allowed values:

```text
general | news | paper | docs | code | forum | wiki | people | company |
personal_site | financial_report | government | ecommerce
```

Use `general` when there is no category bias. Use `news` for news, `paper` for academic papers, `docs` for product or API documentation, `code` for repositories/issues/PRs, `forum` for community discussions, `wiki` for encyclopedia pages, `people` for profiles, `company` for organizations, `personal_site` for personal sites, `financial_report` for filings and annual reports, `government` for government sources, and `ecommerce` for shopping pages.

### Domain filters

Use arrays of host names:

```json
{
  "include_domains": ["openai.com", "anthropic.com"],
  "exclude_domains": ["pinterest.com"]
}
```

Each array accepts at most 300 entries. Invalid domains and oversized arrays return a validation error.

### Locale

All locale fields are optional:

```json
{
  "locale": {
    "mkt": "US",
    "language": "en",
    "user_location": {
      "country": "US",
      "region": "California",
      "city": "San Francisco",
      "timezone": "America/Los_Angeles"
    }
  }
}
```

| Field | Constraint | Meaning |
| --- | --- | --- |
| `mkt` | Uppercase ISO 3166-1 alpha-2, such as `US` or `JP` | Search-market ranking hint. |
| `language` | Lowercase ISO 639-1, such as `en` or `ja` | Preferred content language. |
| `user_location.country` | Uppercase ISO 3166-1 alpha-2 | Physical country of the user. |
| `user_location.region` | Free text | Region or state. |
| `user_location.city` | Free text | City. |
| `user_location.timezone` | IANA time-zone ID | For example, `America/Los_Angeles`; short IDs such as `PST` are rejected. |

`mkt` and `user_location.country` describe different things. A user in Japan can search the US market.

### Content options

Content options apply to every item in `results`:

| Field | Type | Default | Effect |
| --- | --- | --- | --- |
| `content.snippet` | boolean | `true` | Include a short excerpt. `false` omits `snippet`. |
| `content.raw_content` | boolean | `false` | Include the extracted page body when `true`. |
| `content.format` | enum | `text` | `text` strips Markdown; `markdown` preserves Markdown. Applies to `snippet` and `raw_content`. |
| `content.summary` | boolean | `false` | Include per-result `summary`; the value can be `null`. |
| `content.images` | integer | `3` | 0–10 images per result. `0` returns an empty array. |
| `content.favicon` | boolean | `true` | Include a favicon URL; `false` omits it. |

Request only the content needed by the task. `raw_content`, `summary`, and images can increase response size and processing time.

## Examples

### Fresh news with a snippet

```bash
curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI regulation updates",
    "limit": 5,
    "date_range": "month",
    "topic": "news",
    "include_domains": ["reuters.com", "bbc.com"],
    "content": {"snippet": true, "raw_content": false, "images": 0}
  }'
```

### Full direct API request

```bash
curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Ateve Search API integration guide",
    "content": {
      "snippet": true,
      "raw_content": true,
      "format": "markdown",
      "summary": true,
      "images": 2,
      "favicon": true
    },
    "limit": 3,
    "offset": 0,
    "date_range": "year",
    "topic": "docs",
    "include_domains": ["ateve.ai"],
    "locale": {
      "mkt": "US",
      "language": "en",
      "user_location": {
        "country": "US",
        "timezone": "America/Los_Angeles"
      }
    },
    "safe_search": true
  }'
```

### Pagination

```json
{
  "query": "python web frameworks",
  "limit": 10,
  "offset": 10
}
```

Use `total_estimated_matches` when it is present. It can be `null` or absent when the provider has no estimate.

## Response

The success body is JSON. `id` is also returned in the `X-Request-Id` response header. Keep that ID when reporting a failure.

### Top-level fields

| Field | Meaning |
| --- | --- |
| `id` | Unique request ID; matches `X-Request-Id`. |
| `created` | Unix epoch seconds in UTC. |
| `latency_ms` | Server-side processing time. |
| `query.original` | Original query text. `query.effective` and `query.autoTuned` may be present. |
| `results` | Ranked result objects. |
| `news`, `images`, `videos` | Additional result groups when returned by the selected provider path. |
| `total_estimated_matches` | Estimated match count; may be `null` or absent. |
| `usage` | Credits and breakdown when billing data is available; absent otherwise. |
| `answer` | Answer content and citations when the response path returns an answer. |

### Result fields

| Field | Meaning |
| --- | --- |
| `id` | Position anchor such as `results.#0`; stable only within this response. |
| `title` | Page title. |
| `url` | Canonical result URL. |
| `display_url` | Display-safe URL with tracking/query parameters removed. |
| `site_name` | Site or publisher name. |
| `language` | Detected ISO 639-1 page language. |
| `published_at` | ISO 8601 UTC timestamp or `null`; the field is always present. |
| `score` | Relative ranking signal within this response. Do not treat it as an absolute quality score. |
| `snippet` | Short excerpt when `content.snippet` is enabled. |
| `raw_content` | Full extracted page body when requested. |
| `summary` | Present when requested; can be `null`. |
| `favicon` | Favicon URL when enabled. |
| `images` | Always an array, possibly empty. Image objects have `url`, `width`, `height`, and `alt`; the latter three can be `null`. |
| `is_safe` | Safety classifier result; always present. |

`snippet` and `raw_content` follow `content.format`. Direct API callers can request `raw_content`, `summary`, images, or favicon independently. The Ateve MCP keeps its model-facing output to the `Snippet` field.

## Error handling

Non-2xx responses use a JSON envelope like this:

```json
{
  "id": "req_...",
  "error": {
    "code": "invalid_parameter",
    "message": "...",
    "param": "date_range",
    "type": "invalid_request_error"
  }
}
```

Do not copy the raw error body into the model context. Extract the status, safe error code, parameter name, and request ID. Current documented statuses:

| Status | Meaning | Action |
| --- | --- | --- |
| `400` | Invalid or missing request field | Fix the request; do not retry unchanged. |
| `401` | Missing, malformed, or invalid Bearer key | Check `ATEVE_API_KEY` without printing it. |
| `402` | Not a current `/v1/search` status in the API contract | Do not invent handling; verify the deployed contract if encountered. |
| `403` | Insufficient prepay credit or postpay credit limit | Check account balance or plan. |
| `404` | Unknown route | Check the exact `/v1/search` path. |
| `405` | Method not allowed | Use `POST`. |
| `415` | Missing or wrong content type | Send `Content-Type: application/json`. |
| `429` | Rate limit exceeded | Slow down and retry later according to the account policy. |
| `500` | Internal server error | Retry only as part of a bounded retry policy. |
| `502` | Upstream search service unavailable | Retry only as part of a bounded retry policy. |
| `504` | Upstream search service timeout | Retry only as part of a bounded retry policy. |

For a client-side retry wrapper, retry only temporary `500`, `502`, `503` (if emitted by a deployment), and `504` responses, at most two additional attempts with approximately 1 second and 2 seconds of backoff. Share one 60-second deadline across the request and retries. Do not automatically retry `400`, `401`, `402`, `403`, or `429`.

## Direct API versus MCP

```text
Direct API Skill                         Ateve MCP
POST /v1/search                          ateve_web_search
Full request contract                    query + max_results only
Optional content controls                Snippet-only model-facing output
Raw JSON response                        Flat text: Title / URL / Published / Snippet
Caller owns parsing, retry, and redaction MCP owns mapping, timeout, and redaction
```

Use this skill when the caller needs fields or filters that the MCP tool does not expose. Use MCP for the stable agent-facing search interface and its flat response format.

## Current integration status

The request and response names in this skill have been checked against the current Ateve Search API source and API documentation, including `query`, `limit`, `offset`, `date_range`, `topic`, domain filters, locale, content options, `safe_search`, `snippet`, `raw_content`, images, safety flags, usage, answer, and request IDs. This guide exposes `snippet` as the only result excerpt field. A real-account end-to-end call has not been run in this worktree. Never place a real API key in this file, a script, a commit, or a prompt.
