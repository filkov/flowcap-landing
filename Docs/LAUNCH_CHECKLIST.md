# Flow Capture website — next launch steps

## Public support and privacy contact

Completed on October 14, 2026; keep the operational checks current.

- [x] Create `support@flowcap.me` in Google Workspace and verify inbox access.
- [x] Publish the address and mail links on `/support/`, `/privacy/` and `/mcp/`.
- [x] Replace preview contact notices with the verified contact details.
- [x] Set `FeedbackChannelConfiguration.supportEmail` in the current iOS app worktree.
- [x] Send a non-sensitive self-test and confirm receipt in the support inbox.
- [ ] Verify delivery from an external provider and check spam placement.
- [ ] Confirm the in-app Report a Problem route in the release build.

## App Store publication checks

- [ ] Confirm product page `https://apps.apple.com/app/id6811913058` is public and resolves in launch storefronts. The ID already exists in the app's Settings source; the app is not published yet.
- [ ] Review public use of the official Download on the App Store badge at release. Apple's marketing terms tie its use to apps available for download. The owner explicitly requested the real badge before publication; it currently points to the existing app ID.
- [ ] Enter `https://flowcap.me/support/` as Support URL and `https://flowcap.me/privacy/` as Privacy Policy URL in App Store Connect once contact details are complete.
- [ ] Confirm the provider identity, contact, privacy disclosures and in-app links match the released service and App Store Connect disclosures. Website pages alone do not certify App Review or legal compliance.
- [ ] Keep the app's standard Apple EULA selection aligned with `/terms/` (Terms of Use).
- [ ] Update the existing Supabase-hosted policy and the app's privacy destination when adopting the new website policy URL. No backend or app settings were changed by this website task.
- [ ] Replace preview availability statements in the FAQ, Guides and Support when the app is released.

## Source references

- https://developer.apple.com/app-store/review/guidelines/ — 1.5 support contact and 5.1.1 privacy policy.
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- https://developer.apple.com/app-store/marketing/guidelines/
- https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

The Privacy Policy content comes from the app's current `supabase/functions/privacy-policy/index.ts`, including MCP retention and account deletion. The website section describes this static site's current GitHub Pages hosting, Google Fonts delivery, and absence of advertising/analytics scripts. The Terms page links the same Apple standard EULA already used by the application; it does not introduce a separate custom license.
