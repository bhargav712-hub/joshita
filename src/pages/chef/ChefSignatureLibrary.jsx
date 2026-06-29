import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Book, Lock, AlertTriangle } from 'lucide-react'

export default function ChefSignatureLibrary({ currentUser }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  useEffect(() => {
    loadLibrary()
  }, [])

  async function loadLibrary() {
    setLoading(true)
    const { data } = await supabase.from('menu_items').select('*').eq('is_active', true)
    if (data) setRecipes(data)
    setLoading(false)
  }

  // Dummy recipe data since the actual 'menu_items' table currently only holds names and prices
  const dummyDetails = {
    ingredients: "500g Chicken\n2tbsp Soy Sauce\n1tbsp Ginger Paste\n1tbsp Garlic Paste\n200g Hokkien Noodles",
    method: "1. Marinate chicken in soy sauce, ginger, and garlic for 2 hours.\n2. Sear chicken in a screaming hot wok until charred.\n3. Add noodles and toss with signature sauce.\n4. Garnish with scallions."
  }

  if (loading) return <p className="desc">Loading recipe vault...</p>

  return (
    <div className="space-y-6">
      <div className="dash-card" style={{ paddingBottom: '20px' }}>
        <h2>Signature Recipe Library</h2>
        <p className="desc">
          Strictly Confidential. Do not copy, distribute, or share. You are viewing the protected ARIVA Recipe Vault.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* RECIPE LIST */}
        <div className="dash-card" style={{ padding: '20px' }}>
          <div className="space-y-2">
            {recipes.map(recipe => (
              <button 
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  padding: '15px', 
                  background: selectedRecipe?.id === recipe.id ? 'var(--terracotta)' : 'transparent',
                  color: selectedRecipe?.id === recipe.id ? 'white' : 'var(--ink)',
                  border: '1px solid rgba(26, 22, 20, 0.1)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{recipe.name}</span>
                <Lock size={14} style={{ opacity: 0.5 }} />
              </button>
            ))}
          </div>
        </div>

        {/* RECIPE VIEWER (WATERMARKED) */}
        <div>
          {!selectedRecipe ? (
            <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(26, 22, 20, 0.02)' }}>
              <Book size={40} color="var(--ink-soft)" style={{ marginBottom: '15px' }} />
              <p className="desc">Select a recipe to view the standard operating procedure.</p>
            </div>
          ) : (
            <div className="dash-card" style={{ position: 'relative', overflow: 'hidden' }}>
              
              {/* WATERMARK OVERLAY */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%) rotate(-45deg)', 
                fontSize: '80px', 
                fontWeight: 'bold', 
                color: 'rgba(26, 22, 20, 0.03)', 
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 0
              }}>
                ARIVA CONFIDENTIAL<br/>{currentUser.email}
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--ink-border)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--ink)' }}>{selectedRecipe.name}</h3>
                  <span style={{ padding: '4px 8px', background: 'rgba(255, 0, 0, 0.05)', color: 'red', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                    <AlertTriangle size={10} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '1px' }}/>
                    DO NOT SHARE
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--terracotta)' }}>Ingredients & Quantities (per portion)</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--ink-soft)', background: 'rgba(26,22,20,0.02)', padding: '15px', borderRadius: '4px' }}>
                      {dummyDetails.ingredients}
                    </pre>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--terracotta)' }}>Standard Operating Procedure</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--sans)', fontSize: '14px', color: 'var(--ink-soft)', background: 'rgba(26,22,20,0.02)', padding: '15px', borderRadius: '4px' }}>
                      {dummyDetails.method}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
