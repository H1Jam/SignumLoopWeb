# SignumLoop — coming soon

A responsive, static landing page for SignumLoop Inc. Plain HTML, CSS and JavaScript; no framework, build step, CDN, third-party fonts, analytics or backend.

## Preview

Open `index.html` directly in your browser, or serve this folder:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Visit http://127.0.0.1:8080. The copy-email button is shown only when the browser supports the Clipboard API in a secure context. Email links work without JavaScript. No subscriptions are collected.

## Publish to GitHub Pages

1. Copy these files into the root of your `H1Jam/SignumLoopWeb` checkout. Preserve its existing `.git` folder and `.gitattributes` file.
2. Review, commit and push the website files to your `main` branch.
3. In the repository, open **Settings → Pages**. Choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
4. Set **Custom domain** to `signumloop.ca`. The included `CNAME` file records this primary domain; it does not configure DNS or enable the domain by itself.
5. Configure DNS at your domain provider using GitHub's current custom-domain instructions, then enable **Enforce HTTPS** when GitHub makes it available.

GitHub documentation:

- [Publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Custom domain and DNS](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Verify your domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

`signumloop.ca` is the initial primary domain. To use `.com` as primary instead, update `CNAME`, the canonical and Open Graph URLs in `index.html`, `robots.txt` and `sitemap.xml`. To use both, configure the other domain to redirect to the primary using an HTTPS-capable redirect service from your domain/DNS provider. Pointing both domains at GitHub is not a substitute for configuring a redirect.

## Edit

| File | Purpose |
| --- | --- |
| `index.html` | Page content, email links, SEO and social metadata |
| `assets/styles.css` | Layout, colors, typography and responsive styles |
| `assets/main.js` | Email copy and copyright year |
| `assets/favicon.svg` | Original vector brand mark |
| `assets/social-card.png` | Social sharing image |
| `CNAME` | Primary GitHub Pages custom domain |

Public contact: **admin@signumloop.com**. Update both `index.html` and `assets/main.js` if it changes.

The static diagram shows the hardware-in-the-loop signal path and AI test supervision. It works with JavaScript disabled.
