import { FieldMatchingEngine } from '@job-autofill/field-matching'
import type { FieldMetadata } from '@job-autofill/shared-types'

console.log('Job AutoFill BD: Content script injected.')

// Listen for messages from the popup/background
chrome.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: any) => {
  if (message.type === 'EXECUTE_AUTOFILL') {
    const { profileData } = message
    console.log('Received autofill command for profile data:', profileData)
    
    // In MVP, we fetch site templates from background (mocked here as empty)
    chrome.runtime.sendMessage({ type: 'GET_TEMPLATES' }, (response: any) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to fetch templates:', chrome.runtime.lastError.message)
      }
      const templates = response?.templates || []
      // Find template matching current domain if any
      const domainTemplate = templates.find((t: any) => window.location.hostname.includes(t.site))
      const templateMappings = domainTemplate?.field_mappings
      
      const filledCount = performAutofill(profileData, templateMappings)
      sendResponse({ success: true, fieldsFilled: filledCount })
    })

    return true // async
  }
})

function performAutofill(profileData: any, templateMappings?: Record<string, string>): number {
  let count = 0

  // MVP: Support Text, Email, Tel, Date, and Select
  const inputs = Array.from(document.querySelectorAll('input, select')) as Array<HTMLInputElement | HTMLSelectElement>

  inputs.forEach(input => {
    // Skip hidden, disabled, or unhandled types
    if (input.type === 'hidden' || input.disabled || input.type === 'submit' || input.type === 'button') {
      return
    }

    const metadata: FieldMetadata = {
      id: input.id || '',
      name: input.name || '',
      type: input.type,
      placeholder: input.getAttribute('placeholder') || '',
      label: findLabelFor(input),
      xpath: '', // Skipping xpath for MVP
      nearbyText: '' // Skipping nearby text for MVP
    }

    // Pass through our shared matching engine
    const match = FieldMatchingEngine.matchField(metadata, templateMappings)

    if (match.confidence > 0.8) {
      // We have a strong match. Extract the value from profileData.
      const valueToFill = extractValueFromProfile(profileData, match.fieldKey)
      
      if (valueToFill !== undefined && valueToFill !== null && valueToFill !== '') {
        input.value = valueToFill
        // Dispatch events to trigger React/Angular/Vue handlers
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
        
        // Highlight field to show user it was filled
        input.style.border = '2px solid #22c55e'
        input.style.backgroundColor = '#f0fdf4'
        count++
        
        console.log(`[AutoFill] Mapped field "${metadata.name || metadata.id}" to "${match.fieldKey}" -> ${valueToFill}`)
      }
    }
  })

  return count
}

function findLabelFor(el: HTMLElement): string {
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`) as HTMLLabelElement
    if (label) return label.innerText.trim()
  }
  
  // Check closest parent label
  const parentLabel = el.closest('label')
  if (parentLabel) {
    // return only the text node part, excluding the input itself
    return parentLabel.innerText.replace(el.innerText, '').trim()
  }

  return ''
}

function extractValueFromProfile(profileData: any, fieldKey: string): string | undefined {
  // fieldKey is like "personal_info.full_name"
  const parts = fieldKey.split('.')
  let current = profileData
  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part]
    } else {
      return undefined
    }
  }
  return current as string
}
