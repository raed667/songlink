"use server";
import { track } from "@vercel/analytics/server";
import { validateLink } from "@/util/validators";
import { findSourceItem } from "@/util/services";

type FormState = {
  type?: string;
  key?: string;
  errorMessage?: string;
};

export async function submitLink(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const link = formData.get("link") as string;
  try {
    track("Submit Link", { link });

    const validation = await validateLink(link);

    if (validation.isValid) {
      const source = await findSourceItem(
        validation.id,
        validation.type,
        validation.provider
      );

      if (source) {
        track("Link valid", { link });
        return {
          type: validation.type,
          key: source.key,
        };
        // return redirect(`/${validation.type}/${source?.key}`, RedirectType.push);
      } else {
        return {
          errorMessage: "source not found",
        };
      }
    }

    return {
      errorMessage: validation.error,
    };
  } catch (error: any) {
    console.log(error);
    track("Link Error", { link, message: error.message });
    return { errorMessage: error.message ?? "Unexpected error occurred" };
  }
}
