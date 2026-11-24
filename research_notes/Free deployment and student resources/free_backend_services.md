# Free-tier backend services for a personal portfolio (as of 2026-11-24)

All pages fetched 2026-11-24 unless noted. Only official provider pages count for limits and terms. Anything not confirmed on an official page is marked **UNVERIFIED** or listed under Gaps. Limits change often, so re-check before building.

## (a) AI inference free tiers usable from a server (a few hundred Q/day, JSON output)

### Takeaway
Cloudflare Workers AI is the best $0, no-training option. It gives 10,000 Neurons/day on the Free plan. Cloudflare's terms say it does not use Customer Content to train generative AI. Groq is the best backup: its default is no retention, but its Free-plan numbers are visible only in the account console. GitHub Models no longer exists (retired 2026-07-30). Gemini's free tier trains on your data and cannot serve users in the EEA, Switzerland or the UK. Cerebras is now a card-gated $5 / 30-day trial, so it is not a lasting free tier.

### Cited Findings
**Cloudflare Workers AI**
- Workers Free and Workers Paid both include "10,000 Neurons per day at no charge". The limit resets at 00:00 UTC. — [CF Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- On Workers Free, any use above 10k Neurons needs an upgrade to Paid. Once over the limit, "further operations will fail with an error". Paid overage costs $0.011 per 1,000 Neurons. Some models need a paid billing method. — [CF Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- Data use: "Unless otherwise agreed, Cloudflare does not use any Customer Content to train generative AI tools." Inputs and outputs count as Customer Content. — [CF Developer Platform service-specific terms](https://www.cloudflare.com/service-specific-terms-developer-platform/)
- Workers Free platform limits: 100,000 requests/day and 10 ms CPU per invocation. KV free limits: 100k reads/day, 1k writes/day, 1 GB stored. — [CF Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

**Groq**
- The public rate-limits page shows only the **Developer** plan's base limits. Examples: openai/gpt-oss-120b, gpt-oss-20b and qwen/qwen3.8-27b each get 30 RPM, 1K RPD, 8K TPM and 200K TPD. For your account's exact limits, the page sends you to console Settings > Limits. — [Groq rate limits](https://console.groq.com/docs/rate-limits)
- No official page I fetched states the Free-plan numbers. Third-party aggregators conflict: one says 14,400 RPD and 6K TPM for llama-3.1-8b-instant, another says 30 RPM and 6K TPM. **UNVERIFIED.** — [Groq community thread](https://community.groq.com/t/what-are-the-rate-limits-for-the-groq-api-for-the-free-and-dev-tier-plans/42) (not an official docs page)
- Data: "By default, Groq does not retain customer data for inference requests". Logs are kept only for reliability or abuse investigations, "for up to 30 days". You can opt out of that logging or turn on Zero Data Retention in Data Controls. The page says nothing explicit about training. — [Groq Your Data](https://console.groq.com/docs/your-data)
- The groq.com/pricing page shows no Free-plan details. — [Groq pricing](https://groq.com/pricing)

**GitHub Models: RETIRED**
- The docs say: "As of July 30, 2026, GitHub Models has been fully retired." For model access they point to Azure AI Foundry. — [GitHub Docs](https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models)
- Changelog entries: [retirement announced](https://github.blog/changelog/2026-07-01-github-models-is-being-fully-retired-on-july-30-2026), [closed to new customers 2026-06-16](https://github.blog/changelog/2026-06-16-github-models-is-no-longer-available-to-new-customers), [now retired](https://github.blog/changelog/2026-07-30-github-models-is-now-retired/). I saw these only as search results and did not open them. The docs page above is the primary confirmation.

**Mistral (Experiment plan)**
- To opt out of API training: Admin panel > Privacy > "Data usage for improving our services", then "disable the toggle to prevent API calls and related data from being used to improve Mistral's services." "Vibe and API opt-out toggles are separate." — [Mistral help: opt out](https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training)
- The opt-out toggle implies API data *is* used for training unless you turn it off. The search snippets disagree on the default: one help article says Experiment-plan requests "may be used to train", while a docs snippet says API data is not used. **Conflict, UNVERIFIED.** Labs models may be used for training no matter what the opt-out says (search snippet from [docs.mistral.ai/models/labs](https://docs.mistral.ai/models/labs), not opened).
- The Experiment-plan help URL (455206) returned 404. Rate limits, card requirement and phone verification are not verified.

**Cerebras**
- The pricing page shows a one-time $5 promotional credit that "expires 30 days after activation". Getting it needs "a valid payment method". The tier is "For development, evaluation, and experimentation; not intended for production use." — [Cerebras pricing](https://www.cerebras.ai/pricing)
- Free Trial limits: gpt-oss-120b gets 5 RPM, 30K uncached TPM and 1M TPD. qwen-3.8-27b gets 300 RPM and has no hourly or daily token cap. — [Cerebras rate limits](https://inference-docs.cerebras.ai/support/rate-limits)

**OpenRouter (`:free` models)**
- Accounts that bought fewer than 10 credits get 20 RPM and **50 requests/day**. Accounts that bought at least 10 credits get 20 RPM and 1,000/day. Going over returns HTTP 429. — [OpenRouter limits](https://openrouter.ai/docs/api-reference/limits)

**Google Gemini (free tier), confirmation only**
- Unpaid use: "Google uses the content you submit … to provide, improve, and develop". "human reviewers may read, annotate, and process your API input and output." — [Gemini API terms](https://aistudio.google.com/docs/terms)
- "You may use only Paid Services when making API Clients available to users in the European Economic Area". The same applies to Switzerland and the UK. — [Gemini API terms](https://aistudio.google.com/docs/terms)

**SambaNova, Together**
- The SambaNova rate-limits URL returned 404. Free-tier status is unverified.
- Together's rate-limits page says nothing about a free tier or free models. — [Together rate limits](https://docs.together.ai/docs/rate-limits)

### Inferences
- A few hundred short Q&A calls a day should fit in 10k Neurons/day with a small model. **I did not verify** the Neurons-per-token conversion for specific models; check the per-model Neuron costs on the pricing page. JSON output depends on the model: use Workers AI JSON mode or a model with structured-output support (not verified this session).
- OpenRouter's 50/day cap without credits is too low for "a few hundred a day".
- Cerebras needs a card and the credit expires, so it fails the "$0, no card" constraint.
- Gemini's free tier is unsuitable for a public site that EEA or UK visitors may use.
- Suggested setup: Workers AI as primary, Groq Free as fallback, cache common answers in KV or D1.

### Gaps
- Groq Free-plan RPD/TPM figures and whether a card is needed (console only).
- Mistral Experiment-plan limits and the training default (official sources conflict).
- SambaNova and Together free tiers (no official page fetched).
- Commercial-use rules for Groq Free and Workers AI free allocation were not stated on the pages I fetched.

## (b) One tiny SQL table

### Takeaway
Cloudflare D1 is the simplest fit if the backend is on Workers: 5 GB, 5M reads/day, no pausing found in its docs. Turso and Neon also say "no credit card". Neon scales to zero after 5 minutes and resumes quickly. Supabase **pauses projects after 1 week of inactivity**, which is a risk for a low-traffic portfolio.

### Cited Findings
- **D1 (Workers Free):** 5 million rows read/day, 100,000 rows written/day, 5 GB total storage, 10 databases. At a limit, queries error until 00:00 UTC. — [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- **Turso Free:** 100 DBs, 5 GB, 500M rows read/month, 10M rows written/month, 3 GB syncs, 1-day point-in-time restore. "Start free, no credit card required." The page says nothing about archiving inactive databases. — [Turso pricing](https://turso.tech/pricing)
- **Neon Free:** 1 GB/project (20 GB account), 100 CU-hours/project/month, 100 projects. Scale-to-zero is "Always enabled on Free (suspends after 5 min, cannot be turned off)", and resume usually takes a few hundred ms. "no credit card required." — [Neon pricing](https://neon.com/pricing)
- **Supabase Free:** 500 MB DB/project, 2 active projects, 5 GB egress. "Free projects are paused after 1 week of inactivity." The page does not say whether a card is needed. — [Supabase pricing](https://supabase.com/pricing)
- **Firestore (Spark):** 1 GiB stored, 50K reads/day, 20K writes/day, 20K deletes/day. "No payment method needed." This is NoSQL, not SQL. — [Firebase pricing](https://firebase.google.com/pricing)

### Inferences
- If the stack is Cloudflare, D1 avoids a second vendor and a second set of credentials.
- Supabase's pause needs a keep-alive ping or manual restore. Avoid it for a set-and-forget site.

### Gaps
- Turso inactivity or archiving policy on Free.
- Commercial-use clauses for each database free tier (not fetched).

## (c) Contact/inquiry form that emails the owner

### Takeaway
Best $0 option: a Cloudflare Worker sends mail with the `send_email` binding to a **verified destination address** (the owner's inbox). This is "free on all plans" and does not count toward any quota. Sending to arbitrary recipients needs Workers Paid. Resend Free (100/day, 3,000/month) is the easiest third-party API. Formspree Free (50/month) is labeled "for testing and development".

### Cited Findings
- **Cloudflare Email Service:** "Sending to verified destination addresses in your account is free on all plans." Outbound to arbitrary recipients: "requires the Workers Paid plan" (3,000/month included, then $0.35/1k). Inbound Email Routing is unlimited. — [CF Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- send_email limits: at most 50 recipients across to/cc/bcc, 25 MiB total size, 32 attachments. On a restricted plan, sending to an unverified address fails with `E_RECIPIENT_PLAN_RESTRICTED`. — [CF send email from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
- **Resend Free:** 3,000 emails/month, "limited to 100 emails per day", 3 custom domains. The page does not say whether a card is needed. — [Resend pricing](https://resend.com/pricing)
- **Formspree Free:** "for testing and development, limited to 50 submissions/mo". Unlimited forms, basic ML spam filtering, custom reCAPTCHA. Commercial use is not addressed. — [Formspree plans](https://formspree.io/plans)
- **Brevo, Web3Forms:** official pages returned 403/404 or gave no numbers. **UNVERIFIED.**

### Inferences
- A verified destination address probably needs a domain with Email Routing set up on Cloudflare. The docs imply this but do not state it outright.
- This option needs a custom domain on Cloudflare DNS, so it does not work with a free subdomain alone. Resend also needs a verified sending domain (not verified this session).

### Gaps
- Brevo free limits (I believe they are around 300/day, but this is **UNVERIFIED**), Web3Forms free limits and commercial terms.
- Whether CF verified-destination sending works without the domain's MX records on Email Routing.

## (d) Bot protection and rate limiting

### Takeaway
Cloudflare Turnstile Free is effectively unlimited: "Unlimited challenges", 20 widgets, 10 hostnames per widget. Cloudflare's free WAF gives only 1 rate-limiting rule, fixed to IP-based counting over 10 seconds. hCaptcha Basic costs $0, but its page lists no request limits.

### Cited Findings
- **Turnstile Free:** free, "Up to 20 widgets", "10 hostnames per widget", "Unlimited challenges (traffic or verification requests)", 7-day analytics lookback. — [Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)
- **CF WAF rate limiting, Free plan:** 1 rule, 10 s counting period, IP-based counting, 10 s mitigation timeout. — [CF rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- **hCaptcha Basic:** $0. The only privacy statement is "Complies with GDPR, CCPA, LGPD, PIPL, and more." No request cap is listed (Pro includes 100K evals/month). — [hCaptcha pricing](https://www.hcaptcha.com/pricing)

### Inferences
- To protect the AI endpoint, combine Turnstile on the form or chat with a per-IP counter in KV or D1, or with the single WAF rule. Also enforce a daily global cap in code so traffic cannot burn the 10k-Neuron budget.

### Gaps
- The Workers Rate Limiting binding (free availability and limits) was not fetched.
- hCaptcha's data-use and privacy policy details.

## (e) Privacy-friendly analytics

### Takeaway
Cloudflare Web Analytics is free, does not collect visitors' personal data, and works without Cloudflare DNS. Umami Cloud Hobby gives 100K events/month for 1 site with 6-month retention. GoatCounter is free for "reasonable public usage" and is cookie-free.

### Cited Findings
- **CF Web Analytics:** "free, privacy-first analytics". It "does not collect or use your visitors' personal data". It works "without changing your DNS or using Cloudflare's proxy", via a JS snippet. No limits are stated. — [CF Web Analytics](https://developers.cloudflare.com/web-analytics/about/)
- **Umami Cloud Hobby:** "Up to 100K events per month", "1 website", "6 month data retention". The page does not say whether a card is needed. — [Umami pricing](https://umami.is/pricing)
- **GoatCounter:** "offered for free for reasonable public usage". "Running your personal website or small-to-medium business on it is fine." It counts visits "without cookies or persistently storing any personal data." There is no numeric cap; "millions of pageviews/day" is called unacceptable. — [GoatCounter](https://www.goatcounter.com/)

### Inferences
- All three should normally need no cookie banner. This is not legal advice, and I did not check it against any regulator.

### Gaps
- Cloudflare Web Analytics site/rule limits and whether it is formally "cookie-free" (the page does not say so).

## (f) Free domain / subdomain

### Takeaway
Free platform subdomains (`*.workers.dev`, `*.pages.dev`, `*.github.io`, `*.netlify.app`) come with each platform. Community subdomains come with conditions. is-a.dev requires a PR and a software-development link, and bans AI-written requests. js.org is only for sites about the JS ecosystem. eu.org is free but meant for those who "cannot afford the fees". None of them lets you set up Cloudflare Email Routing unless you can delegate DNS to Cloudflare.

### Cited Findings
- **is-a.dev:** fork the repo and open a PR. "Do not use AI to generate your request." Reviewers may require changes, or the PR is rejected. DNS goes live "within a few minutes" after merge. — [is-a.dev README](https://raw.githubusercontent.com/is-a-dev/register/main/README.md)
- is-a.dev root subdomains "must relate to software development". No per-user cap is stated. NS records are denied to new users "for security reasons". — [is-a.dev FAQ](https://docs.is-a.dev/faq/)
- **js.org:** content must be "*directly* related to the JavaScript ecosystem/community". "No placeholder pages." No automatic redirects. You add a CNAME at your host and open a PR to `cnames_active.js`, usually live within 24 h. — [js.org README](https://raw.githubusercontent.com/js-org/js.org/master/README.md)
- **eu.org:** "free subdomain registration" for "users or non-profit organizations who cannot afford the fees demanded by some NICs". No support is given. — [nic.eu.org](https://nic.eu.org/)

### Inferences
- For a personal portfolio, js.org probably does not qualify unless the site is about JS. is-a.dev fits a developer portfolio.
- eu.org registration is known to take a long time and needs your own nameservers. **UNVERIFIED** on official pages this session.

### Gaps
- Official rules and limits for `*.workers.dev`, `*.pages.dev`, `*.github.io` and `*.netlify.app` were not fetched.
- is-a.dev full Terms (is-a.dev/terms), including whether commercial use is allowed.
- eu.org processing time and nameserver requirements.

## (g) CI/CD

### Takeaway
GitHub Actions is free for public repos on standard hosted runners. For private repos, GitHub Free gives **$12/month of compute**, now a dollar amount rather than a minute count (about 2,000 Linux minutes at $0.006/min). Usage is blocked at the cap if no card is on file.

### Cited Findings
- "Standard GitHub-hosted runners in public repositories" are free and do not use up the included compute. Larger runners are billed even on public repos. — [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- GitHub Free includes $12 compute/month, 500 MB artifact storage (shared with Packages) and 10 GB cache per repo. With no payment method, usage is blocked when the allowance runs out. Self-hosted runners remain free. — [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

### Inferences
- About 2,000 Linux minutes/month is my own calculation ($12 / $0.006), not a GitHub figure.
- Cloudflare Pages and Workers Builds also offer Git-triggered deploys, but I did not check their free build limits this session.

### Gaps
- Cloudflare Workers Builds / Pages free build-minute limits.
- No dated GitHub announcement fetched for the switch from minutes to dollars.
