# Changelog

## 0.1.5 - 2026-11-26

- Document direct image and video search requests, result fields, and source citation rules.
- Explain the media request count range and product-specific Team access errors.
- Keep the existing web search and highlights guidance unchanged.

## 0.1.4 - 2026-11-20

- Recommend the canonical `content.highlights` request parameter.
- Document always-present, non-disableable snippets and empty-string handling.
- Explain highlights-first evidence selection without promising automatic token savings.
- Remove retired estimated-match fields from public skill guidance.
- Verify packaged examples and both project and user-level installations.

## 0.1.3 - 2026-10-27

- Document optional `content.highlight` requests and the returned `highlights` array.
- Bundle the agent-readable installation guide and link to it from the README.
- Verify the packaged guide and highlight documentation in project and user-level installation tests.

## 0.1.2 - 2026-09-16

- Replace the public result-count and paging inputs with `maxResults`.
- Set the accepted result-count range to 1–100 with a default of 10.
- Remove the retired input names from the bundled skill instructions.

## 0.1.1 - 2026-09-15

- Use `@ateve/agent-skills` consistently as the npm package name and installation entry point.
- Clarify that the package contains one search skill and an installer, while the agent's tools execute API requests.
- Remove outdated repository-access and first-publication instructions from the package README.
- Describe project and user-level installation, API key setup, and account-credit requirements.
- Point the package homepage to Ateve and clarify that the HTTP-status example sends a live search request that may consume credits.

## 0.1.0 - 2026-09-14

- Initial public release of the Ateve Search API agent skill installer.
- Bundle `ateve-search-api` and install it through the Skills CLI for supported coding agents.
- Focus search requests on query, pagination, date range, and domain filters; use default content settings and preserve the API's JSON response.
- Align documented pagination and domain limits with the current API contract.
- Add package installation tests and GitHub Actions workflows for validation and npm releases.
