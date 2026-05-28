# Capybara Birthday Site v2

A cleaner, multi-page capybara birthday website.

## Quick edits

Open `config.js` and change:

```js
friendName: "birthday girl",
senderName: "Brandon",
recipientEmail: "email25bwang@gmail.com",
scheduleStart: "2026-05-31",
scheduleDays: 21,
formspreeEndpoint: "",
personalPhotos: []
```

## Add personal photos

1. Put image files in `assets/photos/`.
2. Add them to `personalPhotos` in `config.js`:

```js
personalPhotos: [
  "assets/photos/photo-1.jpg",
  "assets/photos/photo-2.jpg",
  "assets/photos/photo-3.jpg"
]
```

The upload button on the photo page is just a local preview. It does not permanently save photos after the page refreshes, because a static site is not a database, tragically.

## Make scheduler notifications automatic

The site works immediately with the email-draft fallback. When she picks a day and clicks send, it opens a pre-filled email to the recipient email. She must still hit send.

For real automatic email notifications:

1. Create a Formspree form.
2. Copy your endpoint, which looks like `https://formspree.io/f/xxxxxxx`.
3. Paste it into `formspreeEndpoint` in `config.js`.
4. Upload the site to your host.

## Hosting

Upload this folder to GitHub Pages, Netlify, Vercel, or Cloudflare Pages. No build step needed.

## Files

- `index.html` has the page structure.
- `styles.css` controls the visual design.
- `config.js` is the main customization file.
- `app.js` has the interactions.
- `assets/` contains cropped capybara images and the cursor.
