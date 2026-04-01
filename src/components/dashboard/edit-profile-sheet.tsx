"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { ImageUpIcon, PencilIcon, SaveIcon } from "lucide-react";

import { AuthApiError } from "@/lib/auth-api";
import {
  updateCurrentUserProfile,
  type CurrentUserProfile,
  type UpdateCurrentUserProfilePayload,
} from "@/lib/profile-api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type ProfileFormValues = {
  name: string;
  phone: string;
  bio: string;
};

function toFormValues(profile: CurrentUserProfile): ProfileFormValues {
  return {
    name: profile.name,
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
  };
}

function EditProfileSheet({
  profile,
  onProfileUpdated,
  onUnauthorized,
}: {
  profile: CurrentUserProfile;
  onProfileUpdated: (message: string) => void;
  onUnauthorized: (message: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState<ProfileFormValues>(() =>
    toFormValues(profile)
  );
  const [selectedImageName, setSelectedImageName] = React.useState<string | null>(
    null
  );
  const [localImagePreview, setLocalImagePreview] = React.useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      setFormValues(toFormValues(profile));
      setSelectedImageName(null);
      setLocalImagePreview(null);
      setErrorMessage(null);
    }
  }, [open, profile]);

  React.useEffect(() => {
    return () => {
      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  function updateField<K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K]
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedName = formValues.name.trim();
    const trimmedPhone = formValues.phone.trim();
    const trimmedBio = formValues.bio.trim();

    if (!trimmedName) {
      setErrorMessage("Name cannot be empty.");
      return;
    }

    const nextPayload: UpdateCurrentUserProfilePayload = {};

    if (trimmedName !== profile.name) {
      nextPayload.name = trimmedName;
    }

    if (trimmedPhone !== (profile.phone ?? "")) {
      nextPayload.phone = trimmedPhone === "" ? null : trimmedPhone;
    }

    if (trimmedBio !== (profile.bio ?? "")) {
      nextPayload.bio = trimmedBio === "" ? null : trimmedBio;
    }

    if (Object.keys(nextPayload).length === 0) {
      setErrorMessage(
        selectedImageName
          ? "Image upload is still a placeholder. Update another field if you want to save changes right now."
          : "Make at least one change before saving."
      );
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateCurrentUserProfile(nextPayload);
      setOpen(false);
      onProfileUpdated(result.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update your profile right now.";

      if (error instanceof AuthApiError && error.status === 401) {
        onUnauthorized(message);
      }

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setSelectedImageName(null);
      setLocalImagePreview(null);
      return;
    }

    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview);
    }

    setSelectedImageName(selectedFile.name);
    setLocalImagePreview(URL.createObjectURL(selectedFile));
  }

  const previewImage = localImagePreview ?? profile.image;

  return (
    <>
      <Button type="button" size="lg" onClick={() => setOpen(true)}>
        Edit profile
        <PencilIcon data-icon="inline-end" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="center"
          className="overflow-y-auto border-border bg-card"
        >
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Update the profile details saved to your Meetrix account.
            </SheetDescription>
          </SheetHeader>

          <form className="flex flex-col gap-5 px-4 pb-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Full name</span>
              <input
                value={formValues.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Phone</span>
              <input
                value={formValues.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Add a phone number"
                autoComplete="tel"
                className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-foreground">
                Profile image
              </span>
              <div className="rounded-2xl border border-dashed border-border bg-muted/35 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={profile.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold tracking-tight text-foreground">
                        {profile.name
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((segment) => segment.charAt(0).toUpperCase())
                          .join("")}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Update profile image
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      This is a frontend placeholder for now. You can pick an
                      image and preview it here, but it will not be saved until
                      the backend image upload flow is ready.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose image
                        <ImageUpIcon data-icon="inline-end" />
                      </Button>
                      {selectedImageName ? (
                        <span className="text-sm text-muted-foreground">
                          {selectedImageName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelection}
                  className="hidden"
                />
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Bio</span>
              <textarea
                value={formValues.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                placeholder="Tell people a little about yourself"
                rows={6}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </label>

            <p className="text-sm leading-6 text-muted-foreground">
              Leave phone or bio empty if you want to clear those values.
            </p>

            {errorMessage ? (
              <p className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
                <SaveIcon data-icon="inline-end" />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { EditProfileSheet };
