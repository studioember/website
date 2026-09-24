# Search discoverability and demand measurement

Owner: Nathan Grey. Start comparing periods only after this version is deployed and custom definitions exist. This is an instrumentation and reporting guide; no live GA4 or Search Console data was available during implementation.

## What to measure

Use these three measures as the primary review. Report raw counts alongside rates and compare the same date range and channel. Neither page exposure nor a contact click establishes qualified demand.

| Measure | Definition | Decision it supports |
| --- | --- | --- |
| Service interest | Users who view Planning or Implementation, plus users selecting each service via `select_content` (`content_type=service`). Keep visits and selections as separate columns; do not add them. | Which path earns attention, including visitors who land directly on a service page? |
| Contact intent rate | In a session containing a service page view, did the visitor subsequently trigger `consultation_click` or `email_click`? Numerator: sessions with at least one such action; denominator: sessions viewing that service. Deduplicate sessions rather than dividing event counts. | Where does attention turn into a willingness to contact? |
| Confirmed discovery bookings | Unique embedded booking completions reported through `generate_lead`, grouped by `service_path` and acquisition channel. A session conversion rate uses sessions with a lead divided by service-view sessions in the same cohort. | Which services produce confirmed discovery calls? |

A session can explore both services and belong to both service cohorts. Cohort totals are not additive. `service_path` is the most recent service context, not proof that the service caused the booking. Review actual inquiries and discovery calls separately for fit and eventual paid work; neither is inferred by this site.

## Event contract

All custom events contain `page_type` (home/planning/implementation/deliverables/about/kubernetes_consulting), `service_path` (planning/implementation/general), and beacon transport. Existing `consultation_click` and `generate_lead` names are preserved for continuity; attribution improves from the deployment date onward.

| Event | Trigger | Additional fields | Meaning / limit |
| --- | --- | --- | --- |
| `page_view` | GA's normal document load | `content_group` is page type | Actual page visits; query/fragment removed from reported page URL. |
| `select_content` | Click a link to another published content page or a deliverable anchor | `content_id`, `content_type`, `cta_location` | Deliberate content choice, including navigation. Service choices use `content_type=service`; sample anchors use `deliverable`; About/Deliverables route links use `page`. |
| `topic_view` | A marked heading is at least 50% visible for 2 continuous seconds while the tab is visible | `content_id` | Exposure once per topic per page load. **Not reading, preference, or a conversion.** Nearby topics can appear together. |
| `faq_open` | Open a question for the first time on this page load | `content_id`, `cta_location=faq` | Questions people investigate. Closing/reopening does not add events. |
| `email_click` | Activate the general-question mailto link | `method=email`, `cta_location` | Email intent only; the site cannot observe whether email was sent. |
| `consultation_click` | Activate a booking link (including direct-link fallback) | `cta_location` | Booking intent only; repeated attempts count again. |
| `generate_lead` | Cal reports `bookingSuccessfulV2` with a valid new UID | `method=cal_com`, `cta_location` | Confirmed embedded booking. UID deduplicates callbacks in memory and is never sent to GA. |

Content IDs:

- Services: `planning`, `implementation`.
- Planning topics: `assessment`, `architecture_roadmap`, `team_enablement`.
- Implementation topics: `platform_foundation`, `recovery`, `handoff`, `gpu_ai`, `vm_migration`, `automation`.
- Illustrative deliverables: `architecture`, `runbook`, `validation`.
- FAQs: `kubernetes_fit`, `planning_independence`, `pricing_scope`, `operator_ownership`.
- About story exposure: `about_delivery`, `about_tooling`, `about_studio`. These retain the current service context (or `general`); reading the biography does not select a service.
- Other selected pages: `about`, `deliverables`.

`cta_location` identifies header, footer, hero, journey, proof, FAQ, closing contact section, or another explicitly labeled section. `unknown` is used if a booking completion arrives without a captured trigger. Values come from code/markup, not visitor text or raw link URLs.

Planning/Implementation page visits or service selections establish service context; Deliverables establishes implementation context. Home/About inherit the most recent service for up to 30 minutes since the last page visit or service selection in the same tab, otherwise `general`. The booking event retains the CTA/service that opened booking. Storage failures fall back to current-page context. Topic exposure does not change the selected service.

## One-time GA4 configuration

These are account-side actions, **not applied by the repository**. Use the GA4 property serving `G-NYVTLFQRSZ`.

