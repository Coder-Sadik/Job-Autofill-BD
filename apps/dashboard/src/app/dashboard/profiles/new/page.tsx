import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProfile } from '@/app/actions/profile'
import Link from 'next/link'

export default function NewProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profiles">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">New Profile</h1>
          <p className="text-slate-500">Create a new container for autofill data.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Give this profile a recognizable name (e.g., "My Profile", "Brother's Job Profile").</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Profile Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Personal"
                required
                maxLength={50}
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profiles">Cancel</Link>
              </Button>
              <Button type="submit">Create Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
