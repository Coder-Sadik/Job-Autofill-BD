import { createClient } from '@supabase/supabase-js'

// Simple mock for now. In reality, we'd use environment variables injected via Vite.
// Or we fetch from Chrome Storage if the user configures it.
const SUPABASE_URL = 'https://abcdefghijklmnopqr.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false // Critical for Manifest V3 Service Workers (no localStorage)
  }
})
console.log('Supabase client initialized:', !!supabase)

// Store the active session and profiles in memory/storage
let session: any = null
let profiles: any[] = []
let activeProfileId: string | null = null
let templates: any[] = []

chrome.runtime.onInstalled.addListener(() => {
  console.log('Job AutoFill BD Extension Installed')
})

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: any) => {
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const activeTab = tabs[0]
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          type: 'EXECUTE_AUTOFILL',
          profileId: activeProfileId,
          profileData: {
             personal_info: { full_name: "Test User", mobile: "01700000000" } // Mock data for now
          }
        }, (response: any) => {
          if (chrome.runtime.lastError) {
            console.error('Content script error:', chrome.runtime.lastError.message)
            sendResponse({ success: false, error: chrome.runtime.lastError.message })
          } else {
            sendResponse(response || { success: true })
          }
        })
      } else {
        sendResponse({ success: false, error: 'No active tab found' })
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
chrome.alarms.onAlarm.addListener((alarm: any) => {
  if (alarm.name === 'syncData') {
    syncData()
  }
})
