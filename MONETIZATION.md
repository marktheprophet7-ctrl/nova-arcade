# NOVA ARCADE — free ad monetisation setup

This is a public deployment checklist. **Ads are not yet active**, and NOVA ARCADE has no AdSense publisher ID connected.

## 1. Choose ad-compatible hosting

The Vercel Hobby plan is limited to personal, non-commercial use: https://vercel.com/docs/plans/hobby
Do not enable revenue-generating ads on Vercel Hobby.

For $0 hosting, Netlify's Free plan explicitly permits commercial projects:
https://www.netlify.com/blog/introducing-netlify-free-plan/

* Sign up at https://app.netlify.com/ using GitHub.
* Select **Add new project > Import an existing project > GitHub**.
* Choose **marktheprophet7-ctrl/nova-arcade**, production branch **main**.
* This is a static HTML site: no build command, publish directory **.** (repository root).
* Deploy, open the new public `*.netlify.app` URL and verify multiple games work.
* Optional: attach a custom domain you control for stronger branding and easier long-term ad setup. A custom domain normally costs money; it is not a requirement of Netlify's free hosting.
* Do not publish a protected/password-only deployment as the submitted AdSense site; Google's reviewers and crawlers need access.

## 2. Apply for AdSense (no application fee)

https://adsense.google.com/start/

AdSense eligibility: original, high-quality content, policy compliance, age 18+, site ownership and accessible HTML.
https://support.google.com/adsense/answer/9724

On AdSense select **Sites > New site**, enter your production site's address, then select the site verification method. Copy the publisher script or meta tag shown by AdSense. Only deploy **your actual publisher ID**. Approval is not automatic.
https://support.google.com/adsense/answer/12169212

## 3. Set up ads.txt (once your publisher ID exists)

Create the root file `ads.txt` in this repository with **the exact line from your AdSense account** (example only, do not publish fake values):

```text
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

Replace the example ID. Verify `https://YOUR-SITE/ads.txt` is publicly readable. The account may take time to detect it.
https://support.google.com/adsense/answer/12171612

## 4. Add unobtrusive ads after approval

* Use a banner **between homepage sections**, and optionally **below a game description or after the game**, with clear separation from controls.
* Do not put ads over the playable canvas, next to action buttons, or in positions that encourage accidental taps.
* Never click your own ads, request clicks, or fabricate page views.
* Keep original games and explanatory content available for Google's site review.

Ad placement policy: https://support.google.com/adsense/answer/1346295

For **full-screen between-game ads** and **opt-in rewarded ads**, the H5 Games Ad Placement API requires a separate eligibility application **and an approved AdSense account**:
https://developers.google.com/ad-placement/docs/signup

## 5. Privacy and consent

The website includes `about.html`, `privacy.html` and `contact.html`. Update `privacy.html` **before advertising is enabled** to disclose your actual ad provider and data uses.

For personalized ads in the UK, EEA and Switzerland, Google's publisher requirements include a Google-certified consent-management platform supporting IAB TCF. AdSense's Privacy & messaging tools can help:
https://support.google.com/adsense/answer/13554116

## Recommended initial placement

Start with one ad **between homepage game sections**, and one **below a game’s instructions, away from gameplay controls**. Do not add rewarded/interstitial ads before separate H5 Games approval.

**What is still needed from the site owner?** A free hosting account permitting ads, an AdSense application and approval, and the real `ca-pub-...` publisher ID. Ads cannot legitimately display or generate revenue without those external steps.
