'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string

  const { data, error } = await supabase
    .from('profiles')
    .insert([{ user_id: user.id, name }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Auto-create an empty personal_info record
  await supabase
    .from('personal_info')
    .insert([{ profile_id: data.id, full_name: name }])

  revalidatePath('/dashboard/profiles')
  redirect(`/dashboard/profiles/${data.id}`)
}

export async function deleteProfile(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_deleted: true }) // soft delete
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/profiles')
}

export async function duplicateProfile(id: string, newName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Create new profile
  const { data: newProfile, error: profileError } = await supabase
    .from('profiles')
    .insert([{ user_id: user.id, name: newName }])
    .select()
    .single()

  if (profileError) throw new Error(profileError.message)

  // Copy personal info
  const { data: personalInfo } = await supabase
    .from('personal_info')
    .select('*')
    .eq('profile_id', id)
    .single()

  if (personalInfo) {
    const { id: _, profile_id, created_at, updated_at, ...rest } = personalInfo
    await supabase
      .from('personal_info')
      .insert([{ ...rest, profile_id: newProfile.id }])
  }

  // We could duplicate addresses, education, etc. here as well.

  revalidatePath('/dashboard/profiles')
  return newProfile
}
