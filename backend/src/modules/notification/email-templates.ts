export const charityPendingTemplate = (name: string) => ({
  subject: "FoodShare — Charity Registration Received",
  html: `
    <p>Hi ${name},</p>
    <p>Thanks for registering as a charity on FoodShare. Your account is now pending review by our team.</p>
    <p>While pending, you can browse listings and claim exactly like a regular user. We'll email you the moment your account is verified.</p>
  `,
});

export const charityVerifiedTemplate = (name: string) => ({
  subject: "FoodShare — You're Verified!",
  html: `
    <p>Hi ${name},</p>
    <p>Your charity account has been verified. You're all set to continue using FoodShare.</p>
  `,
});

export const newListingNearbyTemplate = (name: string, itemDescription: string) => ({
  subject: "FoodShare — New listing near you",
  html: `
    <p>Hi ${name},</p>
    <p>A new listing just went live near you: <strong>${itemDescription}</strong>.</p>
    <p>Open the app to view it and claim before it's gone.</p>
  `,
});

export const adminNewCharityTemplate = (charityName: string, charityRegNumber: string) => ({
  subject: "FoodShare Admin — New Charity Pending Verification",
  html: `<p>A new charity registered and needs verification:</p><p><strong>${charityName}</strong> (Reg #: ${charityRegNumber})</p>`,
});