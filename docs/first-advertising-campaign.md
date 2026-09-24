# First advertising campaign

Destination: `/kubernetes-consulting/`. Audience: development teams and engineering leaders considering Kubernetes or a platform change. Initial offer: a discovery conversation to establish fit for a separately scoped, paid planning engagement.

## Video outline

Aim for a conversational 60–90 seconds. This is a suggested recording length, not a performance claim.

1. **The question:** Considering Kubernetes, but unsure whether it fits your workloads or what it will take to operate?
2. **Introduce yourself:** Nathan Grey, founder and principal engineer at Studio Ember. Briefly connect your development and platform experience to the visitor's problem.
3. **Your approach:** Understand workloads, delivery goals, and operating capacity. Compare options, including simpler services. Explain that paid planning produces decisions and a practical roadmap.
4. **A concrete example:** Briefly describe the preview-environment project already documented on About. Keep claims consistent with that account; do not add unverified metrics or client identities.
5. **Next step:** Invite viewers to book a discovery call to discuss their situation and fit. Distinguish the introduction from detailed paid assessment.

Use clear audio, a simple background, and accurate captions. Put the essential message in page text too. Avoid autoplay.

## Replace the placeholder when the video is ready

The landing template contains a `.consulting-video` element with placeholder copy, `role="img"`, and a placeholder-specific accessible label. Replace that entire element with the real embed; remove the coming-soon copy and placeholder attributes. Do not insert an iframe inside the existing image role.

Use the actual published YouTube video's embed URL, a descriptive iframe title, `loading="lazy"`, `allowfullscreen`, and a responsive 16:9 wrapper. Prefer the `youtube-nocookie.com` embed host and decide third-party consent behavior before launch. Add a direct watch-on-YouTube link and an accessible transcript or equivalent summary. Confirm captions, keyboard operation, and layout on mobile. No YouTube embed or video tracking is installed in this placeholder version.

## Campaign handoff

Suggested public campaign link:

`https://studioember.com/kubernetes-consulting/?utm_source=google&utm_medium=cpc&utm_campaign=kubernetes_consulting&utm_content=intro`

- Keep ads aligned with consulting and assessment rather than promising a free architecture review or a guaranteed implementation outcome.
- Verify live booking availability, actual inquiry delivery, GA4 key events, and ad-platform conversion reporting before spending. Follow `docs/measurement.md`; the repository does not configure accounts.
- Review actual inquiries for fit and track discovery, proposal, and paid-work outcomes separately. Clicks and video views are not leads.
- Publish only after branch review. This change does not launch ads, upload a video, alter Cal settings, or deploy the branch.

## Local checks

Run `yarn build && yarn test`, then `node --check assets/js/analytics.js && node --check assets/js/booking.js`. Preview `/kubernetes-consulting/` at desktop and mobile widths, verify the in-page link and FAQs, and open/close the calendar without submitting a booking.
