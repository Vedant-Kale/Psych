# RMIT University student resources for building, hosting and deploying an AI portfolio site (Master of AI, late 2026)

Research date: 24 Nov 2026. About 15 searches and fetches. Official RMIT pages were used first. Items marked **[UNVERIFIED]** have no RMIT source found.

## Q1. What software and cloud access does RMIT give students?

### Takeaway
RMIT's official student software is office, design and learning tools: Microsoft 365, Adobe, Miro, MATLAB, EndNote, myDesktop and LinkedIn Learning. RMIT runs no central student cloud-credit programme for Azure, AWS or GCP. Cloud access comes through specific courses (AWS Academy Learner Labs) or research hubs (RACE and RAIL), which are aimed at researchers and PhD students, not coursework masters students.

### Cited Findings
- RMIT says some software is free only for students in particular programs or courses, while other titles are free to all students. — [RMIT Free software and apps](https://www.rmit.edu.au/students/study-support/online-learning-tools)
- **Microsoft 365:** free for all students, including Word, Excel, SharePoint, OneDrive and Teams. To install, sign in at Microsoft365.com with your student email and select "Install Office". The page gives no OneDrive storage quota. — [RMIT Software and apps](https://www.rmit.edu.au/students/support-services/it-support-systems/software-apps)
- **Adobe:** all students and staff get free Adobe Express (Premium). Full Creative Cloud is limited to students who need it for their studies. Access is via the RMIT Adobe Creative Campus page. — [RMIT Software and apps](https://www.rmit.edu.au/students/support-services/it-support-systems/software-apps); [RMIT Adobe Creative Campus](https://www.rmit.edu.au/library/adobe); [2024 Adobe access change news](https://www.rmit.edu.au/students/news/2024/aug/changes-adobe-creative-cloud)
- **Miro Enterprise:** sign in via au.miro.com/sso/login with your RMIT email. RMIT warns not to store private or sensitive information there. — [RMIT Software and apps](https://www.rmit.edu.au/students/support-services/it-support-systems/software-apps)
- **MATLAB and EndNote:** listed, but the full eligibility list sits behind an RMIT ID login. **AutoCAD and MYOB:** available through myDesktop, a virtual RMIT desktop. — [RMIT Software and apps](https://www.rmit.edu.au/students/support-services/it-support-systems/software-apps); [myDesktop](https://www.rmit.edu.au/students/support-services/it-support-systems/mydesktop)
- The public software page does not mention Azure, AWS, GitHub, JetBrains or Copilot. — [RMIT Software and apps](https://www.rmit.edu.au/students/support-services/it-support-systems/software-apps)
- **LinkedIn Learning:** a Library-licensed collection. Sign in with "organisation" login and RMIT credentials, or link a personal LinkedIn account. Support contact: collection.support@rmit.edu.au. — [RMIT Library LinkedIn Learning](https://www.rmit.edu.au/library/borrowing-and-collections/collections/linkedin-learning); [RMIT LinkedIn Learning PDF guide](https://www.rmit.edu.au/content/dam/rmit/documents/library/linking-and-embedding/LinkedInLearning.pdf)
- **RACE (RMIT Advanced Computing Ecosystem):**
  - An AWS-based cloud supercomputing hub with a self-serve portal and a service catalogue with cost estimates. Contact: race@rmit.edu.au. The FAQ lists no eligibility, cost or GPU details. — [RACE FAQ](https://rmit.edu.au/partner/hubs/race/faq); [RACE hub](https://www.rmit.edu.au/partner/hubs/race)
  - RMIT reports that RACE has onboarded more than 800 researchers and PhD students. Funded AWS-credit schemes target PhD students and early-career researchers. A researcher credited RACE GPU servers with cutting ML training time. — [RACE hub](https://www.rmit.edu.au/partner/hubs/race); [RMIT news Mar 2024](https://www.rmit.edu.au/news/all-news/2024/mar/race-hub); [RMIT news 2022 launch](https://www.rmit.edu.au/news/all-news/2022/oct/race-hub-launch)
- **RAIL (RMIT AWS Innovation Lab):**
  - Builds on RACE and serves "researchers, students and partners". It offers AWS cloud and AI services, training workshops and student internships.
  - Entry is through a competitive Merit Allocation Scheme for RMIT college challenges, or "Bring Us Your Challenge" for external partners.
  - It has no individual student sign-up and mentions no credits. Contact: rail@rmit.edu.au.
  - Source: [RAIL](https://www.rmit.edu.au/partner/hubs/rail)
- **AWS Academy (course-dependent):** some RMIT cloud courses use AWS Academy Cloud Foundations and AWS Learner Labs. Examples are ISYS7598 "Configure cloud services" and ISYS7597 "Build and deploy resources on cloud platforms". These are vocational and TAFE-level course pages. RMIT Online has also joined AWS Academy. — [ISYS7598](https://www1.rmit.edu.au/courses/C4424ISYS7598C2545); [ISYS7597](https://www1.rmit.edu.au/courses/C5402ISYS7597C2545); [RMIT Online joins AWS Academy](https://online.rmit.edu.au/blog/RMIT-Online-joins-AWS-Academy)

### Inferences
- A Master of AI student's realistic RMIT-provided cloud is an AWS Academy Learner Lab, and only if enrolled in a course that uses one, such as a postgraduate cloud computing elective. Learner Labs are typically sandboxed, credit-capped and time-limited sessions, so they do not suit a permanently hosted portfolio. **[UNVERIFIED for RMIT Master of AI courses specifically]**
- RACE and RAIL are research infrastructure. Using them to host a personal portfolio would almost certainly fall outside their purpose and the IT Acceptable Use Standard (see Q4).
- The useful "free cloud" for a portfolio comes from vendor student programmes that verify RMIT student status, not from RMIT itself. Examples are GitHub Student Developer Pack and Azure for Students. See Q5.

### Gaps
- No public RMIT page lists JetBrains, GitHub Education or Azure Dev Tools for Teaching (Azure Education Hub) as RMIT-provided. These are vendor programmes that verify student status. **[UNVERIFIED whether RMIT has an institutional Azure Dev Tools subscription]**
- The full software catalogue sits behind an RMIT login and could not be read.
- No OneDrive quota was found. Microsoft's education default is often 1 TB or less, but universities set their own limits. **[UNVERIFIED]**
- No evidence was found of Google Cloud education credits in RMIT courses.
- Whether the Master of AI includes a course using AWS Academy, Azure or GCP labs could not be confirmed. Check the program structure and the Canvas course pages.
- RACE GPU instance types, pricing and eligibility for coursework students are not public.

## Q2. Does RMIT offer web hosting for student personal pages or projects?

### Takeaway
RMIT offers no general personal web hosting for students. The School of Computing Technologies servers (titan and jupiter) do serve coursework pages from user home directories, but their login banner restricts use to coursework.

### Cited Findings
- The jupiter.csit.rmit.edu.au login banner (per search snippet) says all activities on School of CS & IT equipment "must be directly related to your course work". The titan.csit.rmit.edu.au banner says it is for authorised users only and activity may be monitored. — [jupiter motd](https://jupiter.csit.rmit.edu.au/motd.txt); [titan motd](https://titan.csit.rmit.edu.au/motd.txt). A direct fetch was refused (connection refused, likely on-campus or VPN only), so the quotes come from search-index snippets.
- Example of a coursework page served from a user directory: [jupiter ~e121273/wp/week1](https://jupiter.csit.rmit.edu.au/~e121273/wp/week1/about.html)
- RMIT clubs get website and email resources through RUSU and RMIT, but that is for clubs, not individuals. — [Club website, email and postal address](https://www.rmit.edu.au/students/student-life/clubs-societies/resources/website-email-postal-address)

### Inferences
- titan and jupiter are fine for course assignments. They are not suitable for a public personal portfolio: the coursework-only rule applies, access is lost at graduation, and they are likely reachable only on campus or over VPN.
- Host the portfolio on external free tiers such as GitHub Pages, Vercel, Netlify or Cloudflare Pages, ideally through the GitHub Student Pack.

### Gaps
- No official RMIT documentation on public_html setup or student web hosting was found.

## Q3. Does RMIT provide generative AI tools or APIs, and can they be used from a public website?

### Takeaway
RMIT provides Val, an in-house generative AI chatbot on Azure in Australia East, free to students. It is a web chat UI at val.rmit.edu.au with no documented public API. It cannot legitimately power a public website's AI feature. RMIT's Microsoft Copilot Chat availability for students could not be confirmed from public RMIT pages.

### Cited Findings
- Val is reached via "Launch Val" at https://val.rmit.edu.au/. It is "Powered by advanced AI models".
- RMIT records prompts and responses, de-identified. Data is stored in Azure Australia East.
- Students must not enter personal, sensitive or health information.
- Use must comply with the Val Terms of Use and the IT Acceptable Use Standard.
- The page mentions no API or embedding.
- Source: [RMIT Val page](https://www.rmit.edu.au/students/support-services/study-support/val)
- Data shared with Val "stays within RMIT" and is not shared with OpenAI or other external organisations. — [RMIT Software and apps](https://www.rmit.edu.au/students/support-services/it-support-systems/software-apps)
- Eligibility: students at Australian campuses, RMIT Vietnam and RMIT UP, with RMIT Online mentioned in later news. Model descriptions differ across pages (GPT-4o vs GPT-4.1). Features include image and diagram generation and personas such as Writing Help and "Franklin". — [Val new features Oct 2025](https://www.rmit.edu.au/students/news/2025/oct/val-new-features); [Five ways genAI can support your studies (Mar 2026)](https://www.rmit.edu.au/students/news/2026/mar/five-ways-gen-ai-can-support-studies); [Franklin persona](https://www.rmit.edu.au/students/news/2025/may/franklin-chat-bot); [RMIT Vietnam Val](https://www.rmit.edu.vn/students/support/val)
- The IT Acceptable Use Standard clause 9 says AI use "must comply with RMIT policies, data protection requirements, and be aligned to intended business purposes". — [IT Acceptable Use Standard](https://policies.rmit.edu.au/document/view.php?id=76)
- Comparable universities (UNSW, Charles Sturt) give students Microsoft 365 Copilot Chat under enterprise data protection via institutional login. Microsoft says Copilot Chat is generally available for students aged 13 and over. No RMIT page confirming this was found. — [UNSW Copilot Chat](https://www.unsw.edu.au/bengaluru/myit/using-copilot-chat); [Microsoft Tech Community](https://techcommunity.microsoft.com/blog/educationblog/microsoft-365-copilot-chat-for-students-13/4440370)

### Inferences
- Val is a personal study and coding assistant only. Proxying or scraping it into a public site would break its terms (logged-in individual use, the AUS "legitimate RMIT purposes" rule, and the data rules), and no API exists.
- The portfolio's AI feature needs its own API key from a commercial provider or a free tier (OpenAI, Anthropic, Google Gemini, Groq, Hugging Face, or GitHub Models via the Student Pack). **[general knowledge, not RMIT-sourced]**
- If RMIT accounts have Copilot Chat, it is likewise for personal productivity only, not a backend.

### Gaps
- The Val Terms of Use document was not retrieved. The exact wording on commercial or external use is unknown.
- RMIT's Microsoft 365 Copilot Chat status for students is unconfirmed. Check the Microsoft 365 portal while logged in.

## Q4. What do RMIT IT policies say about personal, public-website or commercial use?

### Takeaway
The RMIT **Information Technology – Acceptable Use Standard** applies to students. It allows "reasonable non-commercial personal" use, bans commercial use other than legitimate RMIT purposes, and requires use for legitimate RMIT purposes. A freelance or commercial portfolio must not run on RMIT accounts, licences or infrastructure.

### Cited Findings
All findings below come from the [IT Acceptable Use Standard](https://policies.rmit.edu.au/document/view.php?id=76) unless another source is named.
- Scope (cl. 2): applies to "all students, staff, contractors, visitors and any other parties who have access to the IT assets of RMIT University".
- Cl. 4: "Access and use of IT assets must be for legitimate RMIT purposes, specific to the user's role."
- Cl. 5: "Access and use of IT assets for reasonable non-commercial personal purpose is acceptable". The condition is no unreasonable burden, no incremental cost to RMIT, and no interference with staff duties.
- Cl. 6: use "for any commercial purpose other than legitimate RMIT purposes is not allowed".
- Cl. 9: AI use must comply with RMIT policies and data protection requirements and be aligned to intended business purposes.
- Cl. 36: no software or services "not endorsed by ITS". Cl. 37: no copying or distributing RMIT-licensed software to unauthorised users.
- Cl. 35: no auto-forwarding of RMIT email to personal accounts. Cl. 30: no storing non-public information on non-endorsed locations.
- Cl. 14–15, 18: RMIT conducts surveillance across systems. Access is "a privilege, not a right" and can be withdrawn. Breaches may lead to disciplinary or legal action.
- The standard is current, effective 3 June 2024 per a search snippet. The fetched page showed no date. — [Status and Details](https://policies.rmit.edu.au/document/status-and-details.php?id=76)

### Inferences
- **Personal, non-commercial portfolio:** building it with RMIT-licensed tools is likely acceptable as "reasonable non-commercial personal use". This covers using Office to write a CV or Adobe Express for graphics.
- **Commercial or freelance use:** cl. 6 bars it on RMIT assets. Once the site earns income, do not use RMIT-licensed software such as Adobe CC or Miro to produce client or commercial assets, or RMIT infrastructure to host it. Vendor education licences (Adobe education, GitHub Pack and others) carry their own non-commercial terms too.
- Do not tie the site's hosting, domain, or API billing to the RMIT email. Access ends after graduation, and RMIT accounts are university-controlled.
- IP: RMIT's IP policy generally lets students own IP they create, with exceptions for sponsored or research projects. **[UNVERIFIED — the RMIT IP policy was not fetched]** Check this before showcasing course-project code publicly. Also check academic-integrity rules on publishing assignment solutions.

### Gaps
- The RMIT Intellectual Property Policy and Val Terms of Use were not retrieved.
- No RMIT rule specifically on "hosting a public website" was found beyond the AUS clauses and the titan/jupiter banner.

## Q5. What is the RMIT student email domain, and are there issues verifying with GitHub Education or Azure for Students?

### Takeaway
The student email is `s<studentnumber>@student.rmit.edu.au`, for example s1234567@student.rmit.edu.au. A name alias such as firstname.lastname@student.rmit.edu.au also exists. No RMIT-specific verification problems with GitHub Education or Azure for Students were found.

### Cited Findings
- The RMIT email is the student ID plus "@student.rmit.edu.au", for example s1234567@student.rmit.edu.au. An automatic name alias also exists, for example joe.smith@student.rmit.edu.au. MFA is required for Microsoft 365. — [RMIT Email](https://www.rmit.edu.au/students/support-services/it-support-systems/email); [RMIT ID and password](https://www.rmit.edu.au/students/support-services/it-support-systems/id-password)
- **GitHub Student Developer Pack:**
  - Open to students aged 13+ in a degree or diploma-granting course.
  - Verification accepts a school-issued email, a student ID, or other official proof of enrolment.
  - The pack lists 80+ offers.
  - Sources: [GitHub Education docs](https://docs.github.com/en/education/about-github-education/github-education-for-students); [Pack terms](https://docs.github.com/en/education/about-github-education/github-education-for-students/github-terms-and-conditions-for-the-student-developer-pack); [Pack](https://education.github.com/pack)

### Inferences
- Use the student.rmit.edu.au address for GitHub Education and Azure for Students verification. **[UNVERIFIED for RMIT]** GitHub applications commonly also need a dated proof of enrolment photo (an enrolment letter or student ID card) and a matching profile name and location. Have an RMIT enrolment confirmation ready.
- Azure for Students (USD 100 credit, no credit card) verifies with the school email. Some university tenants block it, so whether RMIT's tenant allows sign-up must be tested. **[UNVERIFIED, general knowledge]**
- Check the actual RMIT ID format on your own card. Some RMIT IDs and aliases may differ, for example for RMIT Online or partner students.

### Gaps
- No forum or official reports of RMIT-specific GitHub or Azure verification failures were found.
- Not confirmed: whether RMIT is a registered GitHub Global Campus school, or has a GitHub Education partnership or GitHub Copilot Education arrangement.
