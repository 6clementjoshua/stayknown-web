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

export default function EmergencyPage() {
  const nav = [
    ["immediate", "Immediate danger"],
    ["role", "StayKnown’s role"],
    ["not", "What we are not"],
    ["can", "What StayKnown can do"],
    ["limits", "What cannot be guaranteed"],
    ["sos", "SOS use"],
    ["visit", "Visit and LIVE"],
    ["capture", "Manual Capture"],
    ["verified", "Verified stop"],
    ["contacts", "Contact response"],
    ["location", "Location accuracy"],
    ["network", "Network delays"],
    ["false", "False emergencies"],
    ["minors", "Minors and vulnerable users"],
    ["vpn", "VPN and device reliability"],
    ["records", "Records and preservation"],
    ["abuse", "Emergency misuse"],
    ["law", "Legal cooperation"],
    ["user", "User responsibility"],
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
                Emergency Disclaimer
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              This Emergency Disclaimer explains the limits of StayKnown during
              urgent situations, how SOS and safety alerts should be used, how
              trusted contacts should respond, and why users must still contact
              local emergency services when immediate danger exists.
            </P>

            <Callout
              title="If you are in immediate danger"
              body="Call your local emergency number immediately. StayKnown is not emergency services, not law enforcement, not medical services, and not a rescue organization."
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
                <H2 id="immediate">1) Immediate danger comes first</H2>
                <P>
                  StayKnown can help notify trusted contacts and provide safety
                  context, but it cannot replace official emergency services. If
                  you, a minor, a dependent, a contact, or another person is in
                  immediate danger, contact the proper local emergency number
                  first.
                </P>
                <UL
                  items={[
                    "Call local emergency services for immediate danger, serious injury, threats, kidnapping, trafficking, fire, medical emergencies, or violence.",
                    "Use local emergency numbers, official emergency apps, police, ambulance, fire, or rescue services where available.",
                    "Do not wait for a StayKnown alert, email, push notification, chat message, or location update if immediate action is needed.",
                    "If it is unsafe to call, follow local emergency guidance for silent or text-based emergency options where available.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="role">2) StayKnown’s role in safety situations</H2>
                <P>
                  StayKnown is a safety support tool. It is designed to help a
                  user communicate safety context to trusted people during
                  Visits, LIVE sharing, SOS events, Manual Capture updates,
                  chat, and related safety flows.
                </P>
                <Example
                  title="StayKnown may help with"
                  items={[
                    "Notifying trusted contacts when a user starts or updates a safety session.",
                    "Sharing user-triggered safety context during an active Visit or SOS flow.",
                    "Helping contacts understand that a safety event is active.",
                    "Providing history and delivery context where records are available.",
                    "Supporting safer communication through chat, voice, translation, and profile trust where enabled.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="not">3) What StayKnown is not</H2>
                <P>
                  StayKnown does not become an emergency responder simply
                  because a user starts a Visit, triggers SOS, sends Manual
                  Capture, or shares LIVE context.
                </P>
                <UL
                  items={[
                    "StayKnown is not police, ambulance, fire service, rescue service, medical service, or emergency dispatch.",
                    "StayKnown does not guarantee that any contact will receive, read, understand, or act on an alert.",
                    "StayKnown does not guarantee real-time location, exact coordinates, exact address, or perfect delivery.",
                    "StayKnown does not guarantee intervention, rescue, prevention of harm, or a specific outcome.",
                    "StayKnown does not monitor every session live or make emergency decisions for contacts.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="can">4) What StayKnown can do</H2>
                <P>
                  Depending on plan, region, device permissions, connectivity,
                  feature availability, and user settings, StayKnown may support
                  several safety functions.
                </P>
                <UL
                  items={[
                    "Send user-triggered safety notifications to trusted contacts.",
                    "Share Visit status and location context during an active session where permissions allow.",
                    "Support SOS alert flows where available.",
                    "Support Manual Capture safety updates during active safety flows.",
                    "Show safety history logs to help users review personal safety activity.",
                    "Provide notification delivery context where available.",
                    "Support chat, media, voice notes, translation, stories, and profile trust where enabled.",
                    "Support verified stop flows for sensitive ending actions where configured.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="limits">5) What StayKnown cannot guarantee</H2>
                <UL
                  items={[
                    "Real-time delivery of emails, push notifications, or app updates.",
                    "Perfect location accuracy or continuous GPS availability.",
                    "That a phone will remain charged, online, unlocked, or able to transmit data.",
                    "That a contact will see, understand, or respond to an alert.",
                    "That emergency services will be contacted by a recipient.",
                    "That emergency responders will act based on StayKnown data.",
                    "That network providers, email providers, app stores, GPS, or operating systems will perform without delay.",
                    "That a safety event will prevent harm.",
                  ]}
                />
                <Callout
                  title="No single safety tool is enough"
                  body="Use StayKnown as one safety layer. Keep emergency numbers, trusted contacts, direct calls, local safety plans, and real-world judgment active."
                />
              </div>

              <div className="space-y-3">
                <H2 id="sos">6) SOS use and limitations</H2>
                <P>
                  SOS is a serious safety signal. It should be used only when
                  the user needs urgent trusted-contact attention or feels
                  unsafe.
                </P>
                <UL
                  items={[
                    "SOS may notify selected contacts depending on plan, settings, connectivity, and feature availability.",
                    "SOS does not automatically call police, ambulance, fire service, or rescue unless a separate official emergency system is used.",
                    "SOS does not guarantee that contacts are awake, online, reachable, or able to help.",
                    "SOS may include location context if permissions and device state allow it.",
                    "SOS should not be used as a prank, test, threat, manipulation, false claim, or pressure tactic.",
                    "In immediate danger, contact local emergency services directly.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="visit">7) Visit and LIVE sharing limitations</H2>
                <P>
                  Visit and LIVE sharing can help trusted contacts understand an
                  active safety session, but they are not a guarantee of safety
                  or intervention.
                </P>
                <UL
                  items={[
                    "Visit sessions depend on location permission, GPS, network access, battery, device settings, and app state.",
                    "LIVE links may show delayed, approximate, incomplete, or unavailable location data.",
                    "Contacts should treat LIVE information as safety context, not exact proof of current location.",
                    "A Visit ending does not guarantee the person is safe unless the user confirms safety through real-world communication.",
                    "Do not use Visit or LIVE links for stalking, coercion, harassment, or surveillance.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="capture">8) Manual Capture limitations</H2>
                <P>
                  Manual Capture can send an extra safety update during an
                  active Visit or safety flow. It is useful for context, but it
                  does not replace emergency response.
                </P>
                <UL
                  items={[
                    "Manual Capture may be limited by plan or daily usage rules.",
                    "Manual Capture may fail if the device cannot get location or send data.",
                    "Manual Capture may be delayed by network or email delivery systems.",
                    "Manual Capture should not be used to spam, frighten, manipulate, or mislead contacts.",
                    "Contacts should treat capture data as helpful context, not guaranteed live truth.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="verified">9) Verified stop and sensitive endings</H2>
                <P>
                  Some safety flows may require stronger confirmation before
                  ending protection. Verified stop is intended to reduce
                  accidental ending of a sensitive safety state.
                </P>
                <UL
                  items={[
                    "Verified stop may use biometric or device-level confirmation where supported.",
                    "Verified stop does not prove that the user is physically safe.",
                    "A stopped SOS or ended Visit does not replace direct communication or emergency services.",
                    "No one should pressure a user to end a safety flow.",
                    "If a safety state ends unexpectedly and danger seems likely, contacts should use direct communication and emergency services where appropriate.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contacts">10) How trusted contacts should respond</H2>
                <P>
                  Contacts receiving StayKnown alerts should act carefully,
                  lawfully, and safely. They should not take unsafe action or
                  treat approximate data as absolute proof.
                </P>
                <UL
                  items={[
                    "Attempt safe direct contact first by calling or messaging the user.",
                    "Check whether the alert is SOS, Visit, Manual Capture, end state, or another safety update.",
                    "If danger seems likely, contact local emergency services and provide the relevant safety context.",
                    "Do not attempt unsafe personal intervention.",
                    "Do not publicly share the user’s location or safety details unless necessary for safety or law.",
                    "Treat timestamps, location, and place labels as approximate and potentially delayed.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="location">11) Location accuracy limitations</H2>
                <P>
                  Location data depends on many factors outside StayKnown’s full
                  control. It may be approximate, delayed, missing, or wrong.
                </P>
                <UL
                  items={[
                    "GPS may be weak indoors, underground, in dense buildings, or during poor weather.",
                    "Battery saver, denied permissions, background restrictions, or device settings may stop updates.",
                    "Network issues may delay or prevent upload of location points.",
                    "Reverse geocoded place labels may be approximate or unavailable.",
                    "VPN, fake GPS, device tampering, or unreliable network state may reduce location confidence.",
                    "A displayed location may not represent the user’s exact current position.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="network">12) Network, provider, and delivery delays</H2>
                <P>
                  StayKnown depends on third-party systems such as mobile
                  networks, operating systems, email providers, push systems,
                  hosting providers, app stores, maps, and geocoding providers.
                </P>
                <UL
                  items={[
                    "Emails may be delayed, filtered, blocked, or sent to spam.",
                    "Push notifications may be delayed by phone settings, battery saver, OS rules, or network state.",
                    "Map links may load slowly or fail if the recipient has poor connectivity.",
                    "App background behavior may vary across devices and operating systems.",
                    "Third-party outages may affect alerts, maps, emails, storage, subscriptions, or chat.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="false">13) False emergencies are prohibited</H2>
                <P>
                  False emergency use can cause panic, waste resources, damage
                  trust, and endanger others. StayKnown prohibits false SOS
                  events and misleading safety claims.
                </P>
                <UL
                  items={[
                    "Do not create fake SOS alerts.",
                    "Do not create false Visit or Manual Capture events to manipulate contacts.",
                    "Do not use emergency language to threaten, harass, or pressure someone.",
                    "Do not use StayKnown to frame, mislead, lure, or exploit another person.",
                    "Repeated false emergencies may result in feature restrictions, account suspension, permanent ban, preservation of records, and lawful cooperation where appropriate.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="minors">14) Minors and vulnerable users</H2>
                <P>
                  Emergency and safety features involving minors or vulnerable
                  users must be handled with heightened care.
                </P>
                <UL
                  items={[
                    "Under 13 users are not permitted to create an account or use StayKnown.",
                    "Minors who are permitted under policy require appropriate guardian permission and lawful safety use.",
                    "StayKnown must not be used to groom, exploit, coerce, threaten, or secretly monitor minors.",
                    "If a minor is in immediate danger, contact local emergency services or the proper local authority first.",
                    "Reports involving minors may require urgent review and preservation of relevant records.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="vpn">
                  15) VPN, device integrity, and emergency reliability
                </H2>
                <P>
                  VPNs, fake GPS tools, device tampering, emulators, and network
                  manipulation can reduce confidence in emergency safety data.
                </P>
                <UL
                  items={[
                    "Do not use VPN or network tools to bypass StayKnown safety gates or enforcement.",
                    "Do not use fake GPS to mislead contacts or emergency responders.",
                    "Do not tamper with device state, permissions, or app behavior during a safety event.",
                    "If VPN or device state disrupts a Visit or SOS, alerts and location confidence may be affected.",
                    "StayKnown may warn, block, restrict, or log reliability issues where necessary for safety and abuse prevention.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="records">16) Records, history, and preservation</H2>
                <P>
                  StayKnown may retain certain safety records to provide
                  history, troubleshoot delivery, prevent abuse, investigate
                  reports, comply with law, and support safety auditing.
                </P>
                <UL
                  items={[
                    "Safety session records may include start time, stop time, state changes, SOS events, and Manual Capture events.",
                    "Notification records may include timestamps, recipient identifiers, and delivery status where available.",
                    "Location records may exist only where permissions and feature state allowed collection.",
                    "Records may be preserved where required by law or reasonably needed to investigate abuse, threats, false emergencies, fraud, or serious safety concerns.",
                    "Retention does not guarantee every record exists or can be produced later.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="abuse">17) Emergency misuse and abuse prevention</H2>
                <P>
                  StayKnown may restrict accounts, devices, contacts, network
                  identifiers, payment methods, or features where emergency
                  features are misused.
                </P>
                <UL
                  items={[
                    "Misuse includes false SOS, repeated spam alerts, threatening contacts, fake safety events, and using location to intimidate someone.",
                    "Misuse also includes kidnapping-related coordination, luring, trafficking, coercion, extortion, fraud, stalking, and harassment.",
                    "StayKnown may apply warnings, feature limits, suspensions, permanent bans, device restrictions, or legal cooperation.",
                    "Reports involving imminent harm, minors, credible threats, kidnapping, trafficking, or serious exploitation may be escalated for urgent review.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="law">18) Legal cooperation and emergency requests</H2>
                <P>
                  StayKnown respects applicable law and may respond to valid
                  legal process. In limited emergency circumstances, StayKnown
                  may review urgent requests where disclosure may be necessary
                  to prevent death, serious injury, kidnapping, trafficking,
                  exploitation, or imminent harm.
                </P>
                <UL
                  items={[
                    "StayKnown may preserve records where required by law or where reasonably needed for safety review.",
                    "StayKnown may disclose information if required by law or necessary to protect rights and safety, prevent fraud, prevent harm, or enforce policies.",
                    "StayKnown may reject, narrow, or question requests that are overbroad, unlawful, unsafe, or connected to abuse.",
                    "StayKnown does not support covert surveillance or unlawful monitoring.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="user">19) User responsibility</H2>
                <P>
                  Users must take active responsibility for their own safety,
                  account security, contact choices, and emergency planning.
                </P>
                <UL
                  items={[
                    "Keep your phone charged and connected when using active safety features.",
                    "Keep emergency numbers saved and accessible.",
                    "Tell trusted contacts what StayKnown alerts mean.",
                    "Keep contact information accurate and up to date.",
                    "Use direct calls, messages, and official emergency channels when needed.",
                    "Do not rely on StayKnown alone for high-risk situations.",
                    "Report abuse or suspicious safety behavior promptly.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contact">20) Contact</H2>
                <P>
                  For safety questions, abuse reports, legal concerns, or
                  emergency-related policy questions, contact:
                </P>
                <Callout title="Support" body="support@stay-known.com" />
                <P>
                  If there is immediate danger, contact your local emergency
                  number first.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="apptext">Appendix A — In-app text this page expands</H2>
                <P>
                  This page expands the emergency disclaimer language shown
                  inside the StayKnown app.
                </P>

                <H3>Safety & Emergency Disclaimer</H3>
                <UL
                  items={[
                    "StayKnown does NOT replace emergency services, medical services, law enforcement, or professional rescue organizations.",
                    "If you are in immediate danger, contact your local emergency number and follow local guidance.",
                    "Notifications and emails may be delayed, blocked, or filtered by networks and third-party providers.",
                    "StayKnown is a support tool to increase awareness—not a guarantee of intervention.",
                  ]}
                />

                <H3>Emergency Services & Real-World Response</H3>
                <UL
                  items={[
                    "Recipients of alerts are responsible for deciding how to respond.",
                    "Recipients may contact you directly, contact local authorities, or take other reasonable steps.",
                    "You should keep your device charged and maintain connectivity during active sessions.",
                    "You must not create false emergencies or misuse SOS. Doing so may endanger others and may be illegal.",
                  ]}
                />

                <H3>Fraud, Scam, Kidnapping & Abuse Prevention</H3>
                <UL
                  items={[
                    "StayKnown is a safety product. Misuse can cause serious harm.",
                    "You must never use StayKnown to lure someone, coordinate harm, or mislead emergency contacts.",
                    "Where required by law or where necessary to prevent harm, we may preserve relevant logs and cooperate with lawful requests.",
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
