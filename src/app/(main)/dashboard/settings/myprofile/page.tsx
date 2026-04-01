import type { Metadata } from "next";

import { MyProfilePage } from "@/components/dashboard/my-profile-page";
import { getServerCurrentUserProfile } from "@/lib/server-profile-api";

export const metadata: Metadata = {
  title: "My Profile | MEETRIX",
  description: "View your current Meetrix profile details.",
};

export default async function DashboardMyProfilePage() {
  const result = await getServerCurrentUserProfile();

  return (
    <MyProfilePage
      profile={result.profile}
      errorMessage={result.errorMessage}
      errorStatus={result.errorStatus}
    />
  );
}
