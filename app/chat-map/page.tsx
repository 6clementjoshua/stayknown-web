import ChatMapClient from "./chat-map-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanOne(v: string | string[] | undefined) {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

function InvalidState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-6 max-w-md">
        <div className="mx-auto mb-5 flex items-center justify-center">
          <img
            src="/6logo.png"
            alt="StayKnown"
            className="h-10 w-10 object-contain"
          />
        </div>

        <h1 className="text-xl font-bold tracking-tight">
          Location unavailable
        </h1>

        <p className="opacity-60 mt-2 text-sm leading-6">
          This StayKnown chat location could not be opened. Please return to the
          approved chat and open the location again.
        </p>
      </div>
    </div>
  );
}

export default async function ChatMapPage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const sp = await searchParams;

  const lat = Number(cleanOne(sp.lat));
  const lng = Number(cleanOne(sp.lng));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return <InvalidState />;
  }

  const payload = {
    lat,
    lng,
    accuracy: Number(cleanOne(sp.accuracy)),
    place: cleanOne(sp.place),
    capturedAt: cleanOne(sp.captured_at),
    senderName: cleanOne(sp.sender_name),
    senderUsername: cleanOne(sp.sender_username),
    senderId: cleanOne(sp.sender_id),
    context: cleanOne(sp.context),
    messageId: cleanOne(sp.message_id),
    threadId: cleanOne(sp.thread_id),
  };

  return <ChatMapClient payload={payload} />;
}
