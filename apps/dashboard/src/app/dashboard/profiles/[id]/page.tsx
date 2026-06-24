import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updatePersonalInfo } from '@/app/actions/personal-info'
import { uploadDocument, deleteDocument } from '@/app/actions/documents'

export default async function ProfileEditPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return notFound()

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!profile) return notFound()

  // Fetch Personal Info
  const { data: personalInfo } = await supabase
    .from('personal_info')
    .select('*')
    .eq('profile_id', profile.id)
    .single()

  // Fetch Documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_deleted', false)

  // Wrap the action so we can bind the profile ID
  const updateInfo = updatePersonalInfo.bind(null, profile.id)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profiles">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{profile.name}</h1>
          <p className="text-slate-500">Edit autofill data for this profile.</p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic details required for most job applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name (English)</Label>
                    <Input id="full_name" name="full_name" defaultValue={personalInfo?.full_name || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={personalInfo?.date_of_birth || ''} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="father_name">Father's Name</Label>
                    <Input id="father_name" name="father_name" defaultValue={personalInfo?.father_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_name">Mother's Name</Label>
                    <Input id="mother_name" name="mother_name" defaultValue={personalInfo?.mother_name || ''} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select name="gender" defaultValue={personalInfo?.gender || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" name="mobile" defaultValue={personalInfo?.mobile || ''} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" defaultValue={personalInfo?.email || ''} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nid">National ID (NID)</Label>
                    <Input id="nid" name="nid" defaultValue={personalInfo?.nid || ''} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input id="passport_number" name="passport_number" defaultValue={personalInfo?.passport_number || ''} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit">Save Personal Info</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>Present and permanent addresses.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 py-8 text-center">Address forms will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Empty states for other tabs for now */}
        <TabsContent value="education">
          <Card><CardContent><p className="text-slate-500 py-8 text-center">Education records will go here.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="employment">
          <Card><CardContent><p className="text-slate-500 py-8 text-center">Employment records will go here.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Upload Photo, Signature, CV, or NID scans.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={async (formData) => {
                  'use server'
                  const type = formData.get('type') as string
                  await uploadDocument(profile.id, type, formData)
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Document Type</Label>
                    <Select name="type" defaultValue="Photo" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Photo">Photo</SelectItem>
                        <SelectItem value="Signature">Signature</SelectItem>
                        <SelectItem value="CV">CV (PDF)</SelectItem>
                        <SelectItem value="NID_Front">NID Front</SelectItem>
                        <SelectItem value="NID_Back">NID Back</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">File</Label>
                    <Input id="file" name="file" type="file" required />
                  </div>
                  <Button type="submit" className="w-full">Upload</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stored Documents</CardTitle>
                <CardDescription>Manage your uploaded files.</CardDescription>
              </CardHeader>
              <CardContent>
                {documents && documents.length > 0 ? (
                  <ul className="space-y-3">
                    {documents.map(doc => (
                      <li key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm">{doc.type}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{doc.storage_path.split('/').pop()}</p>
                        </div>
                        <form action={async () => {
                          'use server'
                          await deleteDocument(doc.id, doc.storage_path)
                        }}>
                          <Button variant="destructive" size="sm" type="submit">Delete</Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">No documents uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
