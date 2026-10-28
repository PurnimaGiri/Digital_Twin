
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } =
      await userClient.auth.getUser();

    if (userError || !user) {
      return Response.json(
        { error: "Invalid or expired session" },
        { status: 401, headers: corsHeaders },
      );
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, is_approved")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      profile?.role !== "admin" ||
      profile?.is_approved !== true
    ) {
      return Response.json(
        { error: "Approved Admin access required" },
        { status: 403, headers: corsHeaders },
      );
    }

    const body = await req.json();
    const staffId = body.staffId;

    if (
      typeof staffId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(staffId)
    ) {
      return Response.json(
        { error: "A valid staffId UUID is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const { data: staffProfile, error: staffError } = await adminClient
      .from("profiles")
      .select("id, role")
      .eq("id", staffId)
      .maybeSingle();

    if (staffError || !staffProfile || staffProfile.role !== "staff") {
      return Response.json(
        { error: "Staff profile not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", staffId)
      .eq("role", "staff");

    if (updateError) {
      return Response.json(
        { error: "Could not approve staff account" },
        { status: 500, headers: corsHeaders },
      );
    }

    return Response.json(
      { success: true, message: "Staff account approved" },
      { headers: corsHeaders },
    );
  } catch {
    return Response.json(
      { error: "Invalid request or server error" },
      { status: 400, headers: corsHeaders },
    );
  }
});
