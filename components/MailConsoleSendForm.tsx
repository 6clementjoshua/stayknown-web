"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type AttachmentMode = "attach" | "link_only" | "inline_image";

type PolicyLinkKey =
  | "privacy"
  | "terms"
  | "location_safety"
  | "contact_consent"
  | "acceptable_use"
  | "safety"
  | "trust_safety"
  | "verification_policy"
  | "emergency"
  | "minors"
  | "guardian_consent"
  | "abuse"
  | "retention"
  | "law"
  | "security"
  | "creator_policy"
  | "donor_policy"
  | "billing_policy";

const POLICY_LINK_OPTIONS: Array<{
  key: PolicyLinkKey;
  label: string;
  href: string;
}> = [
  {
    key: "privacy",
    label: "Privacy Policy",
    href: "https://stay-known.com/privacy",
  },
  {
    key: "terms",
    label: "Terms of Service",
    href: "https://stay-known.com/terms",
  },
  {
    key: "location_safety",
    label: "Location & Live Safety",
    href: "https://stay-known.com/location-safety",
  },
  {
    key: "contact_consent",
    label: "Contact Consent",
    href: "https://stay-known.com/contact-consent",
  },
  {
    key: "acceptable_use",
    label: "Acceptable Use",
    href: "https://stay-known.com/acceptable-use",
  },
  {
    key: "safety",
    label: "Safety & Anti-Stalking",
    href: "https://stay-known.com/safety",
  },
  {
    key: "trust_safety",
    label: "Trust & Safety",
    href: "https://stay-known.com/trust-safety",
  },
  {
    key: "verification_policy",
    label: "Verification Policy",
    href: "https://stay-known.com/verification-policy",
  },
  {
    key: "emergency",
    label: "Emergency Disclaimer",
    href: "https://stay-known.com/emergency",
  },
  {
    key: "minors",
    label: "Child Safety & Minor Use",
    href: "https://stay-known.com/minors",
  },
  {
    key: "guardian_consent",
    label: "Guardian Consent",
    href: "https://stay-known.com/guardian-consent",
  },
  {
    key: "abuse",
    label: "Abuse Reporting",
    href: "https://stay-known.com/abuse",
  },
  {
    key: "retention",
    label: "Data Retention",
    href: "https://stay-known.com/retention",
  },
  {
    key: "law",
    label: "Law Enforcement Requests",
    href: "https://stay-known.com/law",
  },
  {
    key: "security",
    label: "Security Disclosure",
    href: "https://stay-known.com/security",
  },
  {
    key: "creator_policy",
    label: "Creator Policy",
    href: "https://stay-known.com/creator-policy",
  },
  {
    key: "donor_policy",
    label: "Donor Policy",
    href: "https://stay-known.com/donor-policy",
  },
  {
    key: "billing_policy",
    label: "Billing & Refunds",
    href: "https://stay-known.com/billing-policy",
  },
];

type MailTemplate = {
  id: string;
  name: string;
  mode: string;
  subject: string | null;
  body_text: string | null;
  default_image_position: string;
};

type SenderIdentity = {
  id: string;
  label: string;
  from_email: string;
  reply_to_email: string | null;
  purpose: string;
  can_send_support: boolean;
  can_send_newsletter: boolean;
};

type FooterPolicy = {
  id: string;
  name: string;
  mode: string;
  footer_html: string;
  footer_text: string | null;
  is_default: boolean;
};

type PickedFile = {
  id: string;
  file: File;
  mode: AttachmentMode;
};

type Props = {
  adminEmail: string;
  senders: SenderIdentity[];
  footerPolicies: FooterPolicy[];
  templates: MailTemplate[];
};

function senderAllowedForMode(sender: SenderIdentity, mode: MailMode) {
  if (mode === "newsletter" || mode === "advert") {
    return sender.can_send_newsletter;
  }

  return sender.can_send_support;
}

function modeLabel(mode: MailMode) {
  if (mode === "newsletter") return "Newsletter";
  if (mode === "advert") return "Advert / Announcement";
  if (mode === "investor") return "Investor Update";
  return "Support / Direct Email";
}

function defaultTitleForMode(mode: MailMode) {
  if (mode === "newsletter") return "StayKnown Newsletter";
  if (mode === "advert") return "StayKnown Announcement";
  if (mode === "investor") return "StayKnown Investor Update";
  return "StayKnown Support";
}

