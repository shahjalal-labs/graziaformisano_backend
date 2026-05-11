export const privacyPolicy = () => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BizMeet - Privacy Policy</title>
  <meta name="description" content="Privacy Policy for the BizMeet platform services" />
  <style>
    :root{
      --bg:#f7f8fb;
      --card:#ffffff;
      --muted:#6b7280;
      --accent:#0f766e;
      --danger:#dc2626;
      --success:#16a34a;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }
    html,body{height:100%}
    body{
      margin:0;
      background:var(--bg);
      color:#0f172a;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      line-height:1.5;
      padding:32px;
    }
    .wrap{max-width:980px;margin:0 auto}
    header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}
    header h1{font-size:20px;margin:0;color:var(--accent)}
    header p{margin:0;color:var(--muted);font-size:13px}
    .card{background:var(--card);border-radius:12px;padding:20px;box-shadow:0 6px 18px rgba(15,23,42,0.06);margin-bottom:16px}
    h2{margin:0 0 10px 0;font-size:16px;color:#08101a}
    h3{margin:8px 0;color:#0b1220;font-size:14px}
    p{margin:8px 0;color:#0b1220}
    ul{margin:8px 0 8px 20px;color:var(--muted)}
    ol{margin:8px 0 8px 20px;color:var(--muted)}
    .muted{color:var(--muted);font-size:13px}
    .pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#eef6f4;color:var(--accent);font-weight:600;font-size:12px}
    .section-grid{display:grid;grid-template-columns:1fr;gap:12px}
    @media(min-width:800px){ .section-grid{grid-template-columns:1fr 360px} }
    .summary{font-size:14px;color:#0b1220}
    .cta{display:inline-block;padding:10px 14px;border-radius:8px;background:var(--accent);color:white;text-decoration:none;font-weight:600}
    footer{margin-top:18px;font-size:12px;color:var(--muted);text-align:center}
    .subtle{font-size:13px;color:var(--muted);margin-top:6px}
    .legal-list li{margin-bottom:6px}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>BizMeet Platform</h1>
        <p class="muted">Privacy Policy</p>
      </div>
      <div style="text-align:right">
        <span class="pill">Last updated: April 22, 2026</span>
        <div class="subtle">Privacy policy document</div>
      </div>
    </header>

    <section class="card">
      <h2>Project Overview</h2>
      <p class="summary">
        BizMeet is a social platform  that powers account creation, authentication, profile setup,
        posts, stories, comments, followers, events, notifications, file uploads, and subscription payments.
        This Privacy Policy explains how information is collected, used, shared, and protected when you use
        the platform APIs and related services.
      </p>
    </section>

    <section class="card">
      <h2>1) Information We Collect</h2>
      <ul class="legal-list">
        <li>Account data: username, email, encrypted credentials, and role/state details.</li>
        <li>Profile data: bio, profession, city, education, skills, and related setup information.</li>
        <li>Content data: posts, stories, comments, replies, event details, and uploaded media links.</li>
        <li>Relationship data: follower/following relations, room/message metadata, and notification records.</li>
        <li>Location data: latitude/longitude where users provide location for profile or event features.</li>
        <li>Technical data: timestamps, device push token (FCM), and service operation logs.</li>
        <li>Subscription data: plan metadata, Stripe subscription/payment IDs, and billing status.</li>
      </ul>
      <p class="muted">
        Payment card details are processed by Stripe and are not stored directly in this backend database.
      </p>
    </section>

    <section class="card">
      <h2>2) How We Use Information</h2>
      <ul class="legal-list">
        <li>To create and secure accounts, authenticate users, and manage access permissions.</li>
        <li>To deliver social features such as publishing content, event participation, and notifications.</li>
        <li>To process subscriptions and maintain payment status through integrated payment providers.</li>
        <li>To monitor abuse, enforce platform rules, and improve service reliability and safety.</li>
        <li>To communicate operational messages, support updates, and policy changes.</li>
      </ul>
    </section>

    <section class="card">
      <h2>3) Legal Basis and Consent</h2>
      <p>
        We process information based on service performance, legitimate interests in protecting the platform,
        compliance obligations, and your consent where required by applicable law.
      </p>
    </section>

    <section class="card">
      <h2>4) Sharing of Information</h2>
      <p class="muted">We may share limited data with trusted processors when needed to operate the service, including:</p>
      <ul class="legal-list">
        <li>Payment processors (for subscriptions and billing events).</li>
        <li>Cloud, storage, and infrastructure providers.</li>
        <li>Email and push notification providers.</li>
        <li>Legal authorities where disclosure is required by law.</li>
      </ul>
      <p class="muted">
        We do not sell personal information.
      </p>
    </section>

    <section class="card">
      <h2>5) Data Retention</h2>
      <p>
        We keep data for as long as needed to provide services, maintain security and audit history,
        resolve disputes, and meet legal obligations. Retention periods vary by data type and operational need.
      </p>
    </section>

    <section class="card">
      <h2>6) Your Rights</h2>
      <p class="muted">Subject to local law, you may have the right to:</p>
      <ul class="legal-list">
        <li>Request access to your personal data.</li>
        <li>Request correction or deletion of inaccurate information.</li>
        <li>Object to certain processing activities.</li>
        <li>Request restriction or portability of your data.</li>
      </ul>
      <p>
        Requests can be made through the official support channel used by the platform.
      </p>
    </section>

    <section class="card">
      <h2>7) Security</h2>
      <p>
        We use reasonable technical and organizational safeguards to protect platform data, including access controls,
        authentication checks, and monitored backend operations. No method of transmission or storage is fully risk-free.
      </p>
    </section>

    <section class="card">
      <h2>8) Cross-Border Processing</h2>
      <p>
        Because service providers may operate in multiple regions, data may be processed outside your home jurisdiction
        in accordance with applicable legal safeguards.
      </p>
    </section>

    <section class="card">
      <h2>9) Policy Updates</h2>
      <p>
        We may revise this Privacy Policy from time to time. Updated versions become effective upon publication
        on official platform channels. Continued use after publication indicates acceptance of the revised policy.
      </p>
    </section>

    <footer class="muted">
      Copyright BizMeet Platform. For privacy requests, contact support through the app.
    </footer>
  </div>
