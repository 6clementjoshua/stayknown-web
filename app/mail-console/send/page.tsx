import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import MailConsoleSendForm from "@/components/MailConsoleSendForm";
import {
  MAIL_CONSOLE_COOKIE,
  verifyMailConsoleSessionToken,
} from "@/lib/mailConsoleServerAuth";

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

function clean(v: string | undefined | null) {
  return (v || "").trim();
}

export default async function MailConsoleSendPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(MAIL_CONSOLE_COOKIE)?.value || "";

  let adminEmail = "";

  try {
    const payload = verifyMailConsoleSessionToken(sessionToken);
    adminEmail = payload.email;
  } catch (_) {
    redirect("/mail-login");
  }

  const supabaseUrl = clean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    throw new Error("Missing Supabase server configuration.");
  }

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: adminRow } = await admin
    .from("mail_console_admins")
    .select("id,email,role,is_active")
    .ilike("email", adminEmail)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminRow) {
    redirect("/mail-login");
  }

  const { data: senderRows, error: senderError } = await admin
    .from("mail_console_sender_identities")
    .select(
      "id,label,from_email,reply_to_email,purpose,can_send_support,can_send_newsletter",
    )
    .eq("is_active", true)
    .order("from_email", { ascending: true });

  if (senderError) {
    throw new Error(senderError.message);
  }

  const { data: footerRows, error: footerError } = await admin
    .from("mail_console_footer_policies")
    .select("id,name,mode,footer_html,footer_text,is_default")
    .eq("is_active", true)
    .order("mode", { ascending: true })
    .order("name", { ascending: true });

  if (footerError) {
    throw new Error(footerError.message);
  }

  const { data: templateRows, error: templateError } = await admin
    .from("mail_console_templates")
    .select("id,name,mode,subject,body_text,default_image_position")
    .eq("is_active", true)
    .order("mode", { ascending: true })
    .order("name", { ascending: true });

  if (templateError) {
    throw new Error(templateError.message);
  }

  return (
    <MailConsoleSendForm
      adminEmail={adminEmail}
      senders={(senderRows || []) as SenderIdentity[]}
      footerPolicies={(footerRows || []) as FooterPolicy[]}
      templates={(templateRows || []) as MailTemplate[]}
    />
  );
}
