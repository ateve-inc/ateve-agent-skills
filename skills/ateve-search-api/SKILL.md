---
name: ateve-search-api
description: Call the Ateve Search API directly with cURL or raw HTTP. Use when an agent needs web search through the API, including search snippets, source URLs, date and domain filters, or pagination.
---

# Ateve Search API

Use `POST https://api.ateve.ai/v1/search` for direct web search. Every request needs an Ateve API key in the `Authorization` header:

```text
Authorization: Bearer $ATEVE_API_KEY
```

This skill covers search queries, pagination, and date and domain filters. Omit content controls and use the API's default result fields. The API response remains JSON; no MCP connection is required.

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

The API key starts with `sk_`. Store it in the environment or an approved secret store. If a local file is used for shell configuration, set `mode 600`, keep it out of version control, and check permissions without printing the file contents. Never place a real API key in this file, a script, a commit, or a prompt.

## Request parameters

Only `query` is required. Omit optional fields when their defaults are sufficient.

### Top-level fields

| Field | Type | Required | Default | Contract |
| --- | --- | --- | --- | --- |
| `query` | string | Yes | — | 1–2000 characters. Use a self-contained natural-language query. |
| `limit` | integer | No | `10` | 1–50 results. |
| `offset` | integer | No | `0` | 0–99. Use with `limit` for pagination; only the first 100 results can be paged through. |
| `date_range` | string | No | — | Freshness filter; see below. |
| `include_domains` | string[] | No | — | Restrict results to these domains; at most 300 entries. |
| `exclude_domains` | string[] | No | — | Exclude results from these domains; at most 300 entries. |

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

### Domain filters

Use arrays of host names:

```json
{
  "include_domains": ["openai.com", "anthropic.com"],
  "exclude_domains": ["pinterest.com"]
}
```

Use host names rather than URLs or `site:` expressions, and use at most 300 entries in each array. Do not assume that a `site:` expression embedded in `query` is interpreted as a domain filter.

## Examples

Use the minimal request in Quick start for ordinary searches. The following examples are scenario-specific; add their filters only when the user asks for them.

### Search recent news from specified sources

Use this pattern only when the user requests recent results limited to the specified sources.

```bash
curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI regulation updates",
    "limit": 5,
    "date_range": "month",
    "include_domains": ["reuters.com", "bbc.com"]
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

The API caps the effective `limit` at `100 - offset`. For example, `limit: 10` with `offset: 95` can return at most 5 results. Stop at offset 100 or when no more results are returned. `total_estimated_matches` is an estimate, not permission to page past this limit; it can be `null` or absent.

## Response

The success body is JSON. `id` is also returned in the `X-Request-Id` response header. Keep that ID when reporting a failure.

### Top-level fields

| Field | Meaning |
| --- | --- |
| `id` | Unique request ID; matches `X-Request-Id`. |
| `created` | Unix epoch seconds in UTC. |
| `latency_ms` | Server-side processing time. |
| `query.original` | Original query text. |
| `results` | Ranked result objects. |
| `total_estimated_matches` | Estimated match count; may be `null` or absent. |
| `usage` | Credits and breakdown when billing data is available; absent otherwise. |

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
| `snippet` | Short excerpt returned with the default search results, when available. |
| `favicon` | Favicon URL when available. |
| `images` | Always an array, possibly empty. Image objects have `url`, `width`, `height`, and `alt`; the latter three can be `null`. |
| `is_safe` | Safety classifier result; always present. |

Preserve the API's JSON response, including any additional fields. An empty `images` array is valid; do not promise that each result contains images. Use titles, URLs, and snippets to decide which sources matter. If the task needs a full page, use an available page-fetch tool on selected URLs rather than adding content controls to this search request.

When answering the user, cite the returned source URLs and distinguish the result snippets from pages actually fetched. An empty result set means this search returned no matches, not that the subject does not exist.

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

Do not copy the raw error body into the model context. Extract the status, safe error code, parameter name, and request ID. Error responses:

| Status | Meaning | Action |
| --- | --- | --- |
| `400` | Invalid or missing request field | Fix the request; do not retry unchanged. |
| `401` | Missing, malformed, or invalid Bearer key | Check `ATEVE_API_KEY` without printing it. |
| `402` | Insufficient credit | Check account balance and the returned error code. |
| `403` | Team access is suspended or payment review is required | Check the returned error code and account status. |
| `404` | Unknown route | Check the exact `/v1/search` path. |
| `405` | Method not allowed | Use `POST`. |
| `415` | Missing or wrong content type | Send `Content-Type: application/json`. |
| `429` | Rate limit exceeded | Slow down and retry later according to the account policy. |
| `500` | Internal server error | Retry only as part of a bounded retry policy. |
| `502` | Upstream search service unavailable | Retry only as part of a bounded retry policy. |
| `504` | Upstream search service timeout | Retry only as part of a bounded retry policy. |

A timeout can occur after a billable search has already executed. Do not retry automatically. Let the caller decide whether to retry within its request budget and deadline; do not retry an unchanged invalid request or an authentication, credit, or access failure.

## Direct API versus MCP

Use this skill for direct HTTP access to `POST /v1/search` and the API's JSON response. For an MCP connection, use `ateve_web_search` and its current tool schema. The two integrations do not have to expose identical parameter sets.
