/*
  Quick edits go here.
  1. Change friendName.
  2. Add personal photos by putting files in assets/photos and listing them below.
  3. For real automatic notifications, paste a Formspree endpoint into formspreeEndpoint.
     Example endpoint format: https://formspree.io/f/xxxxxxx
     Leave it blank to use the email-draft fallback.
*/
window.BIRTHDAY_CONFIG = {
  friendName: "Angela",
  senderName: "Spencer",
  recipientEmail: "kogomaspencer@gmail.com",

  // Birthday Sunday based on the current build date. Change if needed.
  scheduleStart: "2026-05-31",
  scheduleDays: 21,

  // Optional external notification endpoint. Blank = opens an email draft instead.
  formspreeEndpoint: "",

  // Example: ["assets/photos/photo-1.jpg", "assets/photos/photo-2.jpg"]
  personalPhotos: [],

  // Keep this light. We are not publishing a novel, mercifully.
  dateIdeas: [
    "boba + walk",
    "dessert run",
    "bookstore browse",
    "picnic",
    "coffee + gossip",
    "museum day",
    "farmers market",
    "dinner somewhere cute",
    "movie night",
    "surprise me"
  ]
};
