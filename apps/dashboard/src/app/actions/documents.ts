'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(profileId: string, type: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verify profile ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  if (!file) throw new Error('No file uploaded')

  // Determine bucket
  let bucket = 'documents'
  if (type === 'Photo') bucket = 'profile-photos'
  if (type === 'Signature') bucket = 'signatures'

  // Construct secure path: user_id/profile_id/type_timestamp.ext
  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/${profileId}/${type}_${Date.now()}.${ext}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: true,
    })

  if (uploadError) throw new Error(uploadError.message)

  // Save metadata to documents table
  const { error: dbError } = await supabase
    .from('documents')
    .insert([
      {
        profile_id: profileId,
        type: type,
        storage_path: `${bucket}/${filePath}`,
      }
    ])

  if (dbError) throw new Error(dbError.message)

  revalidatePath(`/dashboard/profiles/${profileId}`)
}

export async function deleteDocument(documentId: string, storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Parse bucket and path
  const [bucket, ...pathParts] = storagePath.split('/')
  const path = pathParts.join('/')

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (storageError) throw new Error(storageError.message)

  // Remove from DB (or soft delete)
  const { error: dbError } = await supabase
    .from('documents')
    .update({ is_deleted: true })
    .eq('id', documentId)

  if (dbError) throw new Error(dbError.message)

  // Need to get profileId to revalidate
  // For simplicity we just revalidate all profiles path
  revalidatePath('/dashboard/profiles', 'layout')
}
