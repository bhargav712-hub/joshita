import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Beaker, Check, X } from 'lucide-react'

export default function ChefBYORQueue() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  
  // Trial feedback state
  const [tasteNotes, setTasteNotes] = useState('')
  const [scaleNotes, setScaleNotes] = useState('')
  const [riskFlags, setRiskFlags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRecipes()
  }, [])

  async function loadRecipes() {
    setLoading(true)
    const { data } = await supabase
      .from('byor_recipes')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (data) setRecipes(data)
    setLoading(false)
  }

  const handleTrialSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const { error } = await supabase
      .from('byor_recipes')
      .update({
        chef_taste_notes: tasteNotes,
        chef_scale_notes: scaleNotes,
        chef_risk_flags: riskFlags,
        status: 'trial_done'
      })
      .eq('id', selectedRecipe.id)

    setSubmitting(false)
    
    if (error) {
      alert('Failed to log trial notes: ' + error.message)
    } else {
      alert('Trial notes logged! Sending to Joshi for final approval.')
      setSelectedRecipe(null)
      loadRecipes()
    }
  }

  if (loading) return <p className="desc">Loading BYOR queue...</p>

  if (recipes.length === 0) {
    return (
      <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: 'var(--ink)' }}>BYOR Queue is Empty</h3>
        <p className="desc">No customers have submitted BYOR recipes recently.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="dash-card" style={{ paddingBottom: '20px' }}>
        <h2>BYOR Trial Queue</h2>
        <p className="desc">
          Customers have requested these family recipes for their upcoming events. Review the recipes, conduct a trial cook, and log your professional notes for final approval.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* QUEUE LIST */}
        <div className="space-y-4">
          {recipes.map(recipe => (
            <div 
              key={recipe.id} 
              className="dash-card" 
              style={{ 
                padding: '20px', 
                cursor: 'pointer', 
                border: selectedRecipe?.id === recipe.id ? '2px solid var(--terracotta)' : '1px solid rgba(26, 22, 20, 0.05)'
              }}
              onClick={() => {
                setSelectedRecipe(recipe)
                setTasteNotes(recipe.chef_taste_notes || '')
                setScaleNotes(recipe.chef_scale_notes || '')
                setRiskFlags(recipe.chef_risk_flags || '')
              }}
            >
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{recipe.recipe_name}</h3>
              <p className="desc" style={{ fontSize: '13px', margin: 0 }}>Host: {recipe.profiles?.full_name || 'Unknown'}</p>
              
              <div style={{ marginTop: '15px' }}>
                <span style={{ 
                  display: 'inline-block', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', 
                  fontWeight: 'bold', background: recipe.status === 'trial_done' ? 'rgba(0,200,100,0.1)' : 'rgba(255, 200, 0, 0.1)', 
                  color: recipe.status === 'trial_done' ? '#00cc66' : '#ccaa00', textTransform: 'uppercase' 
                }}>
                  {recipe.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* RECIPE DETAIL & TRIAL FORM */}
        <div>
          {!selectedRecipe ? (
            <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(26, 22, 20, 0.02)' }}>
              <Beaker size={40} color="var(--ink-soft)" style={{ marginBottom: '15px' }} />
              <p className="desc">Select a recipe from the queue to view details and log trial notes.</p>
            </div>
          ) : (
            <div className="dash-card">
              <h3 style={{ color: 'var(--terracotta)', borderBottom: '1px solid var(--ink-border)', paddingBottom: '10px' }}>{selectedRecipe.recipe_name}</h3>
              
              <div className="space-y-4" style={{ marginTop: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '5px' }}>Family Story</h4>
                  <p className="desc" style={{ fontSize: '14px', fontStyle: 'italic' }}>"{selectedRecipe.family_story || 'None provided'}"</p>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '5px' }}>Ingredients</h4>
                  <p className="desc" style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{selectedRecipe.ingredients}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '5px' }}>Prep Steps</h4>
                    <p className="desc" style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{selectedRecipe.prep_steps}</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '5px' }}>Cook Steps</h4>
                    <p className="desc" style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{selectedRecipe.cook_steps}</p>
                  </div>
                </div>

                {selectedRecipe.status !== 'trial_done' && selectedRecipe.status !== 'approved' && (
                  <form onSubmit={handleTrialSubmit} style={{ marginTop: '30px', padding: '20px', background: 'rgba(181, 83, 45, 0.05)', borderRadius: '6px', border: '1px solid rgba(181, 83, 45, 0.2)' }}>
                    <h4 style={{ color: 'var(--terracotta-deep)', marginBottom: '15px' }}>Chef Trial Log</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">Taste & Texture Notes</label>
                        <textarea className="form-input" rows="2" required value={tasteNotes} onChange={e => setTasteNotes(e.target.value)}></textarea>
                      </div>
                      <div>
                        <label className="form-label">Scaling Notes (Cooking for 30+)</label>
                        <textarea className="form-input" rows="2" required placeholder="Does this scale well?" value={scaleNotes} onChange={e => setScaleNotes(e.target.value)}></textarea>
                      </div>
                      <div>
                        <label className="form-label">Service / Plating Risk Flags</label>
                        <input type="text" className="form-input" placeholder="e.g. Needs immediate serving, gets soggy" value={riskFlags} onChange={e => setRiskFlags(e.target.value)} />
                      </div>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={submitting}>
                      {submitting ? 'Saving...' : 'Submit Trial Report to Admin'}
                    </button>
                  </form>
                )}
                
                {(selectedRecipe.status === 'trial_done' || selectedRecipe.status === 'approved') && (
                  <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0, 200, 100, 0.05)', borderRadius: '6px', border: '1px solid rgba(0, 200, 100, 0.2)' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#00aa55', display: 'flex', alignItems: 'center', gap: '5px' }}><Check size={16}/> Trial Report Logged</p>
                    <p className="desc" style={{ fontSize: '13px', margin: '5px 0' }}><strong>Taste:</strong> {selectedRecipe.chef_taste_notes}</p>
                    <p className="desc" style={{ fontSize: '13px', margin: '5px 0' }}><strong>Scaling:</strong> {selectedRecipe.chef_scale_notes}</p>
                    <p className="desc" style={{ fontSize: '13px', margin: '5px 0' }}><strong>Risks:</strong> {selectedRecipe.chef_risk_flags || 'None'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