function defaultBadgeForMode(mode: MailMode) {
  if (mode === "newsletter") return "NEWSLETTER";
  if (mode === "advert") return "ANNOUNCEMENT";
  if (mode === "investor") return "INVESTOR";
  return "SUPPORT";
}

function niceFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MailConsoleSendForm({
  adminEmail,
  senders,
  footerPolicies,
  templates,
}: Props) {
  const brandLogoUrl = "/6logo.png";

  const [templateId, setTemplateId] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);

  const [mode, setMode] = useState<MailMode>("support");
  const [senderId, setSenderId] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState(defaultTitleForMode("support"));
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState(defaultBadgeForMode("support"));
  const [message, setMessage] = useState("");

  const [bannerTopFile, setBannerTopFile] = useState<File | null>(null);
  const [bannerBottomFile, setBannerBottomFile] = useState<File | null>(null);
  const [bannerTopPreviewUrl, setBannerTopPreviewUrl] = useState("");
  const [bannerBottomPreviewUrl, setBannerBottomPreviewUrl] = useState("");
  const [imagePosition, setImagePosition] = useState<ImagePosition>("none");

  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const [footerPolicyId, setFooterPolicyId] = useState("");
  const [customFooter, setCustomFooter] = useState("");
  const [selectedPolicyLinks, setSelectedPolicyLinks] = useState<
    PolicyLinkKey[]
  >(["privacy", "terms"]);

  const [files, setFiles] = useState<PickedFile[]>([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    return () => {
      if (bannerTopPreviewUrl) URL.revokeObjectURL(bannerTopPreviewUrl);
      if (bannerBottomPreviewUrl) URL.revokeObjectURL(bannerBottomPreviewUrl);
    };
  }, [bannerTopPreviewUrl, bannerBottomPreviewUrl]);

  const allowedTemplates = useMemo(
    () => templates.filter((t) => t.mode === mode),
    [templates, mode],
  );

  const allowedSenders = useMemo(
    () => senders.filter((s) => senderAllowedForMode(s, mode)),
    [senders, mode],
  );

  const selectedSender = useMemo(
    () => allowedSenders.find((s) => s.id === senderId) || null,
    [allowedSenders, senderId],
  );

  const allowedFooters = useMemo(() => {
    const exact = footerPolicies.filter((f) => f.mode === mode);
    const general = footerPolicies.filter((f) => f.mode === "general");
    return [...exact, ...general];
  }, [footerPolicies, mode]);

  const selectedFooter = useMemo(
    () => allowedFooters.find((f) => f.id === footerPolicyId) || null,
    [allowedFooters, footerPolicyId],
  );

  function changeMode(nextMode: MailMode) {
    setMode(nextMode);
    setSenderId("");
    setFooterPolicyId("");
    setCustomFooter("");
    setTitle(defaultTitleForMode(nextMode));
    setBadge(defaultBadgeForMode(nextMode));
    setStatus(`${modeLabel(nextMode)} mode selected.`);
  }

  function applyTemplate(nextTemplateId: string) {
    setTemplateId(nextTemplateId);

    const template = templates.find((t) => t.id === nextTemplateId);
    if (!template) return;

    const nextMode = template.mode as MailMode;

    setMode(nextMode);
    setSenderId("");
    setFooterPolicyId("");
    setCustomFooter("");
    setSubject(template.subject || "");
    setTitle(template.subject || defaultTitleForMode(nextMode));
    setBadge(defaultBadgeForMode(nextMode));
    setMessage(template.body_text || "");

    const pos = template.default_image_position as ImagePosition;
    if (pos === "none" || pos === "top" || pos === "bottom" || pos === "both") {
      setImagePosition(pos);
    }

    setStatus(`Template loaded: ${template.name}`);
  }

  function pickBannerFile(file: File | null, placement: "top" | "bottom") {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Banner must be an image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (placement === "top") {
      if (bannerTopPreviewUrl) URL.revokeObjectURL(bannerTopPreviewUrl);
      setBannerTopFile(file);
      setBannerTopPreviewUrl(previewUrl);

      if (imagePosition === "none") {
        setImagePosition("top");
      }
    } else {
      if (bannerBottomPreviewUrl) URL.revokeObjectURL(bannerBottomPreviewUrl);
      setBannerBottomFile(file);
      setBannerBottomPreviewUrl(previewUrl);

      if (imagePosition === "none") {
        setImagePosition("bottom");
      }
    }

    setStatus("Banner image selected and shown in preview.");
  }

  function clearBanner(placement: "top" | "bottom") {
    if (placement === "top") {
      if (bannerTopPreviewUrl) URL.revokeObjectURL(bannerTopPreviewUrl);
      setBannerTopFile(null);
      setBannerTopPreviewUrl("");
    } else {
      if (bannerBottomPreviewUrl) URL.revokeObjectURL(bannerBottomPreviewUrl);
      setBannerBottomFile(null);
      setBannerBottomPreviewUrl("");
    }

    setStatus("Banner image removed.");
  }

  async function saveDraft() {
    if (savingDraft) return;

    setSavingDraft(true);
    setStatus("");

    try {
      const res = await fetch("/api/mail-console/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          sender_identity_id: senderId,
          subject,
          title,
          message,
          image_position: imagePosition,
          banner_position: imagePosition,
          banner_note:
            bannerTopFile || bannerBottomFile
              ? "Banner image was selected from device. Device files are included when sending, but not preserved inside saved drafts yet."
              : "",
          cta_label: ctaLabel,
          cta_url: ctaUrl,
          footer_policy_id: footerPolicyId,
          footer_html: customFooter || selectedFooter?.footer_html || "",
          policy_links: selectedPolicyLinks,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus(data.error || "Could not save draft.");
        return;
      }

      setStatus(`Draft saved. Draft ID: ${data.draft_id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save draft.");
    } finally {
      setSavingDraft(false);
    }
  }

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    const mapped = picked.map((file) => {
      const isImage = file.type.startsWith("image/");

      return {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        mode: isImage
          ? ("inline_image" as AttachmentMode)
          : ("attach" as AttachmentMode),
      };
    });

    setFiles((prev) => [...prev, ...mapped]);
    e.target.value = "";
  }

  function updateFileMode(id: string, mode: AttachmentMode) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, mode } : f)));
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function togglePolicyLink(key: PolicyLinkKey) {
    setSelectedPolicyLinks((prev) => {
      if (prev.includes(key)) {
        return prev.filter((x) => x !== key);
      }

      return [...prev, key];
    });
  }

  async function sendEmail() {
    if (sending) return;

    setSending(true);
    setStatus("");

    try {
      const form = new FormData();

      form.append("mode", mode);
      form.append("sender_identity_id", senderId);
      form.append("to", to);
      form.append("subject", subject);
      form.append("title", title);
      form.append("subtitle", subtitle);
      form.append("badge", badge);
      form.append("message", message);

      form.append("image_position", imagePosition);
      form.append("banner_position", imagePosition);

      if (bannerTopFile) {
        form.append("banner_top_file", bannerTopFile, bannerTopFile.name);
      }

      if (bannerBottomFile) {
        form.append(
          "banner_bottom_file",
          bannerBottomFile,
          bannerBottomFile.name,
        );
      }

      form.append("cta_label", ctaLabel);
      form.append("cta_url", ctaUrl);
      form.append("footer_policy_id", footerPolicyId);
      form.append(
        "footer_html",
        customFooter || selectedFooter?.footer_html || "",
      );
      form.append("policy_links", JSON.stringify(selectedPolicyLinks));

      form.append(
        "file_modes",
        JSON.stringify(files.map((picked) => picked.mode)),
      );

      for (const picked of files) {
        form.append("files", picked.file, picked.file.name);
      }

      const res = await fetch("/api/mail-console/send", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus(data.error || "Email send failed.");
        return;
      }

      setStatus(
        `Sent successfully. Sent: ${data.summary?.sent ?? 0}, failed: ${
          data.summary?.failed ?? 0
        }, skipped: ${data.summary?.skipped ?? 0}.`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Email send failed.");
    } finally {
      setSending(false);
    }
  }

  function previewOnly() {
    setStatus("Preview updated.");
  }

  const footerText = customFooter || selectedFooter?.footer_html || "";
  const hasAnyBanner = Boolean(bannerTopFile || bannerBottomFile);
  const topBannerPreview = bannerTopPreviewUrl || bannerBottomPreviewUrl;
  const bottomBannerPreview = bannerBottomPreviewUrl || bannerTopPreviewUrl;

  return (
    <main
      className="sk-mail-composer"
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 24,
        color: "#050505",
      }}
    >
      <style jsx global>{`
        .sk-mail-composer {
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .sk-mail-composer button,
        .sk-mail-composer a,
        .sk-mail-composer input,
        .sk-mail-composer select,
        .sk-mail-composer textarea,
        .sk-mail-composer label[data-button="true"] {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease,
            opacity 180ms ease;
        }

        .sk-mail-composer button:hover,
        .sk-mail-composer a:hover,
        .sk-mail-composer label[data-button="true"]:hover {
          transform: translateY(-1px);
          box-shadow:
            inset 0 0 0 1px rgba(0, 0, 0, 0.12),
            0 18px 42px rgba(0, 0, 0, 0.14) !important;
        }

        .sk-mail-composer button:active,
        .sk-mail-composer a:active,
        .sk-mail-composer label[data-button="true"]:active {
          transform: translateY(0) scale(0.99);
        }

        .sk-mail-composer input:hover,
        .sk-mail-composer select:hover,
        .sk-mail-composer textarea:hover {
          border-color: rgba(0, 0, 0, 0.22) !important;
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.05);
        }

        .sk-mail-composer input:focus,
        .sk-mail-composer select:focus,
        .sk-mail-composer textarea:focus {
          border-color: rgba(0, 0, 0, 0.36) !important;
          box-shadow:
            0 0 0 4px rgba(0, 0, 0, 0.055),
            0 16px 42px rgba(0, 0, 0, 0.06);
        }

        .sk-mail-file-row {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .sk-mail-file-row:hover {
          transform: translateY(-1px);
          border-color: rgba(0, 0, 0, 0.18) !important;
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.96) !important;
        }
      `}</style>

      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header
          style={{
            borderRadius: 30,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.09)",
            padding: 24,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 18,
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={kickerStyle}>StayKnown Mail Console</div>
              <h1 style={h1Style}>Compose Email</h1>
              <p style={subStyle}>Logged in as {adminEmail}</p>
            </div>

            <Link href="/mail-console" style={whitePillLinkStyle}>
              Back to Dashboard
            </Link>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <section style={panelStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Reusable template</label>
              <select
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                style={inputStyle}
              >
                <option value="">Start without template</option>
                {allowedTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={sectionHeaderStyle}>Message setup</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Email mode</label>
                <select
                  value={mode}
                  onChange={(e) => changeMode(e.target.value as MailMode)}
                  style={inputStyle}
                >
                  <option value="support">Support / Direct Email</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="advert">Advert / Announcement</option>
                  <option value="investor">Investor Update</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Sender address</label>
                <select
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select sender</option>
                  {allowedSenders.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} — {s.from_email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Recipient email(s)</label>
              <textarea
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="one@email.com or multiple emails separated by comma/new line"
                style={{ ...inputStyle, minHeight: 78, resize: "vertical" }}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                style={inputStyle}
              />
            </div>

            <div style={grid3Style}>
              <div>
                <label style={labelStyle}>Header title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Badge</label>
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Subtitle</label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Message body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the main email message here..."
                style={{ ...inputStyle, minHeight: 210, resize: "vertical" }}
              />
            </div>

            <div style={sectionHeaderStyle}>Banner image</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Banner position</label>
                <select
                  value={imagePosition}
                  onChange={(e) =>
                    setImagePosition(e.target.value as ImagePosition)
                  }
                  style={inputStyle}
                >
                  <option value="none">No banner image</option>
                  <option value="top">Before message</option>
                  <option value="bottom">After message</option>
                  <option value="both">Before and after</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Top banner image</label>
                <div style={bannerPickerStyle}>
                  <label data-button="true" style={filePickButtonStyle}>
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        pickBannerFile(e.target.files?.[0] || null, "top");
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {bannerTopFile ? (
                    <button
                      type="button"
                      onClick={() => clearBanner("top")}
                      style={smallButtonStyle}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                {bannerTopFile ? (
                  <div style={bannerFileNameStyle}>{bannerTopFile.name}</div>
                ) : null}
              </div>
            </div>

            {imagePosition === "both" || imagePosition === "bottom" ? (
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  {imagePosition === "both"
                    ? "Second / bottom banner image"
                    : "Bottom banner image"}
                </label>

                <div style={bannerPickerStyle}>
                  <label data-button="true" style={filePickButtonStyle}>
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        pickBannerFile(e.target.files?.[0] || null, "bottom");
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {bannerBottomFile ? (
                    <button
                      type="button"
                      onClick={() => clearBanner("bottom")}
                      style={smallButtonStyle}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                {bannerBottomFile ? (
                  <div style={bannerFileNameStyle}>{bannerBottomFile.name}</div>
                ) : imagePosition === "both" && bannerTopFile ? (
                  <div style={bannerFileNameStyle}>
                    No second image selected. Top banner will repeat at the
                    bottom.
                  </div>
                ) : null}
              </div>
            ) : null}

            <div style={sectionHeaderStyle}>CTA button</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>CTA button label</label>
                <input
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Learn More"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>CTA URL</label>
                <input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={sectionHeaderStyle}>Footer policy</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Footer policy</label>
                <select
                  value={footerPolicyId}
                  onChange={(e) => {
                    setFooterPolicyId(e.target.value);
                    setCustomFooter("");
                  }}
                  style={{ ...inputStyle, textAlign: "center" }}
                >
                  <option value="">Select footer policy</option>
                  {allowedFooters.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                      {f.is_default ? " — default" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Reply behavior</label>
                <input
                  value={
                    mode === "newsletter" || mode === "advert"
                      ? "No-reply / newsletter style"
                      : "Reply enabled"
                  }
                  readOnly
                  style={{ ...inputStyle, opacity: 0.76 }}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Editable footer text</label>
              <textarea
                value={customFooter || selectedFooter?.footer_html || ""}
                onChange={(e) => setCustomFooter(e.target.value)}
                placeholder="Select a footer policy or write custom footer text..."
                style={{
                  ...inputStyle,
                  minHeight: 120,
                  resize: "vertical",
                  textAlign: "center",
                  lineHeight: 1.65,
                }}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Clickable policy links</label>

              <div style={policyBoxStyle}>
                {POLICY_LINK_OPTIONS.map((item) => {
                  const active = selectedPolicyLinks.includes(item.key);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => togglePolicyLink(item.key)}
                      style={{
                        border: 0,
                        borderRadius: 999,
                        padding: "9px 11px",
                        background: active ? "#050505" : "white",
                        color: active ? "white" : "#050505",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div style={helpTextStyle}>
                Selected links will appear centered and clickable in the
                delivered email footer.
              </div>
            </div>

            <div style={sectionHeaderStyle}>Attachments</div>

            <div style={uploadBoxStyle}>
              <input
                type="file"
                multiple
                onChange={handleFiles}
                accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
              />

              <div style={helpTextStyle}>
                Attachments are separate from banner images. Use this for files,
                documents, videos, PDFs, or extra inline images.
              </div>
            </div>

            {files.length > 0 ? (
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {files.map((picked) => (
                  <div
                    key={picked.id}
                    className="sk-mail-file-row"
                    style={fileRowStyle}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, wordBreak: "break-word" }}>
                        {picked.file.name}
                      </div>
                      <div style={fileMetaStyle}>
                        {picked.file.type || "unknown type"} ·{" "}
                        {niceFileSize(picked.file.size)}
                      </div>
                    </div>

                    <select
                      value={picked.mode}
                      onChange={(e) =>
                        updateFileMode(
                          picked.id,
                          e.target.value as AttachmentMode,
                        )
                      }
                      style={{
                        ...inputStyle,
                        width: 150,
                        padding: "10px 12px",
                      }}
                    >
                      <option value="attach">Attach</option>
                      <option value="link_only">Link only</option>
                      <option value="inline_image">Inline image</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeFile(picked.id)}
                      style={smallButtonStyle}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={previewOnly}
                style={secondaryButtonStyle}
              >
                Preview Setup
              </button>

              <button
                type="button"
                onClick={saveDraft}
                disabled={savingDraft}
                style={{
                  ...secondaryButtonStyle,
                  opacity: savingDraft ? 0.58 : 1,
                  cursor: savingDraft ? "not-allowed" : "pointer",
                }}
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={sendEmail}
                disabled={sending}
                style={{
                  ...primaryButtonStyle,
                  opacity: sending ? 0.58 : 1,
                  cursor: sending ? "not-allowed" : "pointer",
                }}
              >
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>

            {status ? <div style={statusStyle}>{status}</div> : null}
          </section>

          <aside style={panelStyle}>
            <div style={sectionHeaderStyle}>Live summary</div>

            <div style={summaryRowStyle}>
              <span>Mode</span>
              <b>{modeLabel(mode)}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Sender</span>
              <b>
                {selectedSender ? selectedSender.from_email : "Not selected"}
              </b>
            </div>

            <div style={summaryRowStyle}>
              <span>Reply-to</span>
              <b>{selectedSender?.reply_to_email || "—"}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Recipients</span>
              <b>
                {
                  to
                    .split(/[,\n;]/)
                    .map((x) => x.trim())
                    .filter(Boolean).length
                }
              </b>
            </div>

            <div style={summaryRowStyle}>
              <span>Brand logo</span>
              <b>Inline automatic</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Banner</span>
              <b>{hasAnyBanner ? imagePosition : "None"}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>CTA</span>
              <b>{ctaLabel && ctaUrl ? "Yes" : "No"}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Files</span>
              <b>{files.length}</b>
            </div>

            <div style={{ height: 16 }} />

            <div style={previewOuterStyle}>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <div style={previewBrandTextStyle}>STAYKNOWN™</div>
                <div style={{ height: 6 }} />
                <div style={previewServiceTextStyle}>
                  A 6 Clement Joshua service™
                </div>
                <div style={{ height: 10 }} />

                {logoFailed ? (
                  <div style={logoFallbackStyle}>6</div>
                ) : (
                  <img
                    src={brandLogoUrl}
                    alt="StayKnown"
                    width={64}
                    height={64}
                    onError={() => setLogoFailed(true)}
                    style={{
                      display: "inline-block",
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      boxShadow: "0 14px 38px rgba(0,0,0,0.14)",
                      background: "white",
                    }}
                  />
                )}

                <div style={{ height: 14 }} />

                <div style={previewTitleStyle}>{title || "Header title"}</div>

                {badge ? (
                  <div style={{ marginTop: 10 }}>
                    <span style={previewBadgeStyle}>{badge}</span>
                  </div>
                ) : null}

                {subtitle ? (
                  <div style={previewSubtitleStyle}>{subtitle}</div>
                ) : null}
              </div>

              {topBannerPreview &&
              (imagePosition === "top" || imagePosition === "both") ? (
                <div style={previewBannerWrapStyle}>
                  <img
                    src={topBannerPreview}
                    alt="Top banner"
                    style={previewBannerImageStyle}
                  />
                </div>
              ) : null}

              <div style={previewMessageCardStyle}>
                <div style={previewMessageBodyStyle}>
                  {message || "Your email body preview will appear here."}
                </div>
              </div>

              {bottomBannerPreview &&
              imagePosition !== "none" &&
              (imagePosition === "bottom" || imagePosition === "both") ? (
                <div style={previewBannerWrapStyle}>
                  <img
                    src={bottomBannerPreview}
                    alt="Bottom banner"
                    style={previewBannerImageStyle}
                  />
                </div>
              ) : null}

              {ctaLabel && ctaUrl ? (
                <div style={{ textAlign: "center", marginTop: 18 }}>
                  <span style={previewCtaStyle}>{ctaLabel}</span>
                </div>
              ) : null}

              {footerText ? (
                <div style={previewFooterStyle}>{footerText}</div>
              ) : null}

              {selectedPolicyLinks.length > 0 ? (
                <div style={previewPolicyLinksStyle}>
                  {selectedPolicyLinks.map((key) => {
                    const item = POLICY_LINK_OPTIONS.find((x) => x.key === key);
                    if (!item) return null;

                    return (
                      <a
                        key={key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={previewPolicyLinkStyle}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              ) : null}

              <div style={previewLegalStyle}>
                © {new Date().getFullYear()} StayKnown™ · A 6 Clement Joshua
                service™
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "white",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.06)",
  padding: 22,
};

const kickerStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 2.8,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.58)",
};

const h1Style: React.CSSProperties = {
  margin: "8px 0 4px",
  fontSize: 34,
  lineHeight: 1.05,
  fontWeight: 950,
};

const subStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "rgba(0,0,0,0.62)",
  lineHeight: 1.5,
};

const whitePillLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "13px 18px",
  background: "white",
  color: "#050505",
  fontWeight: 950,
  textDecoration: "none",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 1.8,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.58)",
  margin: "6px 0 14px",
};

const grid2Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
  marginBottom: 14,
};

const grid3Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 14,
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 950,
  color: "rgba(0,0,0,0.65)",
  marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  padding: "13px 14px",
  fontSize: 14,
  color: "#050505",
  outline: "none",
};

const bannerPickerStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 18,
  border: "1px dashed rgba(0,0,0,0.20)",
  background: "rgba(0,0,0,0.025)",
  padding: 12,
};

const filePickButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "10px 14px",
  background: "#050505",
  color: "white",
  fontWeight: 950,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(0,0,0,0.12)",
};

const bannerFileNameStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  lineHeight: 1.5,
  color: "rgba(0,0,0,0.58)",
  wordBreak: "break-word",
};

const policyBoxStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "center",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,0,0,0.025)",
  padding: 12,
};

const uploadBoxStyle: React.CSSProperties = {
  borderRadius: 22,
  border: "1px dashed rgba(0,0,0,0.20)",
  background: "rgba(0,0,0,0.025)",
  padding: 16,
};

const fileRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto auto",
  gap: 10,
  alignItems: "center",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "white",
  padding: 12,
};

const fileMetaStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(0,0,0,0.58)",
  marginTop: 3,
};

const primaryButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "13px 18px",
  background: "#050505",
  color: "white",
  fontWeight: 950,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "13px 18px",
  background: "white",
  color: "#050505",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
};

const smallButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "10px 12px",
  background: "rgba(0,0,0,0.06)",
  color: "#050505",
  fontWeight: 900,
  cursor: "pointer",
};

const statusStyle: React.CSSProperties = {
  marginTop: 14,
  borderRadius: 16,
  background: "rgba(0,0,0,0.035)",
  border: "1px solid rgba(0,0,0,0.07)",
  padding: 12,
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(0,0,0,0.68)",
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  padding: "12px 0",
  fontSize: 13,
};

const helpTextStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(0,0,0,0.58)",
  textAlign: "center",
};

const previewOuterStyle: React.CSSProperties = {
  borderRadius: 22,
  background: "#f3f4f6",
  border: "1px solid rgba(0,0,0,0.08)",
  padding: 16,
};

const previewBrandTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 2.6,
  color: "rgba(0,0,0,0.78)",
};

const previewServiceTextStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.6,
  color: "rgba(0,0,0,0.58)",
};

const logoFallbackStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 64,
  height: 64,
  borderRadius: 18,
  background: "white",
  color: "#050505",
  fontSize: 24,
  fontWeight: 950,
  boxShadow: "0 14px 38px rgba(0,0,0,0.14)",
};

const previewTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 950,
  letterSpacing: 0.2,
  color: "#0b0b0b",
  lineHeight: 1.35,
};

const previewBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.72)",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.6,
  color: "#111",
};

const previewSubtitleStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  color: "rgba(0,0,0,0.65)",
  lineHeight: 1.55,
};

const previewBannerWrapStyle: React.CSSProperties = {
  margin: "14px 0",
  borderRadius: 20,
  border: "1px solid rgba(0,0,0,0.10)",
  overflow: "hidden",
  background: "#ffffff",
  boxShadow: "0 20px 60px rgba(0,0,0,0.07)",
};

const previewBannerImageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxHeight: 420,
  objectFit: "cover",
};

const previewMessageCardStyle: React.CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.78)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92),0 28px 75px rgba(0,0,0,0.09)",
  overflow: "hidden",
};

const previewMessageBodyStyle: React.CSSProperties = {
  padding: "18px 20px",
  fontSize: 15,
  lineHeight: 1.75,
  color: "rgba(0,0,0,0.82)",
  whiteSpace: "pre-wrap",
  minHeight: 130,
};

const previewCtaStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "13px 18px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.86)",
  color: "#0b0b0b",
  textDecoration: "none",
  fontWeight: 950,
  letterSpacing: 0.4,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92),0 20px 55px rgba(0,0,0,0.08)",
};

const previewFooterStyle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 11,
  lineHeight: 1.65,
  color: "rgba(0,0,0,0.55)",
  whiteSpace: "pre-wrap",
  textAlign: "center",
};

const previewPolicyLinksStyle: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "center",
  fontSize: 11,
  lineHeight: 1.5,
  textAlign: "center",
};

const previewPolicyLinkStyle: React.CSSProperties = {
  color: "rgba(0,0,0,0.72)",
  fontWeight: 900,
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

const previewLegalStyle: React.CSSProperties = {
  marginTop: 8,
  textAlign: "center",
  fontSize: 11,
  lineHeight: 1.5,
  color: "rgba(0,0,0,0.52)",
};
