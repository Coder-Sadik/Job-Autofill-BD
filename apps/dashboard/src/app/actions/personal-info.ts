import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePersonalInfo(profileId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Unauthorized')

  const payload = {
    full_name: formData.get('full_name'),
    father_name: formData.get('father_name'),
    mother_name: formData.get('mother_name'),
    date_of_birth: formData.get('date_of_birth'),
    gender: formData.get('gender'),
    mobile: formData.get('mobile'),
    email: formData.get('email'),
    nid: formData.get('nid'),
    passport_number: formData.get('passport_number'),
  }

  const { error } = await supabase
    .from('personal_info')
    .update(payload)
    .eq('profile_id', profileId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/profiles/${profileId}`)
}