</body>
</html>
`;
};

export const termsandconditions = () => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BizMeet  - Terms and Conditions</title>
  <meta name="description" content="Terms and Conditions for the BizMeet platform services" />
  <style>
    :root{
      --bg:#f7f8fb;
      --card:#ffffff;
      --muted:#6b7280;
      --accent:#0f766e;
      --danger:#dc2626;
      --success:#16a34a;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }
    html,body{height:100%}
    body{
      margin:0;
      background:var(--bg);
      color:#0f172a;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      line-height:1.5;
      padding:32px;
    }
    .wrap{max-width:980px;margin:0 auto}
    header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}
    header h1{font-size:20px;margin:0;color:var(--accent)}
    header p{margin:0;color:var(--muted);font-size:13px}
    .card{background:var(--card);border-radius:12px;padding:20px;box-shadow:0 6px 18px rgba(15,23,42,0.06);margin-bottom:16px}
    h2{margin:0 0 10px 0;font-size:16px;color:#08101a}
    h3{margin:8px 0;color:#0b1220;font-size:14px}
    p{margin:8px 0;color:#0b1220}
    ul{margin:8px 0 8px 20px;color:var(--muted)}
    ol{margin:8px 0 8px 20px;color:var(--muted)}
    .muted{color:var(--muted);font-size:13px}
    .pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#eef6f4;color:var(--accent);font-weight:600;font-size:12px}
    .section-grid{display:grid;grid-template-columns:1fr;gap:12px}
    @media(min-width:800px){ .section-grid{grid-template-columns:1fr 360px} }
    .summary{font-size:14px;color:#0b1220}
    .cta{display:inline-block;padding:10px 14px;border-radius:8px;background:var(--accent);color:white;text-decoration:none;font-weight:600}
    footer{margin-top:18px;font-size:12px;color:var(--muted);text-align:center}
    .subtle{font-size:13px;color:var(--muted);margin-top:6px}
    .legal-list li{margin-bottom:6px}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>BizMeet Platform</h1>
        <p class="muted">Terms and Conditions</p>
      </div>
      <div style="text-align:right">
        <span class="pill">Last updated: April 22, 2026</span>
        <div class="subtle">Terms and conditions document</div>
      </div>
    </header>

    <section class="card">
      <h2>Project Overview</h2>
      <p class="summary">
        BizMeet is a social networking platform that provides user onboarding, authentication, profile management,
        post and story publishing, comments and replies, follow system, event hosting/attendance, notifications,
        file upload handling, and paid subscriptions.
      </p>
      <p class="muted">
        The platform is exposed through API routes and is managed with role-based controls, moderation utilities,
        and integrated third-party infrastructure (including payment and push services).
      </p>
    </section>

    <section class="card">
      <h2>1) Acceptance of Terms</h2>
      <p>
        By creating an account, accessing, or using the platform, you agree to these Terms and Conditions and any
        related policies published by the service operator. If you do not agree, do not use the platform.
      </p>
    </section>

    <section class="card">
      <h2>2) Accounts and Security</h2>
      <ul class="legal-list">
        <li>You must provide accurate account information and keep it updated.</li>
        <li>You are responsible for maintaining credential confidentiality and device/session security.</li>
        <li>You are responsible for all activities performed using your account unless prohibited by law.</li>
        <li>We may suspend or terminate accounts involved in abuse, fraud, or policy violations.</li>
      </ul>
    </section>

    <section class="card">
      <h2>3) Acceptable Use</h2>
      <p class="muted">You agree not to use the platform to:</p>
      <ul class="legal-list">
        <li>Violate applicable law or the rights of others.</li>
        <li>Publish or distribute unlawful, harmful, hateful, defamatory, or deceptive content.</li>
        <li>Upload malware, phishing content, or attempt unauthorized access.</li>
        <li>Impersonate others, create fake identities, or misuse personal data without permission.</li>
        <li>Interfere with APIs, services, moderation systems, or security controls.</li>
      </ul>
    </section>

    <section class="card">
      <h2>4) User Content and Moderation</h2>
      <p>
        You retain ownership of content you create, but you grant the platform a non-exclusive license to host,
        process, and display that content for service operation. We may remove or restrict content that violates
        policy, legal requirements, or safety standards.
      </p>
    </section>

    <section class="card">
      <h2>5) Events, Followers, Messaging, and Notifications</h2>
      <p>
        Social interactions (including follows, event attendance, messaging, and notifications) are user-driven.
        You are responsible for your communications and interactions with other users.
      </p>
    </section>

    <section class="card">
      <h2>6) Subscriptions and Payments</h2>
      <p>
        Paid features and subscription plans may be offered through third-party payment processors.
        Pricing, billing cycle, and included features are shown in the platform at the time of purchase.
        Unless otherwise required by law, fees are non-refundable once the paid period has started.
      </p>
      <p class="muted">
        Payment disputes, chargebacks, taxes, and processor fees may be handled according to processor rules
        and applicable legal obligations.
      </p>
    </section>

    <section class="card">
      <h2>7) Third-Party Services</h2>
      <p>
        The platform integrates external services (for example payment, storage, and notifications).
        Availability and performance of third-party services are outside our direct control.
      </p>
    </section>

    <section class="card">
      <h2>8) Termination</h2>
      <p>
        We may suspend, restrict, or terminate access for policy violations, legal reasons, abuse,
        or behavior that threatens platform integrity or user safety.
      </p>
    </section>

    <section class="card">
      <h2>9) Disclaimer and Limitation of Liability</h2>
      <p>
        The platform is provided on an "as available" and "as is" basis, to the maximum extent permitted by law.
        We are not liable for indirect, incidental, special, or consequential damages, including loss of data,
        business interruption, or user disputes arising from use of social features or third-party services.
      </p>
    </section>

    <section class="card">
      <h2>10) Changes to These Terms</h2>
      <p>
        We may update these Terms and Conditions periodically. Changes are effective when published through official
        platform channels. Continued use after publication means you accept the updated terms.
      </p>
    </section>

    <section class="card">
      <h2>11) Contact</h2>
      <p>
        For terms-related questions, compliance requests, or account issues, contact support through the official
        channel provided inside the platform.
      </p>
    </section>

    <footer class="muted">
      Copyright BizMeet Platform. Use of the service is subject to these terms.
    </footer>
  </div>
</body>
</html>
`;
};

