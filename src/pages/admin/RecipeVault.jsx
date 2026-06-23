import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Lock, KeyRound } from 'lucide-react'

export default function RecipeVault() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    checkAccessAndFetch()
  }, [])

  async function checkAccessAndFetch() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      // 1. Check if user is an admin in profiles table
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('role', 'admin')
        .single()
      
      if (roleError || !roleData) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      // 2. Authorized Fetching
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          signature_recipe_details,
          menu_items ( name )
        `)
      
      if (error) {
        // Handle RLS rejection just in case the policy blocked it
        if (error.code === '42501' || error.message.includes('row-level security')) {
          setAccessDenied(true)
        } else {
          throw error
        }
      } else {
        setRecipes(data || [])
      }
    } catch (err) {
      console.error('Vault Decryption Error:', err.message)
      setAccessDenied(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Decrypting Vault...</div>

  if (accessDenied) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--terracotta)' }}>
        <Lock size={64} style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Vault Locked</h2>
        <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-soft)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
          You do not possess the required <strong>superadmin</strong> clearance to view the Recipe Vault. This area is strictly protected by Row Level Security.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card" style={{ border: '2px solid var(--terracotta)', background: '#fffcf9' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--terracotta)' }}>
          <KeyRound size={24} /> The Recipe Vault
        </h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>
          Highly secure environment. Trade secrets and signature recipes are decrypted and displayed here.
        </p>
      </div>

      <div className="dash-grid-2">
        {recipes.length === 0 ? (
          <p className="text-muted">The vault is currently empty. No secure recipes found.</p>
        ) : (
          recipes.map((r) => (
            <div className="dash-card" key={r.id}>
              <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: 700 }}>
                {r.menu_items?.name || 'Unknown Signature Item'}
              </h3>
              <div style={{ background: 'var(--bone)', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', borderLeft: '4px solid var(--terracotta)', color: 'var(--ink)' }}>
                {r.signature_recipe_details}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
