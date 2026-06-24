export interface Profile {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  id: string;
  profile_id: string;
  full_name: string;
  father_name?: string;
  mother_name?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  religion?: string;
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nid?: string;
  birth_registration?: string;
  passport_number?: string;
  mobile?: string;
  email?: string;
}

export interface Address {
  id: string;
  profile_id: string;
  type: 'Present' | 'Permanent';
  village_road_house?: string;
  post_office?: string;
  post_code?: string;
  union_ward?: string;
  upazila?: string;
  district?: string;
}

export interface Education {
  id: string;
  profile_id: string;
  level: 'SSC' | 'Dakhil' | 'HSC' | 'Alim' | 'Diploma' | 'Bachelor' | 'Master';
  institution?: string;
  board_university?: string;
  roll?: string;
  registration?: string;
  group_subject?: string;
  gpa_cgpa?: string;
  passing_year?: string;
}

export interface Employment {
  id: string;
  profile_id: string;
  company?: string;
  designation?: string;
  start_date?: string;
  end_date?: string;
  responsibilities?: string;
}

export interface DocumentInfo {
  id: string;
  profile_id: string;
  type: 'Photo' | 'Signature' | 'CV' | 'NID_Front' | 'NID_Back' | 'Certificate';
  storage_path: string;
  public_url?: string;
}

export interface FieldMetadata {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type: string;
  xpath: string;
  nearbyText: string;
}
