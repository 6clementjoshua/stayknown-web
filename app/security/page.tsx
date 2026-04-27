"use client";

import Image from "next/image";

const UPDATED_AT = "2026-02-22";
const VERSION = "1.0";

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="text-white/92 font-black tracking-[-0.02em] text-[16px] md:text-[17px] scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-white/85 font-extrabold text-[13.5px] mt-3">
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/62 font-semibold text-[13px] leading-relaxed">
      {children}
    </p>
  );
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1 text-white/62 font-semibold text-[13px] leading-relaxed">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

function Callout({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-white/90 font-extrabold text-[12.5px]">{title}</div>
      <div className="mt-2 text-white/62 font-semibold text-[13px] leading-relaxed">
        {body}
      </div>
    </div>
  );
}

function Example({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-white/85 font-extrabold text-[12.5px]">{title}</div>
      <div className="mt-2">
        <UL items={items} />
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const nav = [
    ["overview", "Overview"],
    ["principles", "Security principles"],
    ["reporting", "Report vulnerabilities"],
    ["safeharbor", "Good-faith research"],
    ["prohibited", "Prohibited testing"],
    ["account", "Account security"],
    ["device", "Device security"],
    ["location", "Location integrity"],
    ["vpn", "VPN and network integrity"],
    ["api", "API and abuse controls"],
    ["chat", "Chat and media security"],
    ["payments", "Payments and wallet safety"],
    ["contacts", "Contacts and notifications"],
    ["data", "Data protection"],
    ["monitoring", "Monitoring and enforcement"],
    ["incidents", "Incident response"],
    ["users", "User responsibilities"],
    ["minors", "Minor and vulnerable-user safety"],
    ["law", "Legal cooperation"],
    ["contact", "Contact"],
    ["apptext", "App text"],
  ] as const;

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <header className="pt-7">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="text-white font-extrabold tracking-[0.28em] text-[12px]">
              STAYKNOWN
            </div>
          </div>
        </div>
      </header>

      <section className="w-full">
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-16">
          <article className="card glass p-6 md:p-7">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">
                Security Disclosure & Platform Integrity
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              StayKnown is a safety and communication service. Security matters
              because the product may involve Visit sessions, LIVE safety
              sharing, SOS alerts, trusted contacts, location context, Safety
              Gallery images, chat, stories, stickers, translation, payments,
              device checks, and abuse-prevention signals.
            </P>

            <Callout
              title="Security is part of safety"
              body="Users, researchers, contacts, and partners must not bypass security controls, abuse APIs, manipulate location, attack devices, interfere with notifications, exploit chat/media systems, or test the service in ways that put people at risk."
            />

            <div className="mt-6 h-px bg-white/10" />

            <div className="mt-6 flex flex-wrap gap-2 text-[12px] font-semibold">
              {nav.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/60 hover:text-white/85 hover:bg-white/[0.06] transition"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="mt-8 space-y-8">
              <div className="space-y-3">
                <H2 id="overview">1) Overview</H2>
                <P>
                  StayKnown uses security and integrity controls to protect
                  users, contacts, safety sessions, account access, location
                  reliability, notification delivery, and abuse-prevention
                  systems. This policy explains how security reports should be
                  handled and what behavior is prohibited.
                </P>
                <P>
                  This page applies to StayKnown apps, website, APIs, backend
                  systems, storage, email delivery, push notifications, live map
                  links, payment flows, chat systems, media features, and any
                  other service connected to StayKnown.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="principles">2) Security principles</H2>
                <UL
                  items={[
                    "Protect safety first: security testing must never endanger a user, contact, minor, responder, or the public.",
                    "Respect privacy: do not access, copy, expose, change, delete, or share data that does not belong to you.",
                    "Respect consent: do not test against another person’s account, device, contact list, live link, media, chat, or safety session without permission.",
                    "Minimize harm: stop testing immediately if you discover a weakness that could expose people or disrupt safety features.",
                    "Report privately: send security findings to support@stay-known.com and allow review before public disclosure.",
                    "No abuse: security research must not become stalking, harassment, fraud, extortion, scraping, spam, or service disruption.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="reporting">3) Reporting vulnerabilities</H2>
                <P>
                  If you believe you found a security vulnerability, report it
                  privately and clearly.
                </P>

                <Callout
                  title="Security contact"
                  body="support@stay-known.com"
                />

                <UL
                  items={[
                    "Use the subject line: Security Disclosure — StayKnown.",
                    "Describe the issue, affected page/app/API/feature, and likely impact.",
                    "Include safe reproduction steps that do not expose another user’s data.",
                    "Include screenshots, logs, request IDs, timestamps, test account IDs, or device information if safe.",
                    "Do not include personal data belonging to other users unless absolutely necessary to explain the risk.",
                    "Do not publicly disclose sensitive details before StayKnown has had time to investigate.",
                  ]}
                />

                <Example
                  title="Useful report examples"
                  items={[
                    "A route exposes data without authentication.",
                    "A signed live-map link can be reused outside its intended limits.",
                    "A user can access another user’s Safety Gallery image.",
                    "A chat media URL can be opened without permission.",
                    "A rate limit can be bypassed to send excessive alerts.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="safeharbor">4) Good-faith security research</H2>
                <P>
                  Good-faith research means testing in a way that is limited,
                  responsible, lawful, and safe. StayKnown values reports that
                  help protect users without causing harm.
                </P>
                <UL
                  items={[
                    "Use only accounts, devices, contacts, media, sessions, and data you own or have explicit permission to test.",
                    "Keep testing limited to the minimum needed to prove the issue.",
                    "Avoid service disruption, bulk traffic, spam, or automated attacks.",
                    "Stop immediately if you access another person’s data or affect safety features.",
                    "Report promptly and privately.",
                    "Do not demand payment, threaten disclosure, or use the issue for leverage.",
                  ]}
                />
                <Callout
                  title="No public bounty promise"
                  body="This policy does not create a guaranteed bug bounty, reward, contract, employment relationship, or immunity. StayKnown may still take action against harmful or unlawful activity."
                />
              </div>

              <div className="space-y-3">
                <H2 id="prohibited">
                  5) Prohibited security testing and misuse
                </H2>
                <P>
                  The following conduct is not allowed, even if described as
                  research.
                </P>
                <UL
                  items={[
                    "Accessing, copying, changing, deleting, or exposing another user’s data.",
                    "Testing against accounts, devices, contacts, live sessions, minors, or safety flows without permission.",
                    "Triggering false SOS alerts, fake Visit sessions, fake Manual Captures, or misleading notifications.",
                    "Sending spam, mass alerts, mass emails, or repeated notifications.",
                    "Testing that interrupts Visit, LIVE, SOS, chat, notification, payment, or contact approval flows.",
                    "Denial-of-service attacks, load testing, stress testing, brute forcing, credential stuffing, scraping, or automated abuse.",
                    "Reverse engineering, bypassing device integrity checks, fake GPS/spoofing, VPN bypass abuse, emulator misuse, bot activity, or API abuse.",
                    "Attempting to defeat plan limits, rate limits, subscription checks, wallet rules, or premium gates.",
                    "Attempting to bypass block/report restrictions, consent flows, contact approvals, or child safety protections.",
                    "Publicly disclosing exploitable details before StayKnown can investigate and mitigate.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="account">6) Account and identity security</H2>
                <P>
                  Users are responsible for keeping account access secure.
                  StayKnown may use authentication, device, session, and
                  abuse-prevention controls to protect accounts.
                </P>
                <UL
                  items={[
                    "Do not share passwords, login links, one-time codes, recovery codes, or account access.",
                    "Keep your email account secure because it may be used for account recovery or important notifications.",
                    "Use a secure device lock and avoid leaving your device unlocked around people you do not trust.",
                    "Do not impersonate another user, contact, guardian, responder, support agent, or StayKnown staff.",
                    "Do not create accounts for scams, stalking, harassment, fraud, or bypassing bans.",
                    "Report unauthorized access or suspicious account activity immediately.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="device">7) Device and app integrity</H2>
                <P>
                  StayKnown safety features depend on honest device state,
                  operating system permissions, network conditions, and user
                  behavior.
                </P>
                <UL
                  items={[
                    "Do not tamper with the app, modify app code, patch runtime behavior, or inject tools into the app.",
                    "Do not use fake GPS, spoofed sensors, rooted/jailbroken manipulation, emulator abuse, or automation to mislead safety features.",
                    "Do not bypass biometric/device-level protection where required.",
                    "Do not interfere with push notifications, background location, Visit state, SOS state, or location updates.",
                    "Do not use another person’s device to start, stop, or manipulate safety sessions without authorization.",
                    "Keep your phone and app updated for security and reliability.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="location">8) Location integrity and safety signals</H2>
                <P>
                  Location integrity is critical to StayKnown. Users must not
                  manipulate location or reliability signals to mislead
                  contacts, responders, support, or the platform.
                </P>
                <UL
                  items={[
                    "Do not spoof location, fake route movement, or create false safety records.",
                    "Do not interfere with location permissions to mislead contacts during a safety event.",
                    "Do not use fake location tools, automation, or network manipulation to deceive StayKnown.",
                    "Do not use location metadata to stalk, threaten, shame, or control another person.",
                    "Treat location and time data as approximate and subject to network/device delay.",
                    "If location is wrong during a safety event, use direct communication and emergency services where needed.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="vpn">9) VPN, network, and reliability integrity</H2>
                <P>
                  StayKnown may warn or block certain flows when VPN or network
                  behavior affects safety reliability, abuse prevention, or
                  location confidence.
                </P>
                <UL
                  items={[
                    "Do not use VPN, proxies, Tor-like routing, network manipulation, or high-risk network tools to bypass restrictions.",
                    "Do not use VPN to hide abusive behavior, avoid enforcement, or manipulate location reliability.",
                    "Do not bypass app-launch VPN checks, chat VPN gates, or mid-Visit VPN disruption rules.",
                    "Do not use network tools to intercept, replay, forge, or modify StayKnown requests.",
                    "Do not interfere with email delivery, push notifications, live links, or alert delivery.",
                    "Mid-Visit VPN activation may disrupt safety confidence and may trigger warning behavior where configured.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="api">10) API, automation, and abuse controls</H2>
                <P>
                  StayKnown may apply rate limits, device checks, API controls,
                  plan limits, and anti-abuse protections to maintain safety and
                  reliability.
                </P>
                <UL
                  items={[
                    "Do not abuse APIs, scrape data, enumerate users, or probe private endpoints.",
                    "Do not automate account creation, contact invites, alerts, chat messages, stickers, media uploads, or story posts.",
                    "Do not bypass rate limits, quota limits, plan gates, subscription checks, or paid feature restrictions.",
                    "Do not interfere with Supabase, Edge Functions, storage, signed URLs, email systems, push systems, or map/live-link routes.",
                    "Do not attempt to discover private buckets, storage paths, message IDs, user IDs, token formats, or link signatures by brute force.",
                    "Do not use bots to spam reports, contacts, messages, alerts, or support.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="chat">
                  11) Chat, stories, stickers, voice, and media security
                </H2>
                <P>
                  Chat and media features may carry private communication and
                  safety context. They must not be abused or attacked.
                </P>
                <UL
                  items={[
                    "Do not access another user’s chat, attachments, stickers, voice notes, stories, profile media, or Safety Gallery images.",
                    "Do not upload malware, harmful files, deceptive links, spyware, phishing content, or abusive media.",
                    "Do not exploit sticker, media, voice, music, video, or file upload flows.",
                    "Do not bypass block, report, plan-gate, translation, VPN, or privacy controls.",
                    "Do not use chat to phish for login codes, payment details, identity information, or private safety data.",
                    "Do not use stories or profile surfaces for impersonation, stalking, or targeting.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="payments">
                  12) Payments, coins, subscriptions, and wallet safety
                </H2>
                <P>
                  If StayKnown includes subscriptions, in-app purchases, coins,
                  wallet, transfers, or withdrawals, those flows must be used
                  lawfully and securely.
                </P>
                <UL
                  items={[
                    "Do not exploit purchases, receipts, webhooks, balances, ledgers, outbox jobs, refunds, or withdrawals.",
                    "Do not use payments, coins, subscriptions, or wallet features for fraud, laundering, illegal funding, deception, or chargeback abuse.",
                    "Do not impersonate another user to receive coins, payments, or benefits.",
                    "Do not attempt to bypass plan entitlements or subscription expiry.",
                    "Do not manipulate receipts or server-side verification.",
                    "Report wallet or payment security issues privately.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contacts">
                  13) Contacts, notifications, and email security
                </H2>
                <P>
                  Contact and alert systems must remain trustworthy. Abuse can
                  cause fear, harassment, or confusion.
                </P>
                <UL
                  items={[
                    "Do not add contacts without permission or lawful basis.",
                    "Do not spam contacts or repeatedly trigger alerts.",
                    "Do not forge, replay, or manipulate safety emails or notification payloads.",
                    "Do not use alert links, live links, or email previews to mislead recipients.",
                    "Do not interfere with contact approval, invite, decline, or consent flows.",
                    "Do not use notification systems for phishing, threats, scams, or impersonation.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="data">14) Data protection and access boundaries</H2>
                <P>
                  StayKnown data access must stay limited to authorized users,
                  lawful purposes, and required service operation.
                </P>
                <UL
                  items={[
                    "Do not access another person’s profile, contact list, location, Visit, SOS, chat, story, media, wallet, or Safety Gallery data.",
                    "Do not attempt to bypass row-level security, storage policies, signed URLs, JWT checks, session checks, or backend validation.",
                    "Do not exfiltrate data or test with real user data.",
                    "Do not publish private records, screenshots, links, coordinates, message content, or account data.",
                    "Do not use leaked, scraped, guessed, or stolen credentials.",
                    "Do not attempt to reverse engineer private database structure or security rules for abuse.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="monitoring">
                  15) Monitoring, restrictions, and enforcement
                </H2>
                <P>
                  StayKnown may use monitoring, logging, rate limits,
                  restrictions, and enforcement to protect safety and platform
                  integrity.
                </P>
                <UL
                  items={[
                    "Suspicious activity may trigger review, throttling, temporary restriction, or permanent ban.",
                    "Accounts, devices, networks, payment methods, contacts, or identifiers may be restricted when abuse is detected.",
                    "Features may be limited to prevent spam, stalking, harassment, fraud, false SOS, or system abuse.",
                    "Reports, appeals, security events, and enforcement records may be retained where appropriate.",
                    "StayKnown may preserve records where required by law or needed to investigate abuse or threats.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="incidents">16) Security incident response</H2>
                <P>
                  When StayKnown identifies a credible security issue, we may
                  take steps to reduce harm and protect users.
                </P>
                <UL
                  items={[
                    "Review the report and assess severity.",
                    "Mitigate or fix the issue where possible.",
                    "Restrict abused features, endpoints, accounts, or devices.",
                    "Rotate keys, invalidate sessions, revoke tokens, or update signatures where needed.",
                    "Preserve logs relevant to the incident.",
                    "Notify users, partners, platforms, or authorities where required by law or safety needs.",
                    "Improve monitoring, rate limits, validation, and policy language after review.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="users">17) User responsibilities</H2>
                <P>
                  Security is shared. Users must protect their accounts and use
                  StayKnown responsibly.
                </P>
                <UL
                  items={[
                    "Keep your phone, operating system, and StayKnown app updated.",
                    "Use device lock, biometric protection where available, and secure email access.",
                    "Do not share passwords, login links, one-time codes, or account access.",
                    "Do not leave an active safety session unattended on an unlocked device.",
                    "Review contacts and remove people who should no longer receive alerts.",
                    "Report suspicious activity, unwanted alerts, unknown contacts, or suspected account access.",
                    "Use emergency services directly if immediate danger exists.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="minors">18) Minor and vulnerable-user safety</H2>
                <P>
                  Security issues involving minors, vulnerable people, coercion,
                  stalking, exploitation, or immediate harm are treated
                  seriously.
                </P>
                <UL
                  items={[
                    "Do not test against minor accounts, guardian flows, or vulnerable users without explicit lawful permission.",
                    "Do not use StayKnown to groom, exploit, threaten, control, or track a minor.",
                    "Reports involving minors may require urgent review and record preservation.",
                    "If a minor is in immediate danger, contact local emergency services or appropriate authorities first.",
                    "Security reports involving minors should be sent privately and safely.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="law">19) Legal cooperation and preservation</H2>
                <P>
                  StayKnown respects applicable law and may respond to valid
                  legal process. We may preserve logs and records where required
                  by law or reasonably needed to investigate abuse, fraud,
                  threats, security incidents, or safety risks.
                </P>
                <UL
                  items={[
                    "We may preserve relevant records for security investigations.",
                    "We may disclose information if required by law or necessary to protect rights and safety, prevent fraud, prevent harm, or enforce policies.",
                    "We may cooperate with valid emergency or legal requests where appropriate.",
                    "We do not support covert surveillance or unlawful monitoring.",
                    "We may reject or narrow requests that are overbroad, unsafe, unlawful, or connected to abuse.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contact">20) Contact</H2>
                <P>
                  For security disclosures, abuse reports, account safety
                  issues, or platform integrity concerns, contact:
                </P>
                <Callout
                  title="Security contact"
                  body="support@stay-known.com"
                />
                <P>
                  For immediate danger, contact your local emergency number
                  first. StayKnown is not emergency services.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="apptext">Appendix A — In-app text this page expands</H2>
                <P>
                  This page expands the platform integrity and security language
                  shown inside the StayKnown app.
                </P>

                <H3>Platform Integrity</H3>
                <UL
                  items={[
                    "You must not attempt to bypass security controls, abuse APIs, or interfere with device integrity checks.",
                    "Access from certain regions may be limited to comply with sanctions, export controls, or platform requirements.",
                    "We may apply rate limits, device checks, and anti-abuse protections to protect users and maintain reliability.",
                  ]}
                />

                <H3>User Responsibilities</H3>
                <UL
                  items={[
                    "You are responsible for keeping your account secure and not sharing access improperly.",
                    "You are responsible for using accurate information and selecting trusted contacts.",
                    "You are responsible for using the app only for lawful, safety-focused purposes.",
                    "You are responsible for respecting others’ privacy and consent.",
                    "You must not create false or misleading safety sessions.",
                  ]}
                />

                <H3>Fraud, Scam, Kidnapping & Abuse Prevention</H3>
                <UL
                  items={[
                    "StayKnown is a safety product. Misuse can cause serious harm.",
                    "We may restrict accounts, devices, or features if we detect suspicious usage patterns including high-risk network signals, unusual session behaviors, repeated mass messaging, reported abuse, or attempts to bypass safeguards.",
                    "You must never use StayKnown to lure someone, coordinate harm, or mislead emergency contacts.",
                    "Where required by law or where necessary to prevent harm, we may preserve relevant logs and cooperate with lawful requests.",
                  ]}
                />

                <H3>Security disclosure</H3>
                <UL
                  items={[
                    "If you believe you found a security issue, contact support@stay-known.com with details.",
                    "Do not publicly disclose sensitive vulnerabilities without giving StayKnown a chance to investigate and fix them.",
                    "Do not use security testing to access another user’s data, disrupt safety features, or bypass protections.",
                  ]}
                />
              </div>
            </div>

            <div className="mt-10 h-px bg-white/10" />

            <div className="mt-6 text-center">
              <div className="text-[12px] font-semibold text-white/50">
                A 6 Clement Joshua service
                <span className="text-white/25 ml-1 align-super text-[10px]">
                  ™
                </span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-white/30">
                {new Date().getFullYear()} • stay-known.com
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
