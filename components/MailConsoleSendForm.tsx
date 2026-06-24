"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type AttachmentMode = "attach" | "link_only" | "inline_image";

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
}: Props) {
  const [mode, setMode] = useState<MailMode>("support");
  const [senderId, setSenderId] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState(defaultTitleForMode("support"));
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState(defaultBadgeForMode("support"));
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePosition, setImagePosition] = useState<ImagePosition>("none");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [footerPolicyId, setFooterPolicyId] = useState("");
  const [customFooter, setCustomFooter] = useState("");
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

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
      form.append("image_url", imageUrl);
      form.append("image_position", imagePosition);
      form.append("cta_label", ctaLabel);
      form.append("cta_url", ctaUrl);
      form.append("footer_policy_id", footerPolicyId);
      form.append(
        "footer_html",
        customFooter || selectedFooter?.footer_html || "",
      );

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

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 24,
        color: "#050505",
      }}
    >
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
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 950,
                  letterSpacing: 2.8,
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.58)",
                }}
              >
                StayKnown Mail Console
              </div>

              <h1
                style={{
                  margin: "8px 0 4px",
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 950,
                }}
              >
                Compose Email
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "rgba(0,0,0,0.62)",
                  lineHeight: 1.5,
                }}
              >
                Logged in as {adminEmail}
              </p>
            </div>

            <Link
              href="/mail-console"
              style={{
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
              }}
            >
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

            <div style={sectionHeaderStyle}>Brand image and CTA</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Image position</label>
                <select
                  value={imagePosition}
                  onChange={(e) =>
                    setImagePosition(e.target.value as ImagePosition)
                  }
                  style={inputStyle}
                >
                  <option value="none">No image</option>
                  <option value="top">Before message</option>
                  <option value="bottom">After message</option>
                  <option value="both">Before and after</option>
                </select>
              </div>
            </div>

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
                  style={inputStyle}
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
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
              />
            </div>

            <div style={sectionHeaderStyle}>Attachments</div>

            <div style={uploadBoxStyle}>
              <input
                type="file"
                multiple
                onChange={handleFiles}
                accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
              />

              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "rgba(0,0,0,0.62)",
                }}
              >
                Images can be inline, attached, or link-only. Videos and large
                documents should usually be attached or link-only for better
                delivery.
              </div>
            </div>

            {files.length > 0 ? (
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {files.map((picked) => (
                  <div key={picked.id} style={fileRowStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, wordBreak: "break-word" }}>
                        {picked.file.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(0,0,0,0.58)",
                          marginTop: 3,
                        }}
                      >
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

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button
                type="button"
                onClick={previewOnly}
                style={secondaryButtonStyle}
              >
                Preview Setup
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
              <span>Image</span>
              <b>{imageUrl ? imagePosition : "None"}</b>
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

            <div
              style={{
                borderRadius: 22,
                background: "#f3f4f6",
                border: "1px solid rgba(0,0,0,0.08)",
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 950,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.58)",
                  marginBottom: 12,
                }}
              >
                Email preview notes
              </div>

              <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
                {title || "Header title"}
              </h3>

              {badge ? (
                <div
                  style={{
                    display: "inline-block",
                    borderRadius: 999,
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.10)",
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 950,
                    marginBottom: 10,
                  }}
                >
                  {badge}
                </div>
              ) : null}

              {subtitle ? (
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: "rgba(0,0,0,0.62)",
                  }}
                >
                  {subtitle}
                </p>
              ) : null}

              <div
                style={{
                  background: "white",
                  borderRadius: 18,
                  padding: 14,
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontSize: 13,
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  color: "rgba(0,0,0,0.72)",
                  minHeight: 120,
                }}
              >
                {message || "Your email body preview will appear here."}
              </div>

              {footerText ? (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 11,
                    lineHeight: 1.55,
                    color: "rgba(0,0,0,0.55)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {footerText}
                </div>
              ) : null}
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
