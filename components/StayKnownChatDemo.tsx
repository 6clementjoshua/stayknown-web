"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  STAYKNOWN_CHAT_FLOW_STEPS,
  type StayKnownChatDemoMode,
} from "@/lib/stayknown-chat-content";

type StayKnownChatDemoProps = {
  variant?: "homepage" | "page";
};

type DemoMessage = {
  id: string;
  sender: string;
  body: string;
  translatedBody?: string;
  mine?: boolean;
  system?: boolean;
  audience?: string;
  state?: string;
};

const MODES: readonly {
  id: StayKnownChatDemoMode;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: "direct",
    label: "Approved-contact Chat",
    shortLabel: "Direct",
    description:
      "A protected one-to-one conversation connected to a recognised StayKnown relationship.",
  },
  {
    id: "circle",
    label: "Trusted Circle",
    shortLabel: "Circle",
    description:
      "A separate multi-member conversation with Lead authority, consent, roles, and audience controls.",
  },
  {
    id: "permissions",
    label: "Safety permissions",
    shortLabel: "Permissions",
    description:
      "A visible boundary showing what Chat membership does—and does not—authorise.",
  },
] as const;

const MEMBER_NAMES = ["Clement", "Chigozie", "Bassey", "Amaka"] as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function modeMessages(
  mode: StayKnownChatDemoMode,
  step: number,
): readonly DemoMessage[] {
  if (mode === "direct") {
    return [
      {
        id: "direct-system",
        sender: "StayKnown",
        body: "Approved-contact conversation · protected entry active",
        system: true,
      },
      {
        id: "direct-one",
        sender: "Amaka",
        body: "I have reached the meeting point safely.",
        translatedBody: "J’ai atteint le point de rendez-vous en sécurité.",
        state: step >= 2 ? "Translated for recipient" : "Delivered",
      },
      {
        id: "direct-two",
        sender: "You",
        body: "Thank you. I will remain available until you leave.",
        translatedBody: "Merci. Je resterai disponible jusqu’à ton départ.",
        mine: true,
        state: step >= 3 ? "Read" : "Sent",
      },
      ...(step >= 4
        ? [
            {
              id: "direct-location",
              sender: "StayKnown",
              body: "Location was shared deliberately for this message only.",
              system: true,
            } satisfies DemoMessage,
          ]
        : []),
    ];
  }

  if (mode === "circle") {
    return [
      {
        id: "circle-system",
        sender: "StayKnown",
        body:
          step < 2
            ? "Trusted Circle · 4 approved members · Clement is Circle Lead"
            : "Audience control is active · sender and Circle Lead remain included",
        system: true,
      },
      {
        id: "circle-one",
        sender: "Chigozie",
        body: "The bus has arrived. We are waiting inside the terminal.",
        state: "Delivered to Circle audience",
      },
      {
        id: "circle-two",
        sender: "You",
        body:
          step >= 2
            ? "Visible only to Clement, Chigozie and Amaka."
            : "I can see the update. Please stay together.",
        mine: true,
        audience: step >= 2 ? "Visible to 3 Circle members" : "Everyone",
        state: step >= 3 ? "Read by 2" : "Sent",
      },
      ...(step >= 4
        ? [
            {
              id: "circle-history",
              sender: "StayKnown",
              body:
                "Messages from before a member joined remain hidden. Direct-chat history stays separate.",
              system: true,
            } satisfies DemoMessage,
          ]
        : []),
    ];
  }

  return [
    {
      id: "permission-system",
      sender: "StayKnown",
      body: "Permission review · no new access is granted automatically",
      system: true,
    },
    {
      id: "permission-one",
      sender: "Circle consent",
      body:
        step < 2
          ? "Amaka was suggested by Chigozie. Existing members must review the limited introduction."
          : "Required member consent completed. Amaka may now review her own invitation.",
      state: step >= 2 ? "Consent complete" : "Waiting for decisions",
    },
    {
      id: "permission-two",
      sender: "Safety boundary",
      body:
        step >= 3
          ? "Joining does not grant direct Chat, emergency-contact status, SOS access, or location access."
          : "Private contact details and old conversation history are not included in the introduction.",
      mine: true,
      state: "Auditable",
    },
    ...(step >= 4
      ? [
          {
            id: "permission-finish",
            sender: "StayKnown",
            body:
              "If the Circle closes, its history remains separate and the original private thread is not changed.",
            system: true,
          } satisfies DemoMessage,
        ]
      : []),
  ];
}

