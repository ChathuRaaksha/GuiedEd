import { z } from 'zod';

export const studentOnboardingSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address').max(255),
  educationLevel: z.string().refine(val => ['middle_school', 'high_school', 'university'].includes(val), {
    message: 'Please select an education level',
  }),
  school: z.string().min(1, 'School is required').max(100),
  city: z.string().min(1, 'City is required').max(100),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  goals: z.string().max(500, 'Goals must be less than 500 characters').optional(),
  meetingPref: z.string().refine(val => ['online', 'in_person', 'either'].includes(val), {
    message: 'Please select a valid meeting preference',
  }),
});

export const mentorOnboardingSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address').max(255),
  educationLevel: z.string().refine(val => ['middle_school', 'high_school', 'university'].includes(val), {
    message: 'Please select an education level',
  }).optional(),
  city: z.string().min(1, 'City is required').max(100),
  employer: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  hobbies: z.array(z.string()).optional(),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  agePref: z.string().refine(val => ['middle_school', 'high_school', 'university', 'any'].includes(val), {
    message: 'Please select a valid education preference',
  }),
  meetingPref: z.string().refine(val => ['online', 'in_person', 'either'].includes(val), {
    message: 'Please select a valid meeting preference',
  }),
  maxStudents: z.number().min(1, 'Must mentor at least 1 student').max(10, 'Maximum 10 students'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
});

export const facilitatorOnboardingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  org: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(100),
  maxMatches: z.number().min(1).max(500).default(50),
  notes: z.string().max(500).optional(),
});

export type StudentOnboardingData = z.infer<typeof studentOnboardingSchema>;
export type MentorOnboardingData = z.infer<typeof mentorOnboardingSchema>;
export type FacilitatorOnboardingData = z.infer<typeof facilitatorOnboardingSchema>;
