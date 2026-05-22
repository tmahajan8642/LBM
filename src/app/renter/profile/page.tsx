import { ProfilePageClient } from "./profile-client";
import { getProfile } from "@/actions/profile";

export default async function RenterProfilePage() {
  const user = await getProfile();
  if (!user) return null;
  return <ProfilePageClient user={user} />;
}
