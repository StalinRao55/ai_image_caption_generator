export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "CaptionAI <noreply@localhost>";
  if (!key) {
    console.info(`[email:dev] to=${to} subject=${subject}\n${html}`);
    return { mock: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    throw new Error(`Email send failed: ${await res.text()}`);
  }
  return res.json();
}
