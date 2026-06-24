export type AssemblyRecord = {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string | null;
  commune: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  pastor_name: string | null;
  timezone: string;
  is_active: boolean;
  photo_path: string | null;
  photo_url: string | null;
};