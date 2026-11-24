# AI Assistants on Personal Portfolio Sites: Examples, Grounding/Safety Architectures, and $0 Free-Tier Options (researched 2026-11-24)

Research notes. The research used about 22 tool calls, a little over the 15-call budget, so coverage is partial. See the Gaps sections. All provider limits come from official pages fetched on 2026-11-24. Undated pages are marked as undated.

## Which portfolio AI assistants are well engineered, which are gimmicks, and what makes the difference?

### Takeaway
Most "chat with my resume" repos are thin demos. They use one LLM call and a stuffed prompt, and they have no rate limiting, injection defense or fallback. The well-engineered ones share four traits:
- A grounded-first or deterministic path that answers common facts without an LLM.
- Server-side per-IP rate limiting plus a provider spend cap.
- Pre-LLM injection and scope filters.
- Graceful fallback when quota runs out.

The best documented example found is Bradley Matera's ProjectHub, which runs entirely on free tiers.

### Cited Findings

**Examples (URL, creator, stack, controls)**

1. **ProjectHub (embeddable recruiter assistant)**: Bradley Matera, https://bradleymatera.github.io/ProjectHub/ — [dev.to write-up](https://dev.to/bradleymatera/how-i-built-projecthub-an-embeddable-ai-recruiter-assistant-that-runs-on-free-tiers-bif). The page shows "July 12" with no year.
   - **Retrieval:** No vector DB. A regex intent classifier routes to more than 40 deterministic handlers over a JSON knowledge file, `data/recruiter-knowledge.json`. Only generative requests get the relevant verified context stuffed into the prompt.
   - **Grounding:** Factual questions are answered from the knowledge base with no LLM call. Generated replies are validated and rejected if they add facts absent from the context or include unsupported numbers. Each response carries a `pipeline` field showing how it was produced. There are no source citations.
   - **Providers:** A multi-provider router covers Groq, Cloudflare Workers AI, GitHub Models, Google Gemini, xAI Grok and an optional OpenAI-compatible endpoint, all on free tiers. The router tracks per-provider quota, cooldown and circuit-breaker state. Cooldown length depends on the error type. The whole request has a 15 s budget. If every provider fails, the grounded answer is returned.
   - **Safety:** Checks run before any LLM call. They cover injection, secret extraction, XSS, social engineering, exfiltration and "reveal your instructions" requests.
   - **Privacy:** No conversation database. Session memory is in-process. The visitor name is kept in `sessionStorage`. Analytics hide session IDs and request bodies, and referrers are truncated to the domain.
   - **Hosting:** GitHub Pages for the front end and a GCP Always-Free VM for the back end. The author uses budget alerts because free tiers change.