1. In **Admin → Custom definitions**, create event-scoped dimensions for `service_path`, `page_type`, `cta_location`, and `content_id`. Use the existing Content group and Content type dimensions for `content_group` and `content_type`. Custom definitions generally need 24–48 hours before reporting; create them before the collection period you intend to analyze. [Google: event-scoped custom dimensions](https://support.google.com/analytics/answer/14239696)
2. Mark **`generate_lead`** as a key event. Keep clicks, FAQ opens, and exposures out of the primary key-event count. Do not assign made-up lead revenue.
3. Review enhanced measurement on the web stream. Keep page views; disable outbound clicks and form interactions if using this event contract, so Cal/mailto activity is not mistaken for extra leads or duplicated in reports. Site search is not applicable. Standard scroll events can remain for broad context but are not topic interest.
4. After deploy, verify events in Realtime and use Tag Assistant/DebugView for detailed QA. Preview/local hosts deliberately never send GA traffic. Do not set `debug_mode` globally or create a test booking just to populate production analytics. Confirm a real, authorized booking later or validate the completion callback in the local test harness.
5. Link the verified Search Console property under **Admin → Product links → Search Console links**. Publish its report collection if needed. This requires the appropriate GA4 and Search Console permissions. [Google: Search Console integration](https://support.google.com/analytics/answer/10737381)

Google's [recommended events reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events) defines `select_content` and `generate_lead`. The other events are site-specific.

## Reports to save

**Demand by service:** in Explore, create a free-form report with Event name and Service path as rows; Total users and Event count as values. Filter to `select_content`, `consultation_click`, `email_click`, and `generate_lead`. Add Page type and CTA location as breakdowns. Keep exposures in a separate tab. Event count shows repeated actions; Total users shows reach.

**Service funnels:** create one session segment for Planning page visitors and another for Implementation page visitors. For each segment, explore the ordered journey from service page view to either contact action and then booking completion, limiting steps to the same session where the reporting interface supports that constraint. If a funnel cannot enforce a same-session sequence, label it as a user funnel; do not report its percentage as the session rate defined above. Also report email intent separately, since email completion cannot be observed. Visitors who book directly from Home/About do not belong in this page-view funnel; inspect their `general` or retained service context in the demand report. Do not interpret funnel drop-off as disinterest without checking booking availability and direct-link bookings.

**Content and questions:** rows Content ID; columns Event name; values Total users/Event count; filter to `topic_view`, `select_content`, `faq_open`. Example-anchor selections are deliberate interest; topic views measure exposure. Do not rank adjacent cards as customer preferences based on visibility alone. Combine this with contact intent and actual conversations before changing the offer.

**Acquisition:** use Traffic acquisition and Landing page reports for Session source/medium, Session campaign, landing page, sessions, and `generate_lead` key events. Segment service pages, then compare rates using comparable traffic and date ranges. Avoid combining first-user acquisition and session acquisition in one denominator.

**Search opportunity:** use Search Console queries and pages to track impressions, clicks, CTR, and position for planning/consulting, workshops/team enablement, Kubernetes implementation, and handoff examples. Filter branded searches separately. Check each route's indexing status before diagnosing low impressions as low demand. Search Console query data is aggregated and cannot identify a visitor or be joined to individual booking events.

Initially review weekly, using rolling 28-day comparisons as traffic accumulates. With few visitors or bookings, prioritize individual inquiries and display counts; a percentage swing from a tiny denominator is not a reliable demand trend. No benchmark or target is assumed.

## Campaign links and data boundaries

Use consistent public campaign slugs, for example:

`https://studioember.com/planning/?utm_source=linkedin&utm_medium=social&utm_campaign=planning_intro&utm_content=profile`

Accepted keys: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`. Values must be 1–80 ASCII letters, digits, underscores or hyphens, beginning with a letter/digit. Never use names, emails, customer identifiers, or secrets as campaign labels. The slug restriction reduces accidental collection; it cannot determine whether an otherwise valid label is personal.

Only accepted campaign values are forwarded to Cal, including after internal navigation in the same tab. Other URL parameters and fragments are excluded from the configured GA page URL, and external referrers are reduced to their origin. Google Signals and ad personalization signals are disabled in the tag configuration. No mailto subject/body, booking payload, booking UID, form text, email address, or user ID is sent by our custom events. GA itself still provides its standard browser/session measurement; this is not anonymous or cookieless analytics. [Google: tag configuration fields](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)

No JavaScript or blocked analytics means no measurement; links continue to work. A booking completed on cal.com after direct navigation is outside the site's completion tracking. Compare with Cal's booking records before calling the site event count a total lead count. No raw webhook or server-side lead pipeline is installed.

## Search maintenance and release checks

- `_data/routes.json` is the published-route inventory used by the sitemap and breadcrumbs. Each page owns its title/description; the base layout provides canonical, Open Graph, and Twitter metadata.
- Structured data describes the organization, principal engineer, breadcrumbs, and relevant services using published facts. It does not promise a rich result or ranking. No fabricated reviews, prices, location, client results, or FAQ rich-result claims.
- Keep useful service language in visible text and descriptive internal links. Keep illustrative labels until actual evidence and publication permission exist. [Google: title links](https://developers.google.com/search/docs/appearance/title-link), [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- After deployment, verify the production `/robots.txt`, `/sitemap.xml`, canonical host/HTTPS redirects, and all six routes. Submit `https://studioember.com/sitemap.xml` in the verified Search Console property, inspect the important routes, and request indexing after the new content is live. Sitemap submission is not a guarantee of indexing.
- Run `yarn build` then `yarn test`; tests exercise event semantics, foreground dwell, deduplication, attribution expiry, blocked storage, mailto metadata, booking fallback, schema references, metadata uniqueness, and crawlable internal links.
- Keep this guide excluded from the public build (`docs/` in `.eleventyignore`).

## Kubernetes consulting campaign

`/kubernetes-consulting/` uses `page_type=kubernetes_consulting` and establishes `service_path=planning`, including when selected from another service page. This makes campaign landing visits distinguishable from the general planning page. Include this landing page in planning-service funnel cohorts, retaining landing-page breakdowns. Existing contact intent and confirmed embedded booking semantics apply. The video placeholder emits no play or lead events.

Example ad destination: `https://studioember.com/kubernetes-consulting/?utm_source=google&utm_medium=cpc&utm_campaign=kubernetes_consulting&utm_content=intro`.
