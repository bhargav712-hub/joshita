import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Edit2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function MenuEditor() {
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [expandedCat, setExpandedCat] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  
  // Forms
  const [itemForm, setItemForm] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [catsRes, itemsRes, varsRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('section_number'),
        supabase.from('menu_items').select('*').order('display_order'),
        supabase.from('menu_item_variants').select('*').order('display_order')
      ])

      if (catsRes.error) throw catsRes.error
      if (itemsRes.error) throw itemsRes.error
      if (varsRes.error) throw varsRes.error

      setCategories(catsRes.data || [])
      setMenuItems(itemsRes.data || [])
      setVariants(varsRes.data || [])
    } catch (err) {
      console.error('Error fetching menu data:', err)
      alert('Error fetching menu data. Make sure the database schema is updated.')
    } finally {
      setLoading(false)
    }
  }

  // --- ITEM CRUD ---
  
  const handleAddNewItem = (categoryId) => {
    setItemForm({
      isNew: true,
      category_id: categoryId,
      name: '',
      description: '',
      diet_type: 'veg',
      has_variants: false,
      accompaniment_label: '',
      accompaniment_text: '',
      display_order: 0,
      is_active: true
    })
  }

  const handleEditItem = (item) => {
    setItemForm({
      isNew: false,
      ...item
    })
  }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    try {
      const { isNew, id, ...basePayload } = itemForm
      
      // Ensure price is 0 since it's required by the DB but no longer used in the UI
      const payload = { ...basePayload, price: 0 }
      
      if (isNew) {
        const { error } = await supabase.from('menu_items').insert([payload])
        if (error) throw error
      } else {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', id)
        if (error) throw error
      }
      
      setItemForm(null)
      fetchData()
    } catch (err) {
      console.error('Error saving item:', err)
      alert('Error saving item: ' + err.message)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err) {
      alert("Failed to delete: " + err.message)
    }
  }

  const toggleItemActive = async (id, currentStatus) => {
    try {
      await supabase.from('menu_items').update({ is_active: !currentStatus }).eq('id', id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading dynamic menu...</div>

  return (
    <div className="space-y-6" style={{ padding: '20px' }}>
      <div className="dash-card">
        <h2>Menu Editor (Dynamic)</h2>
        <p className="desc" style={{ fontFamily: 'var(--sans)' }}>
          Manage all 9 menu categories, dishes, and nested variants for the booking flow.
        </p>
      </div>

      <div className="categories-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {categories.map(cat => {
          const catItems = menuItems.filter(i => i.category_id === cat.id)
          const isExpanded = expandedCat === cat.id

          return (
            <div key={cat.id} className="dash-card" style={{ padding: '15px 20px' }}>
              
              {/* Category Header */}
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
              >
                <div>
                  <h3 style={{ margin: 0, color: 'var(--terracotta)' }}>{cat.section_number}. {cat.name}</h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--ink-soft)' }}>
                    {cat.subtitle} (Limit Group: <strong>{cat.limit_group}</strong>)
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{catItems.length} items</span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Items List (if expanded) */}
              {isExpanded && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #EFE3C9', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                    <button 
                      onClick={() => handleAddNewItem(cat.id)}
                      style={{ background: 'var(--terracotta)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}
                    >
                      <Plus size={14} /> Add New Dish
                    </button>
                  </div>

                  {catItems.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', fontStyle: 'italic' }}>No items in this category yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #EFE3C9', color: 'var(--ink-soft)' }}>
                          <th style={{ padding: '8px' }}>Dish Name</th>
                          <th style={{ padding: '8px' }}>Diet</th>
                          <th style={{ padding: '8px' }}>Variants?</th>
                          <th style={{ padding: '8px' }}>Status</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catItems.map(item => {
                          const itemVars = variants.filter(v => v.menu_item_id === item.id)
                          return (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee', opacity: item.is_active ? 1 : 0.5 }}>
                              <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                                {item.name}
                                {item.description && <div style={{ fontWeight: 'normal', fontSize: '11px', color: '#666', marginTop: '4px' }}>{item.description}</div>}
                                {item.accompaniment_text && <div style={{ fontWeight: 'normal', fontSize: '11px', color: 'var(--terracotta)', marginTop: '2px' }}>{item.accompaniment_label} {item.accompaniment_text}</div>}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{ color: item.diet_type === 'veg' ? 'green' : 'red', textTransform: 'capitalize' }}>{item.diet_type}</span>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {item.has_variants ? <strong>Yes ({itemVars.length})</strong> : 'No'}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <button onClick={() => toggleItemActive(item.id, item.is_active)} style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', textDecoration: 'underline' }}>
                                  {item.is_active ? 'Active' : 'Hidden'}
                                </button>
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                <button onClick={() => handleEditItem(item)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginRight: '10px' }} title="Edit"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteItem(item.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Item Form Modal */}
      {itemForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: 'var(--terracotta)' }}>{itemForm.isNew ? 'Add New Dish' : 'Edit Dish'}</h3>
            
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Dish Name *</label>
                <input type="text" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
                <textarea value={itemForm.description || ''} onChange={e => setItemForm({...itemForm, description: e.target.value})} rows="2" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Diet Type</label>
                  <select value={itemForm.diet_type} onChange={e => setItemForm({...itemForm, diet_type: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Display Order</label>
                  <input type="number" value={itemForm.display_order} onChange={e => setItemForm({...itemForm, display_order: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              </div>
              
              <div style={{ border: '1px solid #EFE3C9', padding: '15px', borderRadius: '4px', background: '#fafafa' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '13px' }}>
                  <input type="checkbox" checked={itemForm.has_variants} onChange={e => setItemForm({...itemForm, has_variants: e.target.checked})} />
                  Item has "Choose:" sub-options (Variants)
                </label>
                <p style={{ margin: '5px 0 0 25px', fontSize: '11px', color: '#666' }}>Check this if the customer needs to pick a specific filling, flavour, or variant for this dish.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Accompaniment Label (Optional)</label>
                <input type="text" value={itemForm.accompaniment_label || ''} onChange={e => setItemForm({...itemForm, accompaniment_label: e.target.value})} placeholder="e.g. Served with:" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Accompaniment Text (Optional)</label>
                <input type="text" value={itemForm.accompaniment_text || ''} onChange={e => setItemForm({...itemForm, accompaniment_text: e.target.value})} placeholder="e.g. Mint Chutney" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setItemForm(null)} style={{ padding: '8px 15px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 15px', background: 'var(--terracotta)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
