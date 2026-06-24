import { useEffect, useState } from 'react'

interface ExtensionState {
  isLoggedIn: boolean
  userEmail?: string
  profiles: any[]
  activeProfileId: string | null
  status: string
}

export default function Popup() {
  const [state, setState] = useState<ExtensionState | null>(null)
  const [filling, setFilling] = useState(false)

  useEffect(() => {
    // Fetch initial state from background worker
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (response) {
        setState(response)
      }
    })
  }, [])

  const handleAutofill = () => {
    setFilling(true)
    chrome.runtime.sendMessage({ type: 'AUTOFILL_REQUEST' }, (response) => {
      setFilling(false)
      console.log('Autofill completed:', response)
    })
  }

  if (!state) {
    return <div className="p-4 w-64 text-center">Loading...</div>
  }

  return (
    <div className="w-80 p-4 bg-slate-50 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h1 className="text-lg font-bold text-blue-600">AutoFill BD</h1>
        <div className="flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${state.isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs text-slate-500">{state.status}</span>
        </div>
      </div>

      {!state.isLoggedIn ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm text-slate-600">Please log in to the dashboard to sync your profiles.</p>
          <button 
            onClick={() => window.open('http://localhost:3000/login', '_blank')}
            className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            Open Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Logged in as</label>
            <div className="text-sm font-medium truncate">{state.userEmail}</div>
          </div>
          
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Active Profile</label>
            <select 
              className="w-full border-slate-300 rounded-md text-sm p-2 bg-white"
              value={state.activeProfileId || ''}
              onChange={(e) => {
                const newId = e.target.value
                chrome.runtime.sendMessage({ type: 'SET_ACTIVE_PROFILE', profileId: newId })
                setState({ ...state, activeProfileId: newId })
              }}
            >
              <option value="" disabled>Select a profile...</option>
              {state.profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              {/* Mock option for MVP UI testing if array is empty */}
              {state.profiles.length === 0 && <option value="mock">Personal (Mock)</option>}
            </select>
          </div>

          <button 
            onClick={handleAutofill}
            disabled={filling}
            className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {filling ? 'Filling Form...' : 'Autofill Form'}
          </button>
        </div>
      )}
    </div>
  )
}
