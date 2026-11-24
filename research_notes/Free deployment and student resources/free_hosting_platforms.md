# Free Hosting / Deploy Platforms for a Next.js Static-Export Portfolio (+ tiny API, tiny DB) — as of 24 Nov 2026

Context: Next.js App Router `output: 'export'`, heavy 3D assets (glTF/KTX2/WebP, Gaussian splats 5–30 MB each), one small TypeScript serverless API (AI assistant, rate limiting, tiny SQL table, later contact form + GitHub-OAuth admin). Budget $0, ideally no card, commercial use matters (freelance inquiries).

Pages were fetched on 2026-11-24. "dateModified/last updated" values are the dates shown on the official pages. Anything marked **[UNVERIFIED]** was not confirmed from an official page in this pass.

## 1. Per-platform free limits, card, commercial use, domains, functions, cold starts

### Takeaway
Cloudflare Workers (static assets + Worker + D1) is the only option verified to have free, unlimited static-asset requests, a 25 MiB per-file cap, a TypeScript serverless runtime, a free SQL DB, no non-commercial clause in its self-serve terms, and no sleep. Vercel Hobby is non-commercial (per the user's brief; the clause itself was not re-quoted from the pages fetched). GitHub Pages discourages business-focused sites. Netlify moved to a 300-credit/month hard-capped Free plan (Sept 2025). Deno Deploy is being shut down (April 2027).

### Cited Findings

**Cloudflare Workers (static assets) — Free plan**
- "Requests to static assets are free and unlimited." (page dateModified 2026-11-12) — [CF Workers static assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- Requests to the Worker script itself are "billed according to Workers pricing". With `run_worker_first`, matching requests always invoke the Worker. Free-tier users who exceed request limits "will receive a 429 (Too Many Requests) response instead of falling back to static asset serving". Negative patterns (`!/...`) still serve assets without invoking the Worker — [CF static assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- Workers Free limits (dateModified 2026-11-19): 100,000 requests/day (resets 00:00 UTC, Error 1027 on exceed; routes can fail open or closed). 10 ms CPU per HTTP request. 128 MB memory. 50 subrequests/request. Worker size 64 MiB. 100 Workers. 5 Cron Triggers. **Static asset files: 20,000 per Worker version. Static asset file size: 25 MiB each.** — [CF Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- Assets are automatically cached across Cloudflare's network, with tiered caching — [CF static assets](https://developers.cloudflare.com/workers/static-assets/)
- D1 (SQLite) Free: 5 million rows read/day, 100,000 rows written/day, 5 GB total storage, 10 databases. Queries error once the daily limit is hit, reset 00:00 UTC (dateModified 2026-10-30) — [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- Self-Serve Subscription Agreement (Last Updated 12 Sep 2025): no non-commercial restriction found. Free Services can be terminated "in our sole discretion". Sec. 2.2.1(h): you may not "process or collect personal or business credit card information" on a property receiving Free Services. Sec. 2.2.1(b) bans creating an "undue burden" — [Cloudflare Terms](https://www.cloudflare.com/terms/)
- Application Services (CDN) terms (last updated 28 Sep 2026): Cloudflare may limit CDN use for "video or a disproportionate percentage of pictures, audio files, or other large files" served without the right Paid Services. It points to the Developer Platform, Images and Stream as the right services. Only Enterprise customers are exempt by name. Pages, R2 and Workers are not named — [CF Application Services terms](https://www.cloudflare.com/service-specific-terms-application-services/)
- Developer Platform terms (last updated 28 Sep 2026): no large-file or video restriction for Workers, Pages, R2 or static assets. No commercial-use limit on free Workers — [CF Developer Platform terms](https://www.cloudflare.com/service-specific-terms-developer-platform/)

**Cloudflare Pages — Free** (dateModified 2026-11-19)
- 500 builds/month, 1 concurrent build, 20-minute build timeout, 20,000 files per site, **25 MiB max per asset**, 100 custom domains per project. "Requests to Pages functions count towards your quota for Workers plans" — [CF Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

**Netlify — Free (credit-based)**
- Credit-based plans started **4 Sep 2025** for all new accounts. Older accounts are on a Legacy plan, and switching to credits is irreversible — [Netlify credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- Free: **300 credits/month, hard limit**, no auto-recharge, no rollover, 1 concurrent build. "You'll never be charged for the Free plan." — same source
- Credit costs: bandwidth 20 credits/GB. Web requests 2 credits per 10k. Functions compute 10 credits/GB-hour. Production deploy 15 credits each. Form submissions free. Deploy previews, branch deploys and failed deploys are not metered — same source; [Netlify pricing](https://www.netlify.com/pricing/)
- Terms of Use (last updated 14 Oct 2026) have no commercial-use restriction. They defer to the Self-Serve Subscription Agreement and the AUP, which were not fetched — [Netlify Terms](https://www.netlify.com/legal/terms-of-use/)

**Vercel — Hobby** (docs last_updated 2026-11-12)
- Hobby includes per month: 100 GB Fast Data Transfer, 10 GB Fast Origin Transfer, 1,000,000 CDN requests, 1,000,000 function invocations, 4 CPU-hrs Active CPU, 360 GB-hrs provisioned memory, 5,000 image transformations. Max function duration 300 s. 100 deployments/day. 50 domains per project — [Vercel Hobby](https://vercel.com/docs/plans/hobby)
- Over-limit behavior: "if you exceed your usage limits on the Hobby plan, you will have to wait until 30 days have passed before you can use the feature again." — same source
- The pages fetched did not show the "personal, non-commercial" clause. It sits in Vercel's Terms of Service ("fair use" section, linked from the fair-use page). **[UNVERIFIED in this pass — fetch vercel.com/legal/terms to quote]** — [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines)

**GitHub Pages**
- Published site ≤ 1 GB. Source repo: 1 GB recommended. **Soft 100 GB/month bandwidth.** Soft 10 builds/hour; custom Actions workflows are exempt. No per-file max on the page; it links to "About large files" (GitHub blocks files > 100 MB in git — **[UNVERIFIED here]**) — [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- Pages is "not intended for or allowed to be used as a free web-hosting service", and is not meant for sites that mainly support business transactions or commercial SaaS. Do not use it for passwords or credit cards — same source
- Acceptable Use Policy: "We do not generally prohibit use of GitHub for advertising", but the "primary focus" of content "should not be advertising or promotional marketing". This applies to Pages — [GitHub AUP](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies)
- No backend or functions (static only).

**Firebase Hosting — Spark (no-cost)**
- Hosting: 10 GB storage, **360 MB/day data transfer**. Cloud Functions are "Not applicable" on Spark. Firestore Spark: 1 GiB stored, 50K reads/day, 20K writes/day, 20K deletes/day, 10 GiB/month egress. Spark needs "No payment method needed" — [Firebase pricing](https://firebase.google.com/pricing)
- Custom domain + SSL on Spark: not shown on the pricing page **[UNVERIFIED]**.

**Azure Static Web Apps — Free**
- Free plan is labelled "For personal projects". Standard is "For production apps". Free gets free auto-renewing SSL, 2 custom domains/app, 250 MB max app size, 3 staging environments, **Managed** Azure Functions APIs (bring-your-own needs Standard), preconfigured auth providers only (custom registrations need Standard), no SLA. The Dedicated plan was retired 31 Oct 2025 (page updated 2026-01-23) — [Azure SWA plans](https://learn.microsoft.com/en-us/azure/static-web-apps/plans)
- Quotas (updated 2026-09-28): 100 GB/month bandwidth with **no overage on Free**. 10 apps per subscription. 500 MB total storage (250 MB per environment). 15,000 files. 30 MB request size limit — [Azure SWA quotas](https://learn.microsoft.com/en-us/azure/static-web-apps/quotas)
- Needs an Azure subscription; card requirement **[UNVERIFIED]**.

**Render — Free**
- Static sites: "Deploy websites for free, forever." They count against monthly included outbound bandwidth and pipeline minutes — [Render free](https://render.com/docs/free); [Render pricing](https://render.com/pricing)
- Free web services spin down after **15 min** without inbound traffic. Spin-up "takes about one minute". 750 free instance hours per workspace per month. Free Postgres **expires 30 days** after creation, with a 14-day grace period. With no payment method, going over the bandwidth limit suspends all Free services for the rest of the month. Free instances are not meant for production — [Render free](https://render.com/docs/free)
- Numeric bandwidth and build-minute allowances could not be read from the pricing page **[UNVERIFIED]**.

**Deno Deploy — Free**
- 1M requests/month, 20 GiB egress/month, 10 hr Active CPU, KV 1 GiB, 5 custom domains. Described as "For personal use and smaller projects." — [Deno Deploy pricing](https://deno.com/deploy/pricing)
- Deployment ≤ 1 GB (source + static). 512 MB memory — [Deno Deploy limits](https://docs.deno.com/deploy/pricing_and_limits/)
- **Sunsetting:** announced 9 Oct 2026. "Deno Deploy will continue operating for six months before shutting down" (about April 2027). Paying customers get migration support to Cloudflare Workers — [Deno blog](https://deno.com/blog/cloudflare)

**Fly.io**
- "Every new account starts on the Free plan". New accounts get $1 of credit with no card, then "$5 of usage every month once you add a card". The Free plan allows "up to 3 Machines". The same page also says all organizations "require a credit card on file", which is inconsistent. Plans discontinued in Oct 2024 keep their old allowances — [Fly.io pricing](https://docs.fly.io/about/pricing)

**Koyeb**
- Pricing page lists no free compute instance. Pro includes $10 compute. A "Free 5h" Postgres is $0 (0.25 vCPU, 1 GB RAM, 1 GB storage). Scale-to-zero is offered. No card or commercial info — [Koyeb pricing](https://www.koyeb.com/pricing)

**Oracle Cloud Always Free**
- Official page returned HTTP 403. Figures (4 Ampere A1 OCPU / 24 GB RAM, 10 TB egress/month, card needed at signup, idle reclamation) are **[UNVERIFIED]** — [Oracle Free Tier](https://www.oracle.com/cloud/free/)

**Google Cloud Free Tier (Cloud Run)**
- Cloud Run: 2M requests/month, 180,000 vCPU-seconds, 360,000 GB-seconds, 1 GB egress/month from North America. Firestore: 1 GiB plus 50K reads, 20K writes and 20K deletes per day. One e2-micro VM in us-west1, us-central1 or us-east1. "A Google Cloud billing account is required to access the Google Cloud Free Tier." The $300/90-day trial needs a card — [GCP free features](https://docs.cloud.google.com/free/docs/free-cloud-features)

**AWS Free Tier (credit model)**
- New accounts get $100 in credits immediately, plus up to $100 more from exploring services ("up to $200 over 6 months"). "The account closes on its own 6 months after you open it or when your credits run out, whichever comes first" unless you convert to Paid. "30+ AWS services are always free within monthly usage limits" (not itemized on the page) — [AWS Free](https://aws.amazon.com/free/)
- Start date (believed 15 Jul 2025), card requirement and always-free figures (Lambda 1M req, CloudFront 1 TB) are **[UNVERIFIED]**.

**Surge**
- Free: custom domains free, automatic HTTPS certificates, no bandwidth billing or cap, project ≤ 450 MB and 10,100 files. Commercial use not addressed. Static only — [Surge pricing](https://surge.sh/pricing)

**Codeberg Pages**
- Migrated from Pages Server v2 to git-pages. "Pages Server v2 has already been disabled for new users due to abuse". git-pages supports custom domains. Size limits are not stated. Codeberg's terms (focused on free/open-source content) were not fetched **[UNVERIFIED]** — [Codeberg Pages docs](https://docs.codeberg.org/codeberg-pages/)

**Heroku**: no free dynos (removed 2022) **[UNVERIFIED in this pass]**.

### Inferences
- Cloudflare's static-asset requests are billed separately from Worker invocations. So asset traffic should not use up the 100k/day Worker quota unless `run_worker_first` routes asset paths through the Worker. Docs do not literally say "does not count toward 100k/day", but they say asset requests are "free and unlimited" and that only Worker-script requests are billed.
- The 25 MiB per-file cap on Workers/Pages means 30 MB splats will **not** deploy as static assets. Split or compress them under 25 MiB, or put them in R2 (R2 free limits were not checked here).
- The 10 ms CPU/request on Workers Free is fine for a proxy to an external LLM API (network wait does not count as CPU), D1 queries and OAuth redirects. Heavy JSON or crypto work may hit it.
- Vercel Hobby (non-commercial), Azure SWA Free ("personal projects"), Deno Deploy ("personal use", shutting down) and GitHub Pages (business-focus restriction) are weak fits for a site that solicits paid work.

### Gaps
- Vercel ToS non-commercial wording not quoted this pass.
- Netlify Self-Serve Agreement and AUP not read. Netlify per-file size limit and what happens to a site when 300 credits run out (pause?) not confirmed.
- Render numeric bandwidth and build-minute figures. Oracle Always Free (403). AWS always-free item list.
- Firebase Spark custom-domain wording. Azure card requirement. Codeberg ToS commercial rules.

## 2. Which platforms serve 5–30 MB static binaries efficiently (CDN, caching, range requests)?

### Takeaway
Cloudflare Workers/Pages is verified to serve global-CDN-cached assets for free and without limit, but only up to 25 MiB per file. Range-request support was not confirmed from docs. Netlify, Vercel, Azure and GitHub Pages have bandwidth caps that heavy 3D assets will use up fast.

### Cited Findings
- Cloudflare caches static assets on its network with tiered caching. Asset requests are free and unlimited. Per-file max is 25 MiB — [CF static assets](https://developers.cloudflare.com/workers/static-assets/); [CF billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/); [CF limits](https://developers.cloudflare.com/workers/platform/limits/)
- Netlify Free bandwidth costs 20 credits/GB against 300 credits/month, so about 15 GB/month if spent only on bandwidth (my arithmetic) — [Netlify credits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- Vercel Hobby: 100 GB Fast Data Transfer/month — [Vercel Hobby](https://vercel.com/docs/plans/hobby)
- GitHub Pages: soft 100 GB/month, 1 GB site — [GH Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- Azure SWA Free: 100 GB/month with no overage, 250 MB app size — [Azure SWA quotas](https://learn.microsoft.com/en-us/azure/static-web-apps/quotas)
- Firebase Spark: 360 MB/day transfer (about one 30 MB splat for 12 visitors/day) — [Firebase pricing](https://firebase.google.com/pricing)
- Surge: no bandwidth cap, 450 MB project limit — [Surge pricing](https://surge.sh/pricing)

### Inferences
- Rough math: 1 visitor loading 100 MB of 3D assets means 1,000 visitors use about 100 GB. That puts Vercel, GitHub Pages and Azure at their monthly caps, Netlify Free at about 150 visitors, and Firebase Spark far below that. Cloudflare has no asset-bandwidth meter.
- Azure SWA's 250 MB and Surge's 450 MB size caps may be too small for a large set of splats.

### Gaps
- HTTP Range-request support on Cloudflare static assets, Netlify, Vercel and GitHub Pages was not confirmed from official docs. Test with `curl -r`.
- R2 free tier (storage and egress) not fetched. It is the natural place for files over 25 MiB.

## 3. Best $0 combinations (static + tiny API + tiny DB, commercial use allowed)

### Takeaway
Best single-vendor choice: **Cloudflare Workers with static assets + one Worker (TypeScript) + D1**. Everything is on the free plan, with no commercial restriction found, no sleep, and generous DB limits. Key constraint: keep each asset ≤ 25 MiB. Runner-up: Netlify Free (static + Functions + free forms) inside a 300-credit hard cap.

### Cited Findings
- Workers Free: 100k Worker requests/day, 10 ms CPU, 5 cron triggers, static assets free and unlimited — [CF limits](https://developers.cloudflare.com/workers/platform/limits/); [CF billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- D1 Free: 5M reads/day, 100k writes/day, 5 GB — [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- Cloudflare terms: no non-commercial clause. Card data must not be processed on Free properties — [Cloudflare Terms](https://www.cloudflare.com/terms/)
- Netlify: form submissions free, functions metered as compute credits, hard cap, never charged — [Netlify credits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- Render Free web services sleep after 15 min (about 1 min cold start) and free Postgres expires after 30 days, so it is unfit for an always-on API/DB — [Render free](https://render.com/docs/free)
- GCP Cloud Run free tier needs a billing account — [GCP free](https://docs.cloud.google.com/free/docs/free-cloud-features). The AWS free plan closes after 6 months or when credits run out — [AWS Free](https://aws.amazon.com/free/)

### Inferences
- Ranked options:
  1. Cloudflare Workers (assets + API + D1).
  2. Cloudflare Pages with Functions + D1 (same quotas; Functions count against Workers requests).
  3. Netlify Free.
  4. GitHub Pages or Surge for static plus a Cloudflare Worker + D1 for the API. This adds no value over option 1.
- Avoid as primary: Vercel Hobby (non-commercial), Firebase Spark (360 MB/day, no functions), Render (sleep, Postgres expiry), Deno Deploy (shutdown), AWS and GCP (card, billing account, time-limited credits), Oracle (card, VM ops burden).
- Scheduled DB cleanup or rate-limit window resets fit in the 5 free Cron Triggers.

### Gaps
- Cloudflare Workers KV and Rate Limiting binding free quotas not fetched.
- Cold-start figures for Workers are not stated on the fetched pages. Startup limit is 1 s.

## 4. 2025–2026 free-tier changes

### Takeaway
Big changes: Netlify credit-based pricing (Sep 2025), AWS credit-based free plan with 6-month closure, Azure SWA Dedicated retired (Oct 2025), Deno Deploy shutdown announced (Oct 2026, ends about Apr 2027), Codeberg Pages v2 closed to new users, Fly.io's legacy free allowance discontinued (Oct 2024).

### Cited Findings
- Netlify credit-based plans from 4 Sep 2025; legacy accounts grandfathered, switching irreversible — [Netlify](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- AWS: $100 plus up to $100 credits; account closes after 6 months or when credits run out — [AWS Free](https://aws.amazon.com/free/) (start date **[UNVERIFIED]**, believed Jul 2025)
- Azure SWA Dedicated plan "Retired effective October 31st, 2025" — [Azure SWA plans](https://learn.microsoft.com/en-us/azure/static-web-apps/plans)
- Deno Deploy sunset announced 9 Oct 2026, about 6 months of operation left — [Deno blog](https://deno.com/blog/cloudflare); [Deno Deploy pricing](https://deno.com/deploy/pricing)
- Codeberg Pages migrated to git-pages; v2 disabled for new users — [Codeberg Pages](https://docs.codeberg.org/codeberg-pages/)
- Fly.io plans discontinued Oct 2024; new accounts get $1 credit, $5/month with a card — [Fly.io pricing](https://docs.fly.io/about/pricing)
- Cloudflare terms updated 12 Sep 2025 (Self-Serve) and 28 Sep 2026 (service-specific) — [CF Terms](https://www.cloudflare.com/terms/); [CF App Services terms](https://www.cloudflare.com/service-specific-terms-application-services/)

### Inferences
- The trend is toward credit or metered free tiers with hard caps (Netlify, AWS, Fly). Cloudflare's unmetered static assets stand out for asset-heavy sites.

### Gaps
- Heroku (free dynos removed Nov 2022) and Render free-tier changes in 2025–26 not verified from official changelogs this pass.
