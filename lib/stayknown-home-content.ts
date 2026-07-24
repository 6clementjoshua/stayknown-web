export type HomeFaq = {
  question: string;
  answer: string;
};

export const HOME_FAQS: readonly HomeFaq[] = [
  {
    question: "Is StayKnown an always-on tracking app?",
    answer:
      "No. StayKnown is built around user-started safety flows. LIVE location access is connected to a permitted active Visit or SOS flow rather than permanent family tracking.",
  },
  {
    question: "When can approved contacts see my location?",
    answer:
      "Approval establishes a trusted relationship, but it does not automatically begin location sharing. Permitted contacts receive location access only through supported safety flows the user starts or authorizes.",
  },
  {
    question: "What happens when an I’M SAFE check-in is missed?",
    answer:
      "StayKnown can create a missed-check-in notice for the relevant trusted people based on the configured safety flow, helping them understand that confirmation was expected but was not received.",
  },
  {
    question:
      "Does StayKnown replace police, ambulance, or emergency services?",
    answer:
      "No. StayKnown helps users alert trusted contacts and share safety context. It does not guarantee professional dispatch and should not replace contacting the appropriate local emergency service.",
  },
  {
    question: "Does StayKnown have a free plan?",
    answer:
      "Yes. Starter provides core safety access, one approved contact, Visits, twice-daily I’M SAFE check-ins, and basic emergency and safety-proof flows. Pro and Pro Max increase capacity and unlock advanced features.",
  },
  {
    question: "Where can I install StayKnown?",
    answer:
      "StayKnown is currently available for Android through Google Play. The website explains the product, plans, privacy boundaries, safety policies, and onboarding before installation.",
  },
] as const;
