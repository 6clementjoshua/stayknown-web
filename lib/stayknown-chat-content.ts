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
    body: "In a Trusted Circle, a sender can use Everyone or select specific members. The sender and Circle Lead remain included, and StayKnown keeps delivery limited to the selected people.",
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
    body: "The candidate invitation is sent only after the required existing-member consent is complete.",
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
    label: "Circle founder",
    body: "The person who begins the founding direct conversation becomes the Circle Lead when the Circle is created. The Lead reviews invitations, manages rules and roles, removes members, and can close or transfer the Circle.",
  },
  {
    role: "Circle Steward",
    label: "Trusted support role",
    body: "A Steward can help with only the responsibilities the Lead grants, such as updating the description or managing pins. Becoming a Steward does not give every Lead permission.",
  },
  {
    role: "Circle Member",
    label: "Approved participant",
    body: "A Member joins only after the required Circle consent and invitation steps. Membership does not automatically create direct Chat, emergency-contact, SOS-contact, or location access.",
  },
] as const;

export const STAYKNOWN_CHAT_BOUNDARIES = [
  "No automatic access to private messages sent before joining a Trusted Circle.",
  "No conversion of an old one-to-one thread into a multi-member history.",
  "No automatic location sharing because someone is a Chat or Circle member.",
  "No automatic direct Chat relationship between every Circle participant.",
  "No automatic scan of personal photos or files; the user chooses each attachment.",
  "Circle Lead and Steward responsibilities stay clearly defined.",
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
      "Yes. The sender may choose specific members. The sender and Circle Lead remain included, and StayKnown keeps the message, replies, reactions, attachments, receipts, and previews limited to the chosen audience.",
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
      "Trusted Circle features are designed for eligible StayKnown Pro and Pro Max accounts. The StayKnown app shows the current availability, capacity, and controls for each account.",
  },
  {
    question: "Does StayKnown replace emergency services?",
    answer:
      "No. Chat can help trusted people communicate and understand safety context, but it does not guarantee professional monitoring, emergency dispatch, or rescue. Contact the appropriate local emergency service when urgent help is required.",
  },
] as const;