export const accountDelete = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Account Delete</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background-color: #F5F5FA; /* bg */
      padding: 0;
      margin: 0;
    }

    .container {
      max-width: 400px;
      margin: 80px auto;
      background-color: #FFFFFF; /* cardBg */
      padding: 30px;
      border-radius: 10px;
      border: 1px solid #D8DBDF; /* containerBorder */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    h2 {
      color: #6C63FF; /* purpleText */
      text-align: center;
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #1A1A2E; /* text */
    }

    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      border: 1px solid #E8E8F0; /* border */
      border-radius: 6px;
      font-size: 14px;
      color: #1A1A2E;
    }

    input::placeholder {
      color: #AAAAAA; /* hint */
    }

    button {
      width: 100%;
      padding: 12px;
      background-color: #6140E6; /* primary */
      color: #FFFFFF;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #7B61FF; /* purple */
    }

    .note {
      font-size: 13px;
      color: #6B6B8A; /* subText */
      text-align: center;
      margin-top: 15px;
    }
</style>
</head>
<body>

<div class="container">
  <h2>Delete Your Account</h2>
  <form onsubmit="handleDelete(event)">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>

    <label for="password">Password</label>
    <input type="password" id="password" name="password" required>

    <button type="submit">Confirm</button>
  </form>

  <div class="note">
    This action is irreversible. Please confirm carefully.
  </div>
</div>

<script>
  function handleDelete(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please fill in both fields.");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete the account?");
    if (confirmed) {
      alert("Your account has been marked for deletion.");
    }
  }
</script>

