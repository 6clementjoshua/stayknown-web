export type StayKnownChatDemoMode = "direct" | "circle" | "permissions";

export type StayKnownChatFlowStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  note: string;
};

export const STAYKNOWN_CHAT_FLOW_STEPS: readonly StayKnownChatFlowStep[] = [
  {
    id: "recognise",
    eyebrow: "1 · Recognise",
    title: "Know who you are speaking with.",
    body: "Names, avatars, verification context, approved-contact status, and account protection help people recognise the conversation before they depend on it.",
    note: "Opening Chat does not create hidden safety access or a new contact relationship.",
  },
  {
    id: "choose",
    eyebrow: "2 · Choose",
    title: "Choose the right conversation boundary.",
    body: "Use a private approved-contact conversation, or enter a Trusted Circle only after its invitation and consent requirements are satisfied.",
    note: "A Trusted Circle is a separate conversation. It does not expose the old private thread.",
  },
  {
    id: "control",
    eyebrow: "3 · Control",
    title: "Control who can receive a message.",
    body: "In a Trusted Circle, a sender can use Everyone or select specific members. The sender and Circle Lead remain included, and the server enforces the audience.",
    note: "Members outside the selected audience do not receive the message or its notification preview.",
  },
  {
    id: "communicate",
    eyebrow: "4 · Communicate",
    title: "Communicate in the format the moment needs.",
    body: "Text, replies, translation-aware messages, voice notes, photos, videos, files, audio, stickers, and deliberately shared location can carry useful context.",
    note: "Location is never exposed merely because someone joins a conversation.",
  },
  {
    id: "finish",
    eyebrow: "5 · Preserve boundaries",
    title: "Preserve the correct history when the Circle ends.",
    body: "If the founding pair returns to direct Chat, the original private conversation remains unchanged and the closed Circle stays separate as read-only history.",
    note: "Circle messages are never merged into the original one-to-one conversation.",
  },
] as const;

export const TRUSTED_CIRCLE_CONSENT_STEPS = [
  {
    number: "01",
    title: "A member suggests someone they already know",
    body: "The proposed person must come from an approved StayKnown relationship belonging to the member making the suggestion.",
  },
  {
    number: "02",
    title: "The Circle Lead reviews the suggestion",
    body: "The Lead decides whether the proposal may move forward. A suggestion does not instantly add anyone.",
  },
  {
    number: "03",
    title: "Existing members receive a limited introduction",
    body: "Members see only the identity and relationship context needed to make a Circle-specific decision—not private phone numbers, email addresses, exact location, or direct-chat history.",
  },
  {
    number: "04",
    title: "Required members approve or decline",
    body: "The candidate invitation is released only after the required existing-member consent is complete.",
  },
  {
    number: "05",
    title: "The candidate independently accepts",
    body: "The candidate reviews the Circle, policies, members, rules, and safety notice before entering. Access begins only after acceptance.",
  },
] as const;

export const TRUSTED_CIRCLE_ROLES = [
  {
    role: "Circle Lead",
    label: "Founding authority",
    body: "The first successful visible-message sender in the founding direct conversation becomes the immutable Lead when the Circle is created. The Lead approves invitations, controls rules, manages roles and permissions, removes members, and closes or transfers the Circle.",
  },
  {
    role: "Circle Steward",
    label: "Delegated capability",
    body: "A Steward receives only the specific capabilities the Lead grants, such as helping with description or pins. Steward status does not silently inherit every Lead power.",
  },
  {
    role: "Circle Member",
    label: "Consented participant",
    body: "A Member can participate only after the required Circle consent and invitation flow. Membership does not automatically create direct Chat, emergency-contact, SOS-contact, or location access.",
  },
] as const;

export const STAYKNOWN_CHAT_BOUNDARIES = [
  "No automatic access to private messages sent before joining a Trusted Circle.",
  "No conversion of an old one-to-one thread into a multi-member history.",
  "No automatic location sharing because someone is a Chat or Circle member.",
  "No automatic direct Chat relationship between every Circle participant.",
  "No broad device-media scan for occasional attachments; the user chooses files through system pickers.",
  "No silent permission expansion: Circle Lead and Steward capabilities remain explicit and auditable.",
] as const;

export const STAYKNOWN_CHAT_FAQS = [
  {
    question: "Who can start a direct StayKnown conversation?",
    answer:
      "Direct Chat is tied to an authorised StayKnown relationship. Opening a profile or searching for someone does not by itself grant private Chat or safety access.",
  },
  {
    question: "Does a Trusted Circle reveal the original private chat?",
    answer:
      "No. StayKnown creates a separate Trusted Circle conversation. Earlier direct messages, attachments, locations, replies, reactions, pins, and safety cards are not copied into the Circle.",
  },
  {
    question: "Can every Circle member add another person immediately?",
    answer:
      "No. A member may suggest an approved contact, but the Lead review, required existing-member consent, and the candidate’s independent acceptance must be completed first.",
  },
  {
    question: "Can a Circle message be visible to selected people only?",
    answer:
      "Yes. The sender may choose specific members. The sender and Circle Lead remain included, and StayKnown’s server-side audience rules control delivery, replies, reactions, attachments, receipts, and notification previews.",
  },
  {
    question: "Does joining a Circle share my location?",
    answer:
      "No. Location remains a separate deliberate action. A person must choose Location and confirm the share; Circle membership alone does not request or expose location.",
  },
  {
    question: "What happens when a Trusted Circle returns to two people?",
    answer:
      "When the remaining people are the original approved founding pair, StayKnown can complete a short return flow and reopen their original direct conversation. Circle history stays separate and read-only. If they are not the founding approved pair, StayKnown does not silently create private Chat access.",
  },
  {
    question: "Which plans include Trusted Circle Chat?",
    answer:
      "Trusted Circle creation and participation are designed for StayKnown Pro and Pro Max, subject to account eligibility and coordinated feature availability. Capacity and advanced controls depend on the active plan.",
  },
  {
    question: "Does StayKnown replace emergency services?",
    answer:
      "No. Chat can help trusted people communicate and understand safety context, but it does not guarantee professional monitoring, emergency dispatch, or rescue. Contact the appropriate local emergency service when urgent help is required.",
  },
] as const;
