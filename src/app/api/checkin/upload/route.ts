import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const angle = formData.get("angle") as string;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ext = file.name.split(".").pop();
  const filename = `${session.user.id}/${Date.now()}-${angle}.${ext}`;

  const { data, error } = await supabase.storage
    .from("progress-photos")
    .upload(filename, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("progress-photos").getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl });
}