</body>
</html>
 `;
};

export const dataDelete = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Delete Data</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background-color: #F5F5FA; /* bg */
      padding: 0;
      margin: 0;
    }

    .container {
      max-width: 400px;
      margin: 80px auto;
      background-color: #FFFFFF; /* cardBg */
      padding: 30px;
      border-radius: 10px;
      border: 1px solid #D8DBDF; /* containerBorder */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    h2 {
      color: #6C63FF; /* purpleText */
      text-align: center;
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #1A1A2E; /* text */
    }

    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      border: 1px solid #E8E8F0; /* border */
      border-radius: 6px;
      font-size: 14px;
      color: #1A1A2E;
    }

    input::placeholder {
      color: #AAAAAA; /* hint */
    }

    button {
      width: 100%;
      padding: 12px;
      background-color: #6140E6; /* primary */
      color: #FFFFFF;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #7B61FF; /* purple */
    }

    .note {
      font-size: 13px;
      color: #6B6B8A; /* subText */
      text-align: center;
      margin-top: 15px;
    }
</style>
</head>
<body>

<div class="container">
  <h2>Delete Your Data</h2>
  <form onsubmit="handleDelete(event)">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>

    <label for="password">Password</label>
    <input type="password" id="password" name="password" required>

    <button type="submit">Confirm</button>
  </form>

  <div class="note">
    This action is irreversible. Please confirm carefully.
  </div>
</div>

<script>
  function handleDelete(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please fill in both fields.");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete your data?");
    if (confirmed) {
      alert("Your data has been marked for deletion.");
    }
  }
</script>

</body>
</html>
 `;
};

export const childPolicy = () => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BizMeet - Child Safety Policy</title>
  <meta name="description" content="Child Sexual Abuse and Exploitation (CSAE) Policy" />
  <style>
    :root{--bg:#f7f8fb;--card:#ffffff;--muted:#6b7280;--accent:#0f766e;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica Neue,Arial}
    html,body{height:100%}
    body{margin:0;background:var(--bg);color:#0f172a;-webkit-font-smoothing:antialiased;line-height:1.5;padding:32px}
    .wrap{max-width:900px;margin:0 auto}
    header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
    header h1{font-size:20px;margin:0;color:var(--accent)}
    .card{background:var(--card);border-radius:12px;padding:18px;box-shadow:0 6px 18px rgba(15,23,42,0.06);margin-bottom:14px}
    h2{margin:0 0 8px 0;font-size:16px;color:#08101a}
    p{margin:6px 0;color:#0b1220}
    ul{margin:6px 0 6px 20px;color:var(--muted)}
    .muted{color:var(--muted);font-size:13px}
    .pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#eef6f4;color:var(--accent);font-weight:600;font-size:12px}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>BizMeet Platform</h1>
        <p class="muted">Child Sexual Abuse & Exploitation (CSAE) Policy</p>
      </div>
      <div style="text-align:right">
        <span class="pill">Last updated: May 9, 2026</span>
        <div class="muted">Zero-tolerance policy</div>
      </div>
    </header>

    <section class="card">
      <h2>Overview</h2>
      <p>
        Our platform maintains a zero-tolerance stance toward any form of child sexual abuse, exploitation,
        or child sexual abuse material (CSAM). This policy describes prohibited behaviors, reporting
        procedures, moderation responses, and user safety measures.
      </p>
    </section>

    <section class="card">
      <h2>Prohibited Content and Behavior</h2>
      <ul>
        <li>Uploading, sharing, storing, or distributing child sexual abuse material (CSAM) is strictly prohibited.</li>
        <li>Grooming, exploitation, or sexualization of minors is forbidden.</li>
        <li>Promoting, encouraging, or facilitating child abuse or exploitation is not allowed.</li>
        <li>Using the platform to harm or endanger minors in any way is prohibited.</li>
      </ul>
      <p class="muted">Any violation may result in immediate account suspension or permanent removal.</p>
    </section>

    <section class="card">
      <h2>Reporting and Moderation</h2>
      <ul>
        <li>Users may report inappropriate content, accounts, messages, events, posts, or comments through the app or by contacting our safety team.</li>
        <li>We actively review reports and take appropriate action, which may include removing content, suspending or banning accounts, and reporting illegal activity to law enforcement or child protection organizations when required.</li>
      </ul>
    </section>

    <section class="card">
      <h2>User Safety</h2>
      <p class="muted">We are committed to protecting minors by:</p>
      <ul>
        <li>Applying content moderation and monitoring.</li>
        <li>Providing user reporting tools and clear escalation paths.</li>
        <li>Enforcing community guidelines to restrict abusive or harmful behavior.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Contact</h2>
      <p>
        If you encounter any content or behavior related to child sexual abuse or exploitation, please report it immediately.
      </p>
      <p class="muted">Email: bizmeet2026@gmail.com</p>
    </section>

    <footer class="muted" style="text-align:center;margin-top:12px">We review all reports promptly and take appropriate action, including content removal, account suspension, and referral to authorities when necessary.</footer>
  </div>
</body>
</html>
`;
};
