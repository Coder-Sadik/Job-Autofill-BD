import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Profile name is required'),
});

export const PersonalInfoSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  religion: z.string().optional(),
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  nid: z.string().optional(),
  birth_registration: z.string().optional(),
  passport_number: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export const AddressSchema = z.object({
  type: z.enum(['Present', 'Permanent']),
  village_road_house: z.string().optional(),
  post_office: z.string().optional(),
  post_code: z.string().optional(),
  union_ward: z.string().optional(),
  upazila: z.string().optional(),
  district: z.string().optional(),
});

export const EducationSchema = z.object({
  level: z.enum(['SSC', 'Dakhil', 'HSC', 'Alim', 'Diploma', 'Bachelor', 'Master']),
  institution: z.string().optional(),
  board_university: z.string().optional(),
  roll: z.string().optional(),
  registration: z.string().optional(),
  group_subject: z.string().optional(),
  gpa_cgpa: z.string().optional(),
  passing_year: z.string().optional(),
});

export const EmploymentSchema = z.object({
  company: z.string().optional(),
  designation: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  responsibilities: z.string().optional(),
});