2. **"Ask" RAG portfolio chatbot**: Cameron Rye, 2026-01-12 — [blog](https://ryedev.pages.dev/blog/building-ask-rag-portfolio-chatbot).
   - **Stack:** Llama 3.3 70B on Cloudflare Workers AI. BGE Base EN v1.5 embeddings (768-d). Cloudflare Vectorize plus AI Search (AutoRAG), with content in R2. Astro API routes on Workers, Preact front end.
   - **Grounding:** Retrieved chunks go into the system prompt. Citation links are not built yet; the author lists them as future work.
   - **Injection defense:** Input sanitization (strips control characters, truncates input), regex detection of patterns like "ignore previous instructions", and an output filter that blocks system-prompt leaks.
   - **Rate limiting:** Per-IP sliding window stored in Turso (SQLite). No numbers given.
   - **Logging:** Cloudflare AI Gateway handles logs. The author saw injection attempts in the logs within hours of launch.
3. **Career Conversation agent**: Ed Donner (from his Agents course), Hugging Face Space `ed-donner/Career_Conversation`. Many community forks copy the pattern — [Space files](https://huggingface.co/spaces/ed-donner/Career_Conversation/tree/main/me), [course notebook](https://huggingface.co/spaces/ed-donner/Career_Conversation/blame/main/lab3.ipynb), [fork app.py](https://huggingface.co/spaces/grumppie/career_converstaion/blob/main/app.py).
   - **Context:** The `me/` folder holds `linkedin.pdf` and `summary.txt`, which are stuffed in full into the system prompt.
   - **Tools:** `record_unknown_question` pushes unanswerable questions to the owner via Pushover. `record_user_details` captures leads. The system prompt tells the model to call the tool whenever it doesn't know an answer. Some variants also redirect off-career questions.
   - **Provider:** OpenAI in the forks.
   - **Not verified:** Ed Donner's own `app.py` returned 404.
4. **toukoum/portfolio** (Next.js "AI-native" portfolio template): Toukoum, live at toukoum.fr, 286 stars — [GitHub](https://github.com/Toukoum/portfolio).
   - **Stack:** Needs an OpenAI key, plus a GitHub token for "GitHub integration features". Uses Next.js and `vercel.json`.
   - **Not documented:** The README does not describe rate limiting, injection defense, or the grounding method. Also not confirmed: whether it uses the Vercel AI SDK or tool-calling. The tool-calling claim comes from memory and is unverified.
5. **portfolio-llm**: Vishal Bakshi, 2025-06-26 — [blog](https://vishalbakshi.com/blog/posts/2025-06-26-portfolio-llm), [repo](https://github.com/vishalbakshi/portfolio-llm).
   - **Retrieval:** None. The whole portfolio is a single `llms_ctx.txt` file of Q&A pairs, used as full context.
   - **Evals:** Tested in Claude.ai with Claude Sonnet 4, including an "Out-of-Scope Questions" category.
   - **Limits:** The author admits the model doesn't always include URLs. No hosted endpoint, no rate limiting.
6. **Smaller GitHub repos found** (star counts not verified, most likely below 10) — [search results](https://github.com/karushp/resume-chatbot):
   - [karushp/resume-chatbot](https://github.com/karushp/resume-chatbot): Flask, Cohere embeddings, FAISS, Groq, includes rate limiting.
   - [ayoub-essarghini/portfolio-chatbot](https://github.com/ayoub-essarghini/portfolio-chatbot): GPT-4 and Pinecone. Its chat route has no auth and no rate limiting.
   - [Shiv-0401/RAGPortfolio](https://github.com/Shiv-0401/RAGPortfolio): LangChain, ChromaDB, sentence-transformers, Groq Llama 3.1.
   - [AlexTymosh/alextym.com](https://github.com/AlexTymosh/alextym.com): SSE streaming, rate limits, and a Telegram handoff to a human.
   - [RAHULDINDIGALA-32/talk-to-my-resume](https://github.com/RAHULDINDIGALA-32/talk-to-my-resume): agentic RAG with tool calls such as interview scheduling, plus guardrails.

**Commentary from builders**
- Pattern filters "catch the lazy 80%" of injection attempts, and skilled attackers rephrase around them. Low stakes help: the model only knows what the author put in the prompt — [dev.to, goofypluto999](https://dev.to/goofypluto999/hardening-a-free-public-ai-tool-against-prompt-injection-in-2-hours-5c86); [search summary](https://dev.to/okasputra/stop-sending-static-resumes-how-i-built-a-chat-with-my-resume-bot-nextjs-rag-4kdm).
- One portfolio's security doc says its IP-based rate limiting is "Not Implemented (acceptable for personal portfolio)", with only client-side limiting — [ba-calderonmorales chat security](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/security/chat-security).
- The opposite threat also exists: people inject prompts into their own resumes or LinkedIn bios to manipulate recruiter AI bots — [dev.to/fielding](https://dev.to/fielding/i-put-a-prompt-injection-on-my-resume-48l1); [dev.to/coridev](https://dev.to/coridev/how-a-linkedin-bio-hijacked-ai-recruitment-bots-with-prompt-injection-3pgf).

### Inferences
- **What separates real engineering from a gimmick:**
  1. Facts are served deterministically, with the LLM used only for phrasing.
  2. A post-generation claim check against the context.
  3. Server-side rate limits.
  4. A non-LLM fallback answer.
  5. No raw-transcript storage.

  ProjectHub has all five. Most GitHub templates have zero or one.
- For a corpus of 50–500 short docs, full-context stuffing (Donner, Bakshi) is simpler and often more accurate than vector RAG. The catch is token cost per request on free tiers with low TPM. Rye's Cloudflare-native RAG is the cleanest all-free, single-vendor stack.

### Gaps
- Six to eight real live sites with verified star counts were not achieved. Only toukoum/portfolio (286) has a verified count. There was no budget to check Vercel templates, LinkedIn or X posts, or HN threads (the search found no actual Show HN thread).
- Toukoum's grounding and tool design was not verified from source code.

## What citation-enforcement and grounding patterns work best for small personal corpora?

### Takeaway
For a corpus this small, the strongest pattern is layered:
1. A deterministic answer path over a structured JSON or Q&A file.
2. Full-context or top-k context with chunk IDs.
3. A check that rejects any answer with facts or numbers not in the context.
4. A "don't know" tool or response that records the unanswered question.

Free-text "please cite" instructions alone are unreliable.

### Cited Findings
- ProjectHub rejects generated responses that introduce facts absent from the supplied context or include unsupported numbers. Each response exposes a `pipeline` field so you can see how it was produced — [Matera](https://dev.to/bradleymatera/how-i-built-projecthub-an-embeddable-ai-recruiter-assistant-that-runs-on-free-tiers-bif).
- Donner's pattern tells the model to call `record_unknown_question` whenever it doesn't know. That turns hallucination pressure into a logged gap the owner can fill — [fork code](https://huggingface.co/spaces/grumppie/career_converstaion/blob/main/app.py).
- Prompt-only citation is unreliable. Bakshi reports that Claude "doesn't always include URLs" even with a curated Q&A context — [Bakshi](https://vishalbakshi.com/blog/posts/2025-06-26-portfolio-llm).
- Rye has not built citations into his RAG bot; they are listed as a future enhancement — [Rye](https://ryedev.pages.dev/blog/building-ask-rag-portfolio-chatbot).
- Evaluating with a fixed question set, including an out-of-scope category, is a practical regression test — [Bakshi](https://vishalbakshi.com/blog/posts/2025-06-26-portfolio-llm).

### Inferences
- **Enforcing citations without prose instructions:** Use structured output, e.g. `{answer, source_ids[]}` via JSON mode or tool-call schema. Then check in code that each `source_id` exists among the chunks actually passed in, and render the links from your own index, not from model text. This makes fake URLs impossible. It is not sourced to a specific site; it is a standard pattern.
- **Retrieval for a corpus this small:** Small static indexes work well. Options include BM25 or keyword search (e.g. MiniSearch or Lunr) over a prebuilt JSON, or precomputed embeddings stored as a JSON or Float32 file and searched with brute-force cosine in the Worker or browser. 500 docs × 384–768 dims is only about 0.2–1.5 MB at float32, so no vector DB is needed. This size figure is my own calculation.

### Gaps
- No public eval data was found comparing citation-enforcement methods on portfolio-sized corpora.

## What are the exact free-tier limits and the data-retention and training policies of each free provider today?

### Takeaway
- **Cloudflare Workers AI** has the clearest no-card free allowance: 10,000 Neurons per day, reset at 00:00 UTC.
- **OpenRouter** `:free` models allow only 50 requests per day without a purchase.
- **Hugging Face** Inference Providers give free users no monthly credits.
- **Gemini free tier** lets Google train on and human-review your prompts. It also bars serving users in the EEA, UK or Switzerland.
- **Groq's** published table is for the Developer plan. Free-plan numbers were not visible on the docs page.

### Cited Findings

**Cloudflare Workers AI** (page last updated 2026-11-18) — [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- The Workers Free plan includes 10,000 Neurons per day at no charge, reset at 00:00 UTC. Going past it requires Workers Paid ($0.011 per 1k Neurons). On the free plan, requests over the limit fail with an error.
- Neuron costs per million tokens:

| Model | Input | Output |
|---|---|---|
| `@cf/meta/llama-3.2-1b-instruct` | 2,457 | 18,252 |
| `@cf/meta/llama-3.2-3b-instruct` | 4,625 | 30,475 |
| `@cf/baai/bge-small-en-v1.5` | 1,841 | n/a |
| `@cf/baai/bge-base-en-v1.5` | 6,058 | n/a |
| `@cf/baai/bge-large-en-v1.5` | 18,582 | n/a |

- Not checked: Cloudflare's data-use and training policy for Workers AI.

**Google Gemini API** — [rate limits page, undated](https://aistudio.google.com/docs/rate-limits); [terms, effective 2026-03-23](https://aistudio.google.com/docs/terms)
- The rate-limit page lists free-tier numbers only for "Gemini Decision 1": 200 RPM, 50,000 TPM, 10,000 RPD.
- For Flash, Flash-Lite and embedding models, the page defers to the AI Studio console. **Unverified.**
- The free tier needs an "active project or free trial". The page does not say billing is required.
- **Training:** For Unpaid Services, Google uses content and responses "to provide, improve, and develop Google products and services and machine learning technologies".
- **Human review:** "human reviewers may read, annotate, and process your API input and output". Google says it disconnects this data from the account, key and project first.
- **Retention:** The terms state no retention period for unpaid services.
- **Region restriction:** "You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom." A public portfolio that EU or UK visitors can reach is therefore a terms problem on the free tier.

**Groq** — [rate limits, undated](https://console.groq.com/docs/rate-limits); [your data, undated](https://console.groq.com/docs/your-data)
- The rate-limit page names a Free Plan and a Developer Plan. The table shown is "the base limits for the Developer plan".
- Developer plan limits:

| Model | RPM | RPD | TPM | TPD |
|---|---|---|---|---|
| `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.8-27b` | 30 | 1K | 8K | 200K |
| `meta-llama/llama-prompt-guard-2-22m` / `-86m` | 30 | 14.4K | 15K | 500K |

- The Prompt Guard models are usable as an injection classifier.
- **Free-plan numbers and card requirement:** not stated on the page. **Unverified.** Check the console's limits page.
- Over-limit requests return HTTP 429 with a `retry-after` header in seconds. Remaining and reset headers come on every response.
- **Data:** "By default, Groq does not retain customer data for inference requests." Inputs and outputs may be logged for up to 30 days for reliability or abuse investigation. Zero Data Retention is available to all customers in Data Controls. Data is stored in US GCP. The page does not address training.

**OpenRouter** (undated) — [limits](https://openrouter.ai/docs/api/reference/limits)
- `:free` model variants allow 20 RPM.
- 50 requests per day if fewer than 10 credits were ever purchased; 1,000 per day with at least 10 credits purchased. With $0 and no card, the cap is 50 per day.
- Not checked: per-provider logging and training on free models. Free endpoints are commonly reported to allow prompt logging. **Unverified.**

**Hugging Face Inference Providers** — [pricing](https://huggingface.co/docs/inference-providers/pricing)
- Free users get no monthly credits: "Free Users | None | … credits purchase required". PRO users get $2 per month.
- Not a $0 option for LLM chat through the router. Unchecked: whether ZeroGPU Spaces quota for free accounts could host a small model.

**Chrome built-in AI (Gemini Nano)** — [get started, last updated 2025-05-20](https://developer.chrome.com/docs/ai/get-started); [overview](https://developer.chrome.com/docs/ai/built-in)
- APIs: Prompt, Summarizer, Writer, Rewriter, Proofreader, Translator, Language Detector.
- Desktop only: Windows 10/11, macOS 13+, Linux, ChromeOS on Chromebook Plus. Not Android or iOS.
- Hardware: 22 GB free storage, more than 4 GB VRAM, 16 GB RAM or more, 4 or more cores.
- Some APIs are stable, some in origin trial; the page does not say which.

### Inferences
- **Workers AI capacity:** Assume one answer is about 2k input + 300 output tokens on llama-3.2-3b. That costs about 9.3 + 9.1 ≈ 18 Neurons, so roughly 500 answers per day for free. Embedding the whole corpus with bge-small costs about 1.8 Neurons per 1k tokens, which is negligible. This is my own calculation from the official per-token rates.
- **Gemini's suitability:** The free tier is the weakest choice for a public portfolio on privacy grounds (training and human review) and on terms grounds (no EEA/UK/CH users). Use it only for offline build-time tasks, such as generating Q&A pairs about your own public data.
- **Browser-side options:** These cost $0 server-side but reach only some visitors. Chrome Nano needs high-end desktop hardware. Treat them as progressive enhancement, not the primary path.

### Gaps
- WebLLM and transformers.js requirements and model sizes were not fetched; no official sources were checked.
- Exact Gemini Flash and Flash-Lite and `gemini-embedding` free RPM and RPD are not on the public page.
- Groq Free-plan numbers and card requirement are not on the public page.
- Cloudflare Workers AI training and data-use policy was not checked.
- Not checked: OpenRouter free-model logging, and GitHub Models free limits (ProjectHub uses them).
- Free embedding APIs other than Cloudflare were not checked: Gemini embedding free limits, Cohere trial keys.

## How do sites cap cost and handle rate-limit exhaustion gracefully?

### Takeaway
Robust sites stack several controls:
- Server-side per-IP limits (sliding window in Redis, Turso or KV).
- A provider-side spend cap. On a $0 no-card plan, the free quota itself acts as the hard cap.
- Pre-LLM filters that save quota.
- A multi-provider router with error-specific cooldowns.
- A non-LLM fallback answer, so the UI never just breaks.

### Cited Findings
- ProjectHub:
  - Routes across 5 or more free providers with per-provider quota, cooldown and circuit breakers, and cooldown length set by error type.
  - Gives each call a bounded timeout and the whole request a 15 s budget.
  - Returns the grounded answer if every provider fails.
  - Runs safety checks before the LLM to save quota.
  - Uses budget alerts.

  — [Matera](https://dev.to/bradleymatera/how-i-built-projecthub-an-embeddable-ai-recruiter-assistant-that-runs-on-free-tiers-bif)
- Rye uses a per-IP sliding-window limiter with state in Turso. Its stated purpose is DoS protection and stopping excess API spend. Cloudflare AI Gateway handles logging — [Rye](https://ryedev.pages.dev/blog/building-ask-rag-portfolio-chatbot).
- Examples found by search:
  - A Hugging Face resume bot caps each IP at 15 requests per 5 minutes and returns "too many requests".
  - A Redis-backed bot uses 1,000 requests per 24 h per IP, and its author recommends a monthly provider spend cap as a backstop.
  - Another builder separates cooldowns: about 60 s for a rate-limit error versus about 24 h for a credit or spend-limit error.

  — [search result set](https://huggingface.co/spaces/ECRodriguez/career_chatbot/raw/main/app.py); [dev.to/okasputra](https://dev.to/okasputra/stop-sending-static-resumes-how-i-built-a-chat-with-my-resume-bot-nextjs-rag-4kdm). These come from search summaries, not full-page fetches.
- Groq signals exhaustion with HTTP 429 and `retry-after`, so clients can back off precisely — [Groq](https://console.groq.com/docs/rate-limits).
- Cloudflare's free plan fails with an error once the 10k-Neuron daily cap is hit and resets at 00:00 UTC, so it cannot overspend — [Cloudflare](https://developers.cloudflare.com/workers-ai/platform/pricing/).

### Inferences
- **Recommended $0 stack for a 50–500 doc site:**
  - **Hosting:** Cloudflare Worker.
  - **Rate limiting:** Per-IP limit in KV or Durable Objects.
  - **Grounding:** Precomputed bge-small embeddings or BM25 over a static JSON index; top-k chunks with IDs; structured-output answer; server-side check of source IDs and unsupported numbers.
  - **Models:** Workers AI as the primary. Groq as a secondary, with ZDR switched on.
  - **Exhaustion fallback:** Show the top retrieved snippets as "here's what my site says about this", plus a contact link.
  - **Logging:** Log only aggregate counts and unanswered-question text, never IPs or full transcripts.
- **Client-side limits:** Client-side-only rate limiting is not real protection. Anyone can call the endpoint directly.

### Gaps
- No public numbers were found on real portfolio-bot traffic, abuse volume, or monthly cost.
- Not verified: Cloudflare KV, Durable Objects or Rate Limiting binding free-tier limits.