function DemoIcon({ name }: { name: "lock" | "circle" | "shield" | "arrow" }) {
  const paths = {
    lock: ["M7 10V7a5 5 0 0 1 10 0v3", "M5 10h14v11H5z", "M12 14v3"],
    circle: [
      "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
      "M17 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
      "M3 21v-2a5 5 0 0 1 10 0v2",
      "M14 21v-1.5a4 4 0 0 1 8 0V21",
    ],
    shield: ["M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z", "m8.8 12 2.1 2.1 4.6-4.8"],
    arrow: ["M5 12h14", "m13 6 6 6-6 6"],
  } as const;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      {paths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function modeIcon(mode: StayKnownChatDemoMode) {
  return mode === "direct" ? "lock" : mode === "circle" ? "circle" : "shield";
}

export default function StayKnownChatDemo({
  variant = "homepage",
}: StayKnownChatDemoProps) {
  const [mode, setMode] = useState<StayKnownChatDemoMode>("direct");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [translationOn, setTranslationOn] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<readonly string[]>([
    "Clement",
    "Chigozie",
    "Amaka",
  ]);

  const isPage = variant === "page";
  const activeMode = MODES.find((item) => item.id === mode) ?? MODES[0];
  const activeStep = STAYKNOWN_CHAT_FLOW_STEPS[step];
  const messages = useMemo(() => modeMessages(mode, step), [mode, step]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % STAYKNOWN_CHAT_FLOW_STEPS.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [playing]);

  function chooseMode(nextMode: StayKnownChatDemoMode) {
    setMode(nextMode);
    setStep(0);
    setTranslationOn(false);
  }

  function toggleMember(member: string) {
    if (member === "Clement") return;

    setSelectedMembers((current) => {
      if (current.includes(member)) {
        const next = current.filter((item) => item !== member);
        return next.length >= 2 ? next : current;
      }
      return [...current, member];
    });
  }

  return (
    <section
      id={isPage ? "interactive-chat-demo" : "chat-demo"}
      aria-labelledby={isPage ? "interactive-chat-demo-title" : "chat-demo-title"}
      className={`relative overflow-hidden bg-black ${
        isPage ? "py-8 sm:py-12" : "py-16 sm:py-20 lg:py-24"
      }`}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[760px] w-[1160px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
      <div className="pointer-events-none absolute left-[12%] top-[18%] h-64 w-64 rounded-full bg-[#8ff3d0]/[0.055] blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[8%] right-[8%] h-56 w-56 rounded-full bg-white/[0.035] blur-[110px]" />

      <div className={`relative mx-auto px-4 sm:px-5 lg:px-6 ${isPage ? "max-w-7xl" : "max-w-6xl"}`}>
        {!isPage ? (
          <div className="mx-auto max-w-4xl text-center" data-sk-reveal>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
              Interactive Chat demo
            </div>
            <h2
              id="chat-demo-title"
              className="sk-sharp-type mt-4 text-[34px] font-black leading-[0.98] tracking-[-0.065em] text-white sm:text-[46px] md:text-[56px]"
            >
              See how conversation, consent, and safety permissions move together.
            </h2>
            <p className="mx-auto mt-5 max-w-[76ch] text-[14px] font-semibold leading-relaxed text-white/62 sm:text-[15px] md:text-[16px]">
              Tap through a private approved-contact Chat, a Trusted Circle, and the permission flow that protects every person before access changes.
            </p>
          </div>
        ) : null}

        <div
          className={`overflow-hidden rounded-[34px] border border-white/[0.13] bg-[#050505] shadow-[0_38px_116px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.075)] ${
            isPage ? "mt-2" : "mt-10"
          }`}
        >
          <div className="border-b border-white/[0.09] p-3 sm:p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {MODES.map((item) => {
                const selected = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseMode(item.id)}
                    aria-pressed={selected}
                    className={`group min-h-[74px] rounded-[20px] border p-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ff3d0]/45 ${
                      selected
                        ? "border-[#8ff3d0]/50 bg-[#8ff3d0]/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                        : "border-white/[0.1] bg-black hover:border-white/[0.2] hover:bg-white/[0.035]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] border ${
                          selected
                            ? "border-[#8ff3d0]/45 text-[#8ff3d0]"
                            : "border-white/[0.13] text-white/56"
                        }`}
                      >
                        <DemoIcon name={modeIcon(item.id)} />
                      </span>
                      <span>
                        <span className={`block text-[10px] font-black uppercase tracking-[0.12em] ${selected ? "text-white" : "text-white/64"}`}>
                          {item.label}
                        </span>
                        <span className="mt-1 block text-[9.5px] font-semibold leading-relaxed text-white/38">
                          {item.description}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[650px] overflow-hidden border-b border-white/[0.09] p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(143,243,208,0.075),transparent_42%)]" />
              <div className="relative mx-auto flex max-w-[470px] flex-col overflow-hidden rounded-[32px] border border-white/[0.14] bg-black shadow-[0_40px_100px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-3 border-b border-white/[0.09] px-4 py-3.5">
                  <div className="flex -space-x-2">
                    {(mode === "circle" ? MEMBER_NAMES.slice(0, 3) : [mode === "direct" ? "A" : "S"]).map((name, index) => (
                      <span
                        key={`${name}-${index}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[linear-gradient(145deg,#ffffff,#b8bec5)] text-[9px] font-black text-black shadow-[0_7px_16px_rgba(0,0,0,0.48)]"
                      >
                        {name.length === 1 ? name : initials(name)}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-black text-white">
                      {mode === "direct"
                        ? "Amaka · Approved contact"
                        : mode === "circle"
                          ? "Home Safety Circle"
                          : "Circle permission review"}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-[0.12em] text-[#8ff3d0]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8ff3d0]" />
                      {mode === "direct"
                        ? "Protected Chat"
                        : mode === "circle"
                          ? "4 members · 3 active"
                          : "Consent required"}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={playing ? "Pause animated Chat demo" : "Play animated Chat demo"}
                    onClick={() => setPlaying((current) => !current)}
                    className="inline-flex h-9 items-center rounded-full border border-white/[0.13] px-3 text-[8px] font-black uppercase tracking-[0.12em] text-white/58 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ff3d0]/45"
                  >
                    {playing ? "Pause" : "Play"}
                  </button>
                </div>

                <div className="min-h-[390px] space-y-3 px-3.5 py-4 sm:px-4" aria-live="polite">
                  {messages.map((message, index) => {
                    if (message.system) {
                      return (
                        <div
                          key={`${mode}-${step}-${message.id}`}
                          className="sk-chat-demo-message mx-auto max-w-[92%] rounded-[14px] border border-[#8ff3d0]/25 bg-[#8ff3d0]/[0.05] px-3 py-2 text-center text-[8.8px] font-bold leading-relaxed text-[#b9ffe9]/72"
                          style={{ animationDelay: `${index * 70}ms` }}
                        >
                          {message.body}
                        </div>
                      );
                    }

                    const visibleBody =
                      translationOn && message.translatedBody
                        ? message.translatedBody
                        : message.body;

                    return (
                      <div
                        key={`${mode}-${step}-${message.id}`}
                        className={`sk-chat-demo-message flex ${message.mine ? "justify-end" : "justify-start"}`}
                        style={{ animationDelay: `${index * 90}ms` }}
                      >
                        <div
                          className={`max-w-[86%] rounded-[20px] border px-3.5 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)] ${
                            message.mine
                              ? "rounded-br-[7px] border-white bg-white text-black"
                              : "rounded-bl-[7px] border-white/[0.13] bg-[#0b0d10] text-white"
                          }`}
                        >
                          <div className={`text-[8.5px] font-black uppercase tracking-[0.1em] ${message.mine ? "text-black/44" : "text-[#8ff3d0]/76"}`}>
                            {message.sender}
                          </div>
                          <div className={`mt-1.5 text-[11.5px] font-semibold leading-relaxed ${message.mine ? "text-black/78" : "text-white/76"}`}>
                            {visibleBody}
                          </div>
                          {message.audience ? (
                            <div className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[7.8px] font-black ${message.mine ? "border-black/10 text-black/52" : "border-white/10 text-white/48"}`}>
                              {mode === "circle" && step >= 2
                                ? `Visible to ${selectedMembers.length} Circle members`
                                : message.audience}
                            </div>
                          ) : null}
                          {message.state ? (
                            <div className={`mt-2 text-right text-[7.8px] font-bold ${message.mine ? "text-black/36" : "text-white/34"}`}>
                              {message.state}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {playing ? (
                    <div className="flex items-center gap-1.5 pl-2 text-[8.5px] font-bold text-white/34">
                      <span>{mode === "circle" ? "Chigozie is typing" : "Amaka is typing"}</span>
                      <span className="sk-chat-demo-dot h-1.5 w-1.5 rounded-full bg-white/45" />
                      <span className="sk-chat-demo-dot h-1.5 w-1.5 rounded-full bg-white/45 [animation-delay:140ms]" />
                      <span className="sk-chat-demo-dot h-1.5 w-1.5 rounded-full bg-white/45 [animation-delay:280ms]" />
                    </div>
                  ) : null}
                </div>

                {mode === "circle" ? (
                  <div className="border-t border-white/[0.08] px-3.5 py-3">
                    <div className="mb-2 text-[8px] font-black uppercase tracking-[0.13em] text-white/34">
                      Selective audience demo
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MEMBER_NAMES.map((member) => {
                        const selected = selectedMembers.includes(member);
                        const locked = member === "Clement";
                        return (
                          <button
                            key={member}
                            type="button"
                            onClick={() => toggleMember(member)}
                            aria-pressed={selected}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[8px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ff3d0]/45 ${
                              selected
                                ? "border-[#8ff3d0]/45 bg-[#8ff3d0]/[0.08] text-[#b9ffe9]"
                                : "border-white/[0.1] text-white/42"
                            }`}
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[6px]">
                              {initials(member)}
                            </span>
                            {member}
                            {locked ? " · Lead" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : mode === "direct" ? (
                  <div className="flex items-center justify-between border-t border-white/[0.08] px-3.5 py-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.13em] text-white/34">
                      Translation preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setTranslationOn((current) => !current)}
                      aria-pressed={translationOn}
                      className={`inline-flex h-8 items-center rounded-full border px-3 text-[8px] font-black uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ff3d0]/45 ${
                        translationOn
                          ? "border-[#8ff3d0]/45 bg-[#8ff3d0]/[0.08] text-[#b9ffe9]"
                          : "border-white/[0.12] text-white/48"
                      }`}
                    >
                      {translationOn ? "Translated" : "Original"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-px border-t border-white/[0.08] bg-white/[0.08]">
                    <div className="bg-black px-3 py-3 text-center text-[8px] font-black uppercase tracking-[0.1em] text-white/42">
                      No hidden history
                    </div>
                    <div className="bg-black px-3 py-3 text-center text-[8px] font-black uppercase tracking-[0.1em] text-white/42">
                      No automatic location
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-[650px] flex-col p-5 sm:p-7 lg:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#8ff3d0]">
                    {activeMode.shortLabel} flow · Step {step + 1} of {STAYKNOWN_CHAT_FLOW_STEPS.length}
                  </div>
                  <h3
                    id={isPage ? "interactive-chat-demo-title" : undefined}
                    className="sk-sharp-type mt-3 max-w-[15ch] text-[34px] font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-[42px]"
                  >
                    {activeStep.title}
                  </h3>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-[#8ff3d0]/35 text-[#8ff3d0] shadow-[0_0_28px_rgba(143,243,208,0.08)]">
                  <DemoIcon name={modeIcon(mode)} />
                </span>
              </div>

              <p className="mt-5 text-[13px] font-semibold leading-relaxed text-white/58 sm:text-[14px]">
                {activeStep.body}
              </p>

              <div className="mt-5 rounded-[20px] border border-[#8ff3d0]/25 bg-[#8ff3d0]/[0.045] p-4">
                <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8ff3d0]/68">
                  Safety boundary
                </div>
                <p className="mt-2 text-[11px] font-semibold leading-relaxed text-white/62">
                  {activeStep.note}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-1.5" aria-label="Chat demo steps">
                {STAYKNOWN_CHAT_FLOW_STEPS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setStep(index);
                      setPlaying(false);
                    }}
                    aria-label={`Show ${item.eyebrow}: ${item.title}`}
                    aria-pressed={index === step}
                    className={`h-2 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ff3d0]/45 ${
                      index === step
                        ? "bg-[#8ff3d0] shadow-[0_0_16px_rgba(143,243,208,0.34)]"
                        : index < step
                          ? "bg-white/42"
                          : "bg-white/12 hover:bg-white/24"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep((current) =>
                      current === 0
                        ? STAYKNOWN_CHAT_FLOW_STEPS.length - 1
                        : current - 1,
                    );
                    setPlaying(false);
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-[14px] border border-white/[0.13] text-[9px] font-black uppercase tracking-[0.12em] text-white/58 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                >
                  Previous step
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep((current) =>
                      (current + 1) % STAYKNOWN_CHAT_FLOW_STEPS.length,
                    );
                    setPlaying(false);
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-[14px] border border-white bg-white text-[9px] font-black uppercase tracking-[0.12em] text-black transition hover:-translate-y-px hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
                >
                  Next step
                </button>
              </div>

              <div className="mt-auto pt-8">
                {!isPage ? (
                  <Link
                    href="/chat"
                    className="group inline-flex min-h-11 w-full items-center justify-between rounded-[16px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_14px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1)] transition hover:-translate-y-px hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:w-auto sm:min-w-[260px]"
                  >
                    Explore the complete Chat system
                    <span className="transition group-hover:translate-x-1">
                      <DemoIcon name="arrow" />
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.13em] text-white/34">
                    <span className="h-2 w-2 rounded-full bg-[#8ff3d0]" />
                    Interactive demonstration · no account data used
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sk-chat-demo-enter {
          from {
            opacity: 0;
            transform: translate3d(0, 9px, 0) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes sk-chat-demo-dot {
          0%, 70%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          35% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }

        .sk-chat-demo-message {
          opacity: 0;
          animation: sk-chat-demo-enter 420ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .sk-chat-demo-dot {
          animation: sk-chat-demo-dot 1.2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sk-chat-demo-message,
          .sk-chat-demo-dot {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
