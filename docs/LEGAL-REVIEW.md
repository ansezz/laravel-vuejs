# Legal pages: points for a lawyer to confirm

The privacy policy, terms, DMCA policy and accessibility statement were written in plain language to cover the GDPR/UK GDPR,
Malaysia's PDPA 2010 (with the 2024 amendments), Morocco's Law 09-08 and the CCPA/CPRA. They describe only what the Site
actually does (see `worker/index.ts`, `wrangler.jsonc` and `src/pages/[slug].astro`). They are **not legal advice**, and
these points need a qualified review before we rely on them:

1. **Controller identity and address.** GDPR Art. 13 and PDPA s.7 expect the controller's identity and contact details. The
   policy names Anass Ez-zouaine and the contact email, but no postal address. Decide whether to add one (or a business entity).
2. **PDPA language requirement.** PDPA s.7(3) requires the privacy notice in both Bahasa Malaysia and English. Only an
   English version exists. A certified Malay translation is needed if PDPA applies.
3. **PDPA 2024 amendments.** Confirm whether a Data Protection Officer must be appointed/registered and how the breach
   notification duty applies to a project of this size.
4. **EU/UK representative (GDPR Art. 27).** We are not established in the EU/UK. If the Site is considered to target EU/UK
   users (newsletter, job listings), an Art. 27 representative may be required; the occasional-processing exemption may apply.
5. **Morocco CNDP.** Law 09-08 may require a declaration to the CNDP if processing is carried out in Morocco or with means
   located there. Confirm whether it applies.
6. **International transfers.** The policy relies on Cloudflare's DPA (Standard Contractual Clauses, Data Privacy Framework)
   and on Microsoft's terms for the Outlook.com mailbox the contact address forwards to. A consumer Outlook.com mailbox has
   no DPA; consider a business mailbox (Microsoft 365 / Google Workspace with a DPA) for receiving form mail.
7. **Disqus.** Comments load only after a click (treated as consent). Confirm this is enough, or whether a separate
   explicit consent dialog is wanted. Disqus may show ads inside its iframe on the free plan.
8. **CCPA/CPRA thresholds.** The project very likely falls below CCPA thresholds; the policy still offers the rights.
9. **Terms: governing law and jurisdiction.** Not set. Choose the governing law (e.g. Malaysia) and venue.
10. **DMCA designated agent.** The DMCA safe harbour requires registering a designated agent with the U.S. Copyright Office
    (fee-based). Without it, the policy is a courtesy process, not a safe-harbour claim.
11. **Retention periods** (12 months for form submissions, 30 days for IP hashes and unsubscribed addresses) are enforced by
    the Worker's daily cron. Confirm they match the business need.
