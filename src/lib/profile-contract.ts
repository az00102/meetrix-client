type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type CurrentUserProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  status: string;
  phone: string | null;
  bio: string | null;
};

type UpdateCurrentUserProfilePayload = {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  image?: string | null;
};

export type {
  ApiEnvelope,
  CurrentUserProfile,
  UpdateCurrentUserProfilePayload,
};
