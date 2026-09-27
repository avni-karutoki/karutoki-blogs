"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/authorization";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/writings");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/poems");
  revalidatePath("/blogs");
  revalidatePath("/midnight-talks");
  revalidatePath("/writings/[slug]", "page");
}

export async function togglePublished(id: string, currentPublished: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return {
      success: false,
      error: "You must be logged in as authorized admin.",
    };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      published: !currentPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Publish toggle error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidateAll();
  return { success: true };
}

export async function deletePost(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return {
      success: false,
      error: "You must be logged in as authorized admin.",
    };
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    console.error("Delete post error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidateAll();
  return { success: true };
}

export async function toggleMessageRead(id: string, currentRead: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return {
      success: false,
      error: "You must be logged in as authorized admin.",
    };
  }

  const { error } = await supabase
    .from("contact_messages")
    .update({ read: !currentRead })
    .eq("id", id);

  if (error) {
    console.error("Toggle message read error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return {
      success: false,
      error: "You must be logged in as authorized admin.",
    };
  }

  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete message error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateSiteSettings(key: string, value: Record<string, unknown>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return {
      success: false,
      error: "You must be logged in as authorized admin.",
    };
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Update site settings error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidateAll();
  return { success: true };
}
