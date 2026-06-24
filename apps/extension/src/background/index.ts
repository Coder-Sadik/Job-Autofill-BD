import { createClient } from '@supabase/supabase-js'

// Simple mock for now. In reality, we'd use environment variables injected via Vite.
// Or we fetch from Chrome Storage if the user configures it.
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co'
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Store the active session and profiles in memory/storage
let session: any = null
let profiles: any[] = []
let activeProfileId: string | null = null
let templates: any[] = []

chrome.runtime.onInstalled.addListener(() => {
  console.log('Job AutoFill BD Extension Installed')
})

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATE') {
    sendResponse({
      isLoggedIn: !!session,
      userEmail: session?.user?.email,
      profiles,
      activeProfileId,
      status: 'READY'
    })
    return true
  }

  if (message.type === 'SET_ACTIVE_PROFILE') {
    activeProfileId = message.profileId
    sendResponse({ success: true })
    return true
  }

  if (message.type === 'GET_TEMPLATES') {
    sendResponse({ templates })
    return true
  }

  if (message.type === 'AUTOFILL_REQUEST') {
    // Forward to content script of active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          type: 'EXECUTE_AUTOFILL',
          profileId: activeProfileId,
          // In a real app we'd fetch the specific profile data from Supabase or Cache here
          // and send it down to the content script.
          profileData: {
             personal_info: { full_name: "Test User", mobile: "01700000000" } // Mock data for now
          }
        }, (response) => {
          sendResponse(response)
        })
      }
    })
    return true // indicates async response
  }
})

// Periodic sync (mock)
async function syncData() {
  console.log('Syncing data from Supabase...')
  // Here we would fetch profiles and templates if we have a valid session
}

// Alarm for periodic sync
chrome.alarms.create('syncData', { periodInMinutes: 60 })
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    syncData()
  }
})
