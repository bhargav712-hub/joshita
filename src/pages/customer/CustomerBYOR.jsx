import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function CustomerBYOR() {
  const { currentUser } = useOutletContext()
  const [recipeName, setRecipeName] = useState('')
  const [familyStory, setFamilyStory] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [prepSteps, setPrepSteps] = useState('')
  const [cookSteps, setCookSteps] = useState('')
  const [platingNotes, setPlatingNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Insert into Supabase BYOR table
    const { error } = await supabase.from('byor_recipes').insert({
      customer_id: currentUser.id,
      recipe_name: recipeName,
      family_story: familyStory,
      ingredients: ingredients,
      prep_steps: prepSteps,
      cook_steps: cookSteps,
      plating_notes: platingNotes,
      status: 'trial_pending'
    })

    setLoading(false)

    if (error) {
      alert('Failed to submit recipe: ' + error.message)
    } else {
      setSuccess(true)
      // Reset form
      setRecipeName('')
      setFamilyStory('')
      setIngredients('')
      setPrepSteps('')
      setCookSteps('')
      setPlatingNotes('')
      setTimeout(() => setSuccess(false), 5000)
    }
  }

  return (
    <div className="dash-card">
      <h2>Submit a BYOR (Bring Your Own Recipe)</h2>
      <p className="desc">
        Share your cherished family recipes with us. Our chefs will trial them and serve them exclusively at your next event.
      </p>

      {success && (
        <div style={{ background: 'rgba(0, 200, 100, 0.1)', borderLeft: '4px solid #00ffaa', padding: '15px', marginTop: '20px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#00ffaa' }}>Recipe Submitted Successfully!</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink)' }}>
            Status: <strong style={{color: 'var(--terracotta)'}}>ARIVA chef will review and schedule trial cook</strong>
          </p>
        </div>
      )}

      <form className="space-y-4" style={{ marginTop: '30px' }} onSubmit={handleSubmit}>
        <div className="dash-grid-2">
          <div>
            <label className="form-label">Recipe Name *</label>
            <input 
              type="text" className="form-input" required 
              placeholder="e.g. Dadi's Special Mutton Curry"
              value={recipeName} onChange={(e) => setRecipeName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Family Origin / Story</label>
            <input 
              type="text" className="form-input" 
              placeholder="e.g. Passed down from 3 generations..."
              value={familyStory} onChange={(e) => setFamilyStory(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Ingredient List & Quantities *</label>
          <textarea 
            className="form-input" rows="4" required
            placeholder="1kg Mutton, 2tbsp Turmeric..."
            value={ingredients} onChange={(e) => setIngredients(e.target.value)}
          ></textarea>
        </div>

        <div className="dash-grid-2">
          <div>
            <label className="form-label">Prep Steps *</label>
            <textarea 
              className="form-input" rows="4" required
              placeholder="Marinate meat for 2 hours..."
              value={prepSteps} onChange={(e) => setPrepSteps(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="form-label">Cooking Steps *</label>
            <textarea 
              className="form-input" rows="4" required
              placeholder="Slow cook on low flame for 45 mins..."
              value={cookSteps} onChange={(e) => setCookSteps(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div>
          <label className="form-label">Plating & Garnish Notes</label>
          <input 
            type="text" className="form-input" 
            placeholder="e.g. Garnish with fresh coriander and serve in a brass bowl"
            value={platingNotes} onChange={(e) => setPlatingNotes(e.target.value)}
          />
        </div>

        <div style={{ padding: '20px', background: 'rgba(26, 22, 20, 0.03)', borderRadius: '6px', border: '1px dashed rgba(26, 22, 20, 0.15)' }}>
          <label className="form-label" style={{ marginBottom: '10px' }}>Media (Optional)</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button type="button" className="submit-btn" style={{ background: 'var(--ink-soft)', flex: 1, marginTop: 0 }}>
              Upload Photos
            </button>
            <button type="button" className="submit-btn" style={{ background: 'var(--ink-soft)', flex: 1, marginTop: 0 }}>
              Upload Voice Note
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '10px 0 0 0', textAlign: 'center' }}>
            (Media uploads will be active in the final release)
          </p>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Send to Recipe Vault'}
        </button>
      </form>
    </div>
  )
}
