---
name: ateve-search-api
description: "直连调用 Ateve Search API 的 cURL / raw HTTP 用法（无 SDK 环境使用）。适用于需要 Ateve 网页搜索、拿到片段与来源 URL 的场景；已装 MCP 的用户请改用 ateve_web_search 工具。"
---

# Ateve Search API（直连）

> 需要 API Key：在 Ateve Dashboard 创建，并设置到环境变量 `ATEVE_API_KEY`。
> Header：`Authorization: Bearer $ATEVE_API_KEY`（Key 只以变量名出现，绝不把值写进命令或日志）。
> 接口：`POST https://api.ateve.ai/v1/search`。请求字段和响应字段已按官方 SDK 与 `ateve-service-api` 校准；真实账号联调仍待执行。

## Quick Start (cURL)

先检查变量是否存在，只报告变量名，不打印值。使用已经确认的 API 基地址；不要猜测生产 endpoint。若用户选择将凭据保存在本地配置文件，权限应为 `mode 600`，并排除版本控制；只检查权限，不读取或展示 Key。执行请求时关闭 shell 的 `set -x`，不使用 `curl -v` 或 `--trace`。

```bash
: "${ATEVE_API_KEY:?请先配置 ATEVE_API_KEY}"


curl -sS --max-time 60 -X POST "https://api.ateve.ai/v1/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -d '{
    "query": "latest developments in LLM agents",
    "limit": 3
  }'
```

首次连通性检查可只输出 HTTP 状态码，丢弃响应体；这仍会执行一次搜索，不能把它当作零成本的健康检查：

```bash
: "${ATEVE_API_KEY:?请先配置 ATEVE_API_KEY}"

curl -s --max-time 60 -o /dev/null -w '%{http_code}\n' \
  -X POST "https://api.ateve.ai/v1/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ATEVE_API_KEY" \
  -d '{"query":"connectivity check","limit":1}'
```

`000` 表示没有收到 HTTP 状态码，应结合 curl 退出码排查连接/超时；不能据此声称 API 返回了错误码。不要将未经脱敏的上游错误正文直接粘贴给用户。

## 参数

| 参数 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `query` | string | 是 | - | 可独立理解的自然语言搜索请求（指代消解与上下文补齐由调用方完成） |
| `limit` | integer | 否 | 模板显式传 3 | 返回结果数；SDK 校验范围 1–50，服务端行为待联调 |

## 返回

官方 SDK 中的 HTTP 返回字段包括 `results[].title`、`url`、`published_at`、`snippet`，耗时为 `latency_ms`。可选字段可能为 null 或省略；不要推测缺失值。合法空结果为 `results: []`。

## 关键坑位

- Key 只放在 Header / 环境变量；不要写进脚本、日志或 URL Query 参数。
- 上面的单次 curl 命令没有跨调用连接池与自动重试，最多等待 60 秒。确需重试时仅对 500/502/503/504 重试，最多额外 2 次，退避 1 秒、2 秒；整个搜索含等待共用 60 秒预算，预算耗尽即停止。不要使用会额外重试 429 的通用策略。
- 只请求片段、控制 `limit`，减少上下文 token。
- 需要产品级性能（连接复用 / 统一重试 / 错误映射 / 扁平化输出）请改用 Ateve MCP（stdio 或 Hosted Streamable HTTP）。

## 错误自查

以下是一期约定的处理方向，真实 API 的响应格式仍须核对；不要把推测当成已确认的服务端原因。

| 状态/现象 | 下一步 |
|---|---|
| 400 / 422 | 检查 JSON、`query` 和 `limit`，不要原样重试 |
| 401 | 检查 Key 是否已配置、是否有效，以及 Bearer Header；只报告检查结果，不输出值 |
| 403 | 检查账号权限、套餐或资源访问限制，不自动重试 |
| 429 | 提示检查额度/套餐，或降低请求频率后稍后再试；当前调用不自动重试 |
| 500 / 502 / 503 / 504 | 按上述次数、退避与总时间预算重试；仍失败则报告暂不可用 |
| 其他非成功状态 | 停止并报告状态，不套用瞬时 5xx 重试 |
| curl 退出码 28 | 超时，停止本轮；不要继续后台重试 |
| 连接失败 / HTTP `000` | 检查已确认的基地址、网络与 TLS；不要改连其他环境 |

## 联调状态

endpoint、请求字段 `query` / `limit` 已由接口示例确认；返回字段按 [官方 SDK](https://github.com/ateve-inc/ateve-sdks/blob/main/js/src/client.ts) 和 `ateve-service-api` 对接，尚未用真实凭据验证返回与错误路径。

MCP 工具仍使用 `max_results`，调用 API 时转换为 `limit`；不要在直连 curl 中传 MCP 字段名。
