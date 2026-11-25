---
name: ateve-search-api
description: Call the Ateve Search API directly with cURL or raw HTTP. Use when an agent needs web search through the API, including search snippets, highlights, source URLs, date and domain filters, or result-count control.
---

# Ateve Search API

Use `POST https://api.ateve.ai/v1/search` for direct web search. Every request needs an Ateve API key in the `Authorization` header:

```text
Authorization: Bearer $ATEVE_API_KEY
```

This skill covers web, image, and video search through the API. The API response remains JSON; no MCP connection is required.

## Image and video search

Use `POST https://api.ateve.ai/v1/images` when the user asks for pictures, photographs, or illustrations. Use `POST https://api.ateve.ai/v1/videos` for videos, tutorials, or demonstrations. When both are needed, call both endpoints separately. These endpoints currently require the caller's Team to be on the media-search allowlist. Successful media requests are free during the allowlist phase.

Both endpoints require `query` (nonblank string, at most 1,000 characters). Optional `max_results` is an integer from 1 to 10; omission defaults to 10. Use the same Bearer API key as web search. Do not send web-search fields or provider-only filters to these endpoints.

```sh
curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/images" \
  -H "Authorization: Bearer $ATEVE_API_KEY" -H "Content-Type: application/json" \
  -d '{"query":"James Webb Space Telescope photos","max_results":5}'
```

For images, `results[].url` is the image file; `host_page_url` is the source page; `alt` is alternative text when present. For videos, `results[].url` is the watch page and `embedding_url` is an optional player URL. `site_name`, `description`, `summary`, and `duration_seconds` may be absent. Both responses include `id`, `created`, `latency_ms`, `query.original`, and `results`; an empty `results` array is a successful search with no matches. Do not invent missing metadata or imply a source page has been read just because a media result was returned.

If the user asks for an unpublished filter, explain that the endpoint currently supports only `query` and `max_results`. Search words may express the preference, but that does not guarantee filtering. A 403 `team_not_allowed` means the Team needs media allowlist access. Do not automatically retry a timeout.

## Quick start

Check that the key exists without printing its value. Keep shell tracing off. Do not use `curl -v`, `--trace`, or a command that puts the key in a URL.

```bash
: "${ATEVE_API_KEY:?Set ATEVE_API_KEY before calling Ateve Search}"

curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest developments in LLM agents",
    "maxResults": 3
  }'
```

To send a minimal live search request and print only its HTTP status (this request may consume account credits):

```bash
: "${ATEVE_API_KEY:?Set ATEVE_API_KEY before calling Ateve Search}"

curl -sS --max-time 60 -o /dev/null -w '%{http_code}\n' \
  -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"example search","maxResults":1}'
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
| `maxResults` | integer | No | `10` | 1–100 results. |
| `date_range` | string | No | — | Freshness filter; see below. |
| `include_domains` | string[] | No | — | Restrict results to these domains; at most 300 entries. |
| `exclude_domains` | string[] | No | — | Exclude results from these domains; at most 300 entries. |
| `content` | object | No | — | Optional result content controls; see highlights below. |

### Highlights

Set `content.highlights` to `true` to request short matching excerpts. It is a boolean and defaults to `false`. For example:

```json
{
  "query": "AI research",
  "content": { "highlights": true }
}
```

When enabled, each result's `highlights` field is an array of strings; it is empty when there are no matches. When disabled, the field is omitted.

Every result always includes `snippet` as a string. Snippets cannot be disabled; when no snippet is available, the field is an empty string (`""`). Enabling highlights retains the snippet. Do not send a `content.snippet` switch in new requests.

For token-efficient workflows, prioritize highlights when they provide enough evidence, and use snippets when more context is needed or highlights are empty. Returning both fields does not itself reduce model input tokens; savings depend on which content the agent passes to the model. Keep source URLs with the selected evidence.

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

Use this pattern only when the user requests recent results restricted to the specified sources.

```bash
curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/search" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI regulation updates",
    "maxResults": 5,
    "date_range": "month",
    "include_domains": ["reuters.com", "bbc.com"]
  }'
```

### Result count

`maxResults` controls the maximum number of results returned in one request. It defaults to `10` and accepts integers from `1` through `100`. The service may return fewer results when the query has fewer relevant matches.

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
| `snippet` | Always-present string that cannot be disabled; empty (`""`) when no snippet is available. Retained when highlights are enabled. |
| `highlights` | Array of short matching excerpts when requested; empty when there are no matches, omitted when disabled. |
| `favicon` | Favicon URL when available. |
| `images` | Always an array, possibly empty. Image objects have `url`, `width`, `height`, and `alt`; the latter three can be `null`. |
| `is_safe` | Safety classifier result; always present. |

Preserve the API's JSON response, including any additional fields. An empty `images` array is valid; do not promise that each result contains images. Use titles, URLs, snippets, and available highlights to decide which sources matter. If the task needs a full page, use an available page-fetch tool on selected URLs.

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
| `429` | Request rate exceeded | Slow down and retry later according to the account policy. |
| `500` | Internal server error | Retry only as part of a bounded retry policy. |
| `502` | Upstream search service unavailable | Retry only as part of a bounded retry policy. |
| `504` | Upstream search service timeout | Retry only as part of a bounded retry policy. |

A timeout can occur after a billable search has already executed. Do not retry automatically. Let the caller decide whether to retry within its request budget and deadline; do not retry an unchanged invalid request or an authentication, credit, or access failure.

## Direct API versus MCP

Use this skill for direct HTTP access to `POST /v1/search` and the API's JSON response. For an MCP connection, use `ateve_web_search` and its current tool schema. The two integrations do not have to expose identical parameter sets.
