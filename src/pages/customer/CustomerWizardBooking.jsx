import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function CustomerWizardBooking() {
  const { currentUser } = useOutletContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [variants, setVariants] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  const [menuSelections, setMenuSelections] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    event_date: '',
    guests: '',
    pincode: '',
    notes: ''
  });
  
  const [pinMsg, setPinMsg] = useState({ text: '', cls: '' });

  useEffect(() => {
    fetchData();
    if (currentUser) {
      loadProfileData();
    }
  }, [currentUser]);

  const loadProfileData = async () => {
    const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', currentUser.id).single();
    if (data) {
      setFormData(prev => ({
        ...prev,
        name: data.full_name || '',
        phone: data.phone || ''
      }));
    }
  };

  const fetchData = async () => {
    try {
      // Fetch packages
      const { data: pkgs, error: pkgErr } = await supabase
        .from('packages')
        .select('*, package_category_limits(*)')
        .eq('is_active', true)
        .order('display_order');
        
      if (pkgErr) throw pkgErr;
      setPackages(pkgs || []);

      // Fetch menu categories
      const { data: cats, error: catErr } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('section_number');
      if (catErr) throw catErr;
      setCategories(cats || []);

      // Fetch menu items
      const { data: items, error: itemErr } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (!itemErr) setMenuItems(items || []);

      // Fetch variants
      const { data: vars, error: varErr } = await supabase
        .from('menu_item_variants')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (!varErr) setVariants(vars || []);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setMenuSelections({});
    setStep(2);
  };

  const getLimitForCategory = (limitGroup) => {
    if (!selectedPackage || !selectedPackage.package_category_limits) return 0;
    const limitObj = selectedPackage.package_category_limits.find(l => l.limit_group === limitGroup);
    return limitObj ? limitObj.max_selections : 0;
  };

  const getSelectedCountForGroup = (limitGroup) => {
    const catsInGroup = categories.filter(c => c.limit_group === limitGroup).map(c => c.id);
    const itemsInGroup = menuItems.filter(i => catsInGroup.includes(i.category_id)).map(i => i.id);
    
    let count = 0;
    Object.keys(menuSelections).forEach(itemId => {
      if (itemsInGroup.includes(itemId)) count++;
    });
    return count;
  };

  const handleToggleItem = (item, variantId = null) => {
    setMenuSelections(prev => {
      const newSelections = { ...prev };
      
      if (newSelections[item.id] !== undefined) {
        if (item.has_variants && variantId && newSelections[item.id] !== variantId) {
          newSelections[item.id] = variantId;
        } else {
          delete newSelections[item.id];
        }
        return newSelections;
      }
      
      const cat = categories.find(c => c.id === item.category_id);
      if (cat) {
        const limit = getLimitForCategory(cat.limit_group);
        const currentCount = getSelectedCountForGroup(cat.limit_group);
        if (currentCount >= limit) {
          alert(`You've reached the maximum limit (${limit}) for ${cat.limit_group.replace('_', ' ')}.`);
          return prev;
        }
      }
      
      newSelections[item.id] = variantId;
      return newSelections;
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePincode = (e) => {
    const v = e.target.value.trim();
    setFormData(prev => ({ ...prev, pincode: v }));
    if (v.length === 6) {
      if (/^50[0-2]\d{3}$/.test(v)) {
        setPinMsg({ text: '✓ Great news - we serve your area!', cls: 'ok' });
      } else {
        setPinMsg({ text: "We currently serve Hyderabad only - but we'll review your request.", cls: 'no' });
      }
    } else {
      setPinMsg({ text: '', cls: '' });
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Insert into bookings table
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          user_id: currentUser.id,
          event_date: formData.event_date,
          venue_pincode: formData.pincode,
          guest_count: parseInt(formData.guests) || selectedPackage.max_guests,
          status: 'pending_admin',
          package_tier: selectedPackage.name
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;

      const bookingId = bookingData.id;

      // 2. Insert menu items
      if (Object.keys(menuSelections).length > 0) {
        const menuInserts = Object.keys(menuSelections).map(itemId => ({
          booking_id: bookingId,
          menu_item_id: itemId,
          quantity: 1 // Default quantity or base it on something else
        }));

        const { error: menuError } = await supabase.from('booking_menu_items').insert(menuInserts);
        if (menuError) throw menuError;
      }

      // If notes are provided, you might want to save them to a notes column in bookings or a separate table.
      // For now, alerting success.

      alert('Your booking has been requested! The Admin has been notified.');
      
      // Reset form
      setStep(1);
      setSelectedPackage(null);
      setMenuSelections({});
      setFormData(prev => ({ ...prev, event_date: '', guests: '', pincode: '', notes: '' }));
      
      navigate('/dashboard/my-bookings');

    } catch (err) {
      console.error(err);
      alert("An error occurred while placing your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="dash-card"><p className="desc">Loading packages and menu...</p></div>;
  }

  const limitStats = categories.reduce((acc, cat) => {
    acc[cat.limit_group] = { limit: getLimitForCategory(cat.limit_group), count: getSelectedCountForGroup(cat.limit_group) };
    return acc;
  }, {});
  const isMenuComplete = Object.values(limitStats).length > 0 && Object.values(limitStats).every(stat => stat.count >= stat.limit);

  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() + 2);
  const minDate = minDateObj.toISOString().split('T')[0];

  return (
    <div className="dash-card" style={{ padding: '0', overflow: 'hidden' }}>
      <section className="booking-wizard" style={{ paddingTop: '20px', paddingBottom: '20px', background: 'transparent' }}>
        <div className="wrap" style={{ maxWidth: '100%' }}>
          <div className="wizard-progress">
            <div 
              className={`wizard-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}
              onClick={() => setStep(1)}
              style={{ cursor: 'pointer' }}
            >
              Package
            </div>
            <div className="wizard-line"></div>
            <div 
              className={`wizard-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}
              onClick={() => { if (selectedPackage) setStep(2) }}
              style={{ cursor: selectedPackage ? 'pointer' : 'not-allowed', opacity: selectedPackage ? 1 : 0.5 }}
            >
              Menu
            </div>
            <div className="wizard-line"></div>
            <div 
              className={`wizard-step ${step === 3 ? 'active' : ''}`}
              onClick={() => { if (isMenuComplete) setStep(3) }}
              style={{ cursor: isMenuComplete ? 'pointer' : 'not-allowed', opacity: isMenuComplete ? 1 : 0.5 }}
            >
              Details
            </div>
          </div>

          {/* STEP 1: PACKAGES */}
          {step === 1 && (
            <div className="wizard-pane">
              <div className="center">
                <span className="eyebrow">Step 01</span>
                <h2 className="section-title">Choose your experience</h2>
                <p className="section-sub">Pick the package that fits your gathering.</p>
              </div>

              <div className="tier-grid">
                {packages.map(pkg => (
                  <div key={pkg.id} className="tier-card card3d">
                    <div className="tier-head">
                      <div>
                        <h3 className="tier-name">{pkg.name}</h3>
                        <div className="tier-guests">UP TO {pkg.max_guests} GUESTS</div>
                      </div>
                    </div>
                    <ul className="tier-includes">
                      <li><strong>Category Limits:</strong></li>
                      {pkg.package_category_limits?.map(l => (
                        <li key={l.limit_group}>
                          {l.max_selections} {l.limit_group.replace('_', ' ')}
                        </li>
                      ))}
                      <li style={{ marginTop: '10px', fontStyle: 'italic', color: 'var(--ink-soft)' }}>{pkg.tagline}</li>
                    </ul>
                    <button 
                      className="submit-btn"
                      onClick={() => handleSelectPackage(pkg)} 
                      style={{ marginTop: '24px', width: '100%', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink)' }}
                    >
                      Select {pkg.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: MENU BUILDER */}
          {step === 2 && (
            <div className="wizard-pane">
              <div className="center" style={{ marginBottom: '40px' }}>
                <span className="eyebrow">Step 02</span>
                <h2 className="section-title">Curate your menu</h2>
                <p className="section-sub">You've selected the <strong>{selectedPackage?.name}</strong> package.</p>
              </div>

              <div className="menu-builder-layout" style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
                <div className="menu-sidebar" style={{ position: 'relative', top: 0, width: '100%', maxWidth: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {Object.entries(limitStats).map(([group, stats]) => (
                      <div key={group} style={{ background: 'var(--bone-light)', padding: '10px 15px', borderRadius: '4px', border: '1px solid var(--ink-border)', fontSize: '13px' }}>
                        <strong>{group.replace('_', ' ')}:</strong> <span className={stats.count >= stats.limit ? 'reached' : ''} style={{ color: stats.count >= stats.limit ? 'var(--terracotta)' : 'var(--ink)' }}>{stats.count}/{stats.limit}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <button className="submit-btn" style={{ padding: '10px 20px', marginTop: 0, opacity: isMenuComplete ? 1 : 0.6 }} onClick={() => {
                      if (isMenuComplete) {
                        setStep(3);
                      } else {
                        alert("Please complete your menu selections to proceed to the next step.");
                      }
                    }}>Continue</button>
                  </div>
                </div>

                <div className="menu-main" style={{ width: '100%' }}>
                  {categories.map(cat => {
                    const limit = getLimitForCategory(cat.limit_group);
                    const selectedCount = getSelectedCountForGroup(cat.limit_group);
                    const catItems = menuItems.filter(i => i.category_id === cat.id);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="act">
                        <div className="act-head" style={{ padding: '0 0 15px 0' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '20px' }}><span className="act-roman" style={{ fontSize: '14px', marginRight: '8px' }}>0{cat.section_number}</span> {cat.name}</h3>
                            <span className="act-tag">{cat.subtitle}</span>
                          </div>
                        </div>
                        
                        <div className="act-body" style={{ display: 'block', padding: '15px 0 30px 0' }}>
                          <div className="menu-items-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                            {catItems.map(item => {
                              const isSelected = menuSelections[item.id] !== undefined;
                              const selectedVariantId = menuSelections[item.id];
                              const itemVariants = variants.filter(v => v.menu_item_id === item.id);

                              return (
                                <div 
                                  key={item.id} 
                                  className={`builder-item ${isSelected ? 'selected' : ''} ${item.has_variants ? 'has-variants' : ''}`} 
                                  style={{ padding: '15px' }}
                                  onClick={() => {
                                    if (!item.has_variants) {
                                      handleToggleItem(item);
                                    }
                                  }}
                                >
                                  <div className="builder-item-head">
                                    <span className={item.diet_type === 'veg' ? 'veg-dot' : item.diet_type === 'nonveg' ? 'nonveg-dot' : 'both-dot'}></span>
                                    <span className="builder-item-name" style={{ fontSize: '15px' }}>{item.name}</span>
                                  </div>

                                  {item.has_variants && (
                                    <div className="builder-variants" style={{ marginTop: '15px' }}>
                                      <p className="builder-variant-label" style={{ marginBottom: '8px' }}>Choose option:</p>
                                      <div className="builder-variant-list" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                        {itemVariants.map(v => (
                                          <button
                                            key={v.id}
                                            className={`variant-pill ${selectedVariantId === v.id ? 'active' : ''}`}
                                            onClick={() => handleToggleItem(item, v.id)}
                                            style={{ padding: '6px 12px', fontSize: '11px', flex: 1 }}
                                          >
                                            {v.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="wizard-pane" style={{ padding: '60px 24px', borderRadius: '8px' }}>
              <div className="center">
                <span className="eyebrow">Step 03</span>
                <h2 className="section-title">Final Details</h2>
                <p className="section-sub">We'll confirm availability and call you back within a few hours.</p>
              </div>

              <div className="book-grid" style={{ marginTop: '50px', gridTemplateColumns: '1fr', maxWidth: '600px', margin: '50px auto 0 auto' }}>
                <form className="form-card" style={{ padding: '30px' }} onSubmit={handleSubmitBooking}>
                  <div className="final-summary-box" style={{ marginBottom: '30px' }}>
                    <div className="fs-row"><span>Package:</span> <strong>{selectedPackage?.name}</strong></div>
                    <div className="fs-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ marginBottom: '4px' }}>Menu Items ({Object.keys(menuSelections).length}):</span>
                      <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, width: '100%' }}>
                        {Object.keys(menuSelections).map(itemId => {
                          const item = menuItems.find(i => i.id === itemId);
                          if (!item) return null;
                          const variantId = menuSelections[itemId];
                          const variant = variantId ? variants.find(v => v.id === variantId) : null;
                          return (
                            <li key={itemId} style={{ padding: '8px 12px', background: 'var(--bone-light)', borderRadius: '4px', marginBottom: '6px', fontSize: '14px', color: 'var(--ink)', border: '1px solid var(--ink-border)' }}>
                              <strong>{item.name}</strong> {variant ? <span style={{ color: 'var(--ink-soft)' }}>— {variant.name}</span> : ''}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="dash-grid-2">
                    <div><label className="form-label">Contact Name</label><input type="text" className="form-input" name="name" value={formData.name} onChange={handleFormChange} minLength="2" required /></div>
                    <div><label className="form-label">Phone</label><input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleFormChange} required /></div>
                  </div>
                  <div className="dash-grid-2" style={{ marginTop: '20px' }}>
                    <div><label className="form-label">Event Date</label><input type="date" className="form-input" name="event_date" value={formData.event_date} onChange={handleFormChange} min={minDate} required /></div>
                    <div>
                      <label className="form-label">Guests (Max: {selectedPackage?.max_guests})</label>
                      <input type="number" className="form-input" name="guests" value={formData.guests} onChange={handleFormChange} max={selectedPackage?.max_guests} required />
                      {formData.guests && parseInt(formData.guests) > selectedPackage?.max_guests && (
                        <span style={{ color: 'var(--terracotta)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          Exceeds max limit of {selectedPackage?.max_guests}.
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <label className="form-label">Pincode</label>
                    <input type="text" className="form-input" maxLength="6" value={formData.pincode} onChange={handlePincode} required />
                    <span className={`pincode-msg ${pinMsg.cls}`} style={{ display: 'block', fontSize: '12px', marginTop: '5px' }}>{pinMsg.text}</span>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <label className="form-label">Notes or Special Requests</label>
                    <textarea className="form-input" name="notes" value={formData.notes} onChange={handleFormChange} rows="3"></textarea>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <button type="button" className="submit-btn" style={{ background: 'var(--sand)', color: 'var(--ink)', flex: '0 0 100px' }} onClick={() => setStep(2)}>Back</button>
                    <button type="submit" className="submit-btn" style={{ flex: 1 }} disabled={isSubmitting}>
                      {isSubmitting ? 'Confirming...' : 'Place Booking Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
