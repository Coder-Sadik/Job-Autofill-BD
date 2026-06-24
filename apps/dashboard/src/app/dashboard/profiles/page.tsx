import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { deleteProfile, duplicateProfile } from '@/app/actions/profile'
import { revalidatePath } from 'next/cache'

export default async function ProfilesPage() {
  const supabase = await createClient()
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Profiles</h1>
          <p className="text-slate-500">Manage autofill profiles for yourself and others.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profiles/new">Create Profile</Link>
        </Button>
      </div>

      {profiles?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No profiles yet</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-sm">
              Create a profile to store personal, educational, and professional details.
            </p>
            <Button asChild>
              <Link href="/dashboard/profiles/new">Create your first profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles?.map((profile) => (
            <Card key={profile.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{profile.name}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Ready
                  </span>
                </CardTitle>
                <CardDescription>Created on {new Date(profile.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {/* We'll show completeness percentage here later */}
                <div className="text-sm text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Personal Info:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Added</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Education:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">0 records</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-slate-50 dark:bg-slate-900 py-3 gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/dashboard/profiles/${profile.id}`}>Edit</Link>
                </Button>
                
                <form action={async () => {
                  'use server'
                  await duplicateProfile(profile.id, `${profile.name} (Copy)`)
                }}>
                  <Button variant="outline" size="sm" type="submit" title="Duplicate">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </form>

                <form action={async () => {
                  'use server'
                  await deleteProfile(profile.id)
                }}>
                  <Button variant="destructive" size="sm" type="submit" title="Delete">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
