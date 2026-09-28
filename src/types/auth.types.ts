export interface User {
  _id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'DRIVER';
  profile_image?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt?: string;
  updatedAt?: string;
}