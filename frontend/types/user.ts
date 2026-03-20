export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  profilePictureUrl?: string;
}