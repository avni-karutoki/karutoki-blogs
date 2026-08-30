"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePublished(
  id: string,
  currentPublished: boolean
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
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

  revalidatePath("/admin");
  revalidatePath("/poems");
  revalidatePath("/blogs");
  revalidatePath("/midnight-talks");
  revalidatePath("/writings/[slug]", "page");

  return {
    success: true,
  };
}


// DELETE POST
export async function deletePost(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete post error:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/poems");
  revalidatePath("/blogs");
  revalidatePath("/midnight-talks");
  revalidatePath("/writings/[slug]", "page");

  return {
    success: true,
  };
}