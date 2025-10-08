'use client'

import { useState, useEffect } from 'react'
import { tokens } from '@/tokens'

type Context = 'vg-b2b-light' | 'vg-b2b-dark' | 'vg-b2c-light' | 'vg-b2c-dark'

// Helper function to extract values from token objects
function extractTokenValues(tokenObj: any): any {
  if (typeof tokenObj === 'object' && tokenObj !== null) {
    if (tokenObj.$value !== undefined) {
      return tokenObj.$value
    }
    const result: any = {}
    for (const key in tokenObj) {
      result[key] = extractTokenValues(tokenObj[key])
    }
    return result
  }
  return tokenObj
}

export default function TokenTester() {
  const [currentContext, setCurrentContext] = useState<Context>('vg-b2b-dark')
  const [currentTokens, setCurrentTokens] = useState(extractTokenValues(tokens['vg-b2b-dark']))

  useEffect(() => {
    setCurrentTokens(extractTokenValues(tokens[currentContext]))
  }, [currentContext])

  const handleContextChange = (context: Context) => {
    setCurrentContext(context)
  }

  const contexts: Context[] = ['vg-b2b-light', 'vg-b2b-dark', 'vg-b2c-light', 'vg-b2c-dark']

  return (
    <div className="p-8 min-h-screen" style={{ 
      backgroundColor: currentTokens.background.primary,
      color: currentTokens.textAndIcon.primary 
    }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Design Token Context Switcher</h1>
        
        {/* Context Selector */}
        <div className="mb-8 p-6 rounded-lg" style={{ 
          backgroundColor: currentTokens.surface.primary,
          border: `1px solid ${currentTokens.border.default}`
        }}>
          <h2 className="text-2xl font-semibold mb-4">Select Context</h2>
          <div className="flex gap-4 flex-wrap">
            {contexts.map((context) => (
              <button
                key={context}
                onClick={() => handleContextChange(context)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentContext === context ? 'opacity-100' : 'opacity-70'
                }`}
                style={{
                  backgroundColor: currentContext === context 
                    ? currentTokens.interactive.primaryAccent 
                    : currentTokens.interactive.secondary,
                  color: currentTokens.textAndIcon.onPrimary
                }}
              >
                {context.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Colors */}
        <div className="mb-8 p-6 rounded-lg" style={{ 
          backgroundColor: currentTokens.surface.primary,
          border: `1px solid ${currentTokens.border.default}`
        }}>
          <h2 className="text-2xl font-semibold mb-4">Interactive Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.interactive.primaryAccent,
              color: currentTokens.textAndIcon.onPrimary
            }}>
              <div className="font-semibold">Primary Accent</div>
              <div className="text-sm opacity-80">{currentTokens.interactive.primaryAccent}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.interactive.primaryDestructive,
              color: currentTokens.textAndIcon.onPrimary
            }}>
              <div className="font-semibold">Primary Destructive</div>
              <div className="text-sm opacity-80">{currentTokens.interactive.primaryDestructive}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.interactive.secondary,
              color: currentTokens.textAndIcon.onSecondary
            }}>
              <div className="font-semibold">Secondary</div>
              <div className="text-sm opacity-80">{currentTokens.interactive.secondary}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.interactive.disabled,
              color: currentTokens.textAndIcon.disabled
            }}>
              <div className="font-semibold">Disabled</div>
              <div className="text-sm opacity-80">{currentTokens.interactive.disabled}</div>
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div className="mb-8 p-6 rounded-lg" style={{ 
          backgroundColor: currentTokens.surface.primary,
          border: `1px solid ${currentTokens.border.default}`
        }}>
          <h2 className="text-2xl font-semibold mb-4">Text Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.textAndIcon.primary,
              color: currentTokens.background.primary
            }}>
              <div className="font-semibold">Primary Text</div>
              <div className="text-sm opacity-80">{currentTokens.textAndIcon.primary}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.textAndIcon.secondary,
              color: currentTokens.background.primary
            }}>
              <div className="font-semibold">Secondary Text</div>
              <div className="text-sm opacity-80">{currentTokens.textAndIcon.secondary}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.textAndIcon.accent,
              color: currentTokens.background.primary
            }}>
              <div className="font-semibold">Accent Text</div>
              <div className="text-sm opacity-80">{currentTokens.textAndIcon.accent}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.textAndIcon.destructive,
              color: currentTokens.background.primary
            }}>
              <div className="font-semibold">Destructive Text</div>
              <div className="text-sm opacity-80">{currentTokens.textAndIcon.destructive}</div>
            </div>
          </div>
        </div>

        {/* Border Colors */}
        <div className="mb-8 p-6 rounded-lg" style={{ 
          backgroundColor: currentTokens.surface.primary,
          border: `1px solid ${currentTokens.border.default}`
        }}>
          <h2 className="text-2xl font-semibold mb-4">Border Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.background.primary,
              border: `2px solid ${currentTokens.border.default}`,
              color: currentTokens.textAndIcon.primary
            }}>
              <div className="font-semibold">Default Border</div>
              <div className="text-sm opacity-80">{currentTokens.border.default}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.background.primary,
              border: `2px solid ${currentTokens.border.active}`,
              color: currentTokens.textAndIcon.primary
            }}>
              <div className="font-semibold">Active Border</div>
              <div className="text-sm opacity-80">{currentTokens.border.active}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.background.primary,
              border: `2px solid ${currentTokens.border.accent}`,
              color: currentTokens.textAndIcon.primary
            }}>
              <div className="font-semibold">Accent Border</div>
              <div className="text-sm opacity-80">{currentTokens.border.accent}</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ 
              backgroundColor: currentTokens.background.primary,
              border: `2px solid ${currentTokens.border.focus}`,
              color: currentTokens.textAndIcon.primary
            }}>
              <div className="font-semibold">Focus Border</div>
              <div className="text-sm opacity-80">{currentTokens.border.focus}</div>
            </div>
          </div>
        </div>

        {/* Raw Token Data */}
        <div className="p-6 rounded-lg" style={{ 
          backgroundColor: currentTokens.surface.primary,
          border: `1px solid ${currentTokens.border.default}`
        }}>
          <h2 className="text-2xl font-semibold mb-4">Raw Token Data</h2>
          <pre className="text-sm overflow-auto max-h-96" style={{ 
            color: currentTokens.textAndIcon.secondary 
          }}>
            {JSON.stringify(currentTokens, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
