import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { data: currentProfile, error: profileError } = await (supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle() as any);

    if (profileError || currentProfile?.role !== "ADMIN") {
      return Response.json({ error: "Apenas administradores podem cadastrar atendentes." }, { status: 403 });
    }

    const body = await request.json();
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role === "ADMIN" ? "ADMIN" : body.role === "ATENDENTE" ? "ATENDENTE" : "";

    if (!fullName || !email || password.length < 6 || !role) {
      return Response.json({ error: "Informe nome, e-mail, perfil e uma senha com pelo menos 6 caracteres." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !created.user) {
      return Response.json({ error: createError?.message ?? "Não foi possível criar o usuário." }, { status: 400 });
    }

    const { error: insertError } = await admin.from("profiles").upsert({
      id: created.user.id,
      full_name: fullName,
      email,
      role,
      active: true,
    });

    if (insertError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao cadastrar usuário.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { data: currentProfile, error: profileError } = await (supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle() as any);

    if (profileError || currentProfile?.role !== "ADMIN") {
      return Response.json({ error: "Apenas administradores podem remover usuários." }, { status: 403 });
    }

    const { id } = await request.json();
    if (typeof id !== "string" || !id) {
      return Response.json({ error: "Usuário inválido." }, { status: 400 });
    }

    if (id === user.id) {
      return Response.json({ error: "Você não pode remover sua própria conta." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(id);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao remover usuário.";
    return Response.json({ error: message }, { status: 500 });
  }
}