import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './BookingPage.css';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [variants, setVariants] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  
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

  // Nav scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

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
    window.scrollTo(0, 0);
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
        setPinMsg({ text: "We currently serve Hyderabad only - but send your enquiry and we'll see what we can do.", cls: 'no' });
      }
    } else {
      setPinMsg({ text: '', cls: '' });
    }
  };

  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const structuredMenu = Object.keys(menuSelections).map(itemId => {
        const item = menuItems.find(i => i.id === itemId);
        const variantId = menuSelections[itemId];
        const variant = variantId ? variants.find(v => v.id === variantId) : null;
        
        return {
          menu_item_id: item.id,
          menu_item_name: item.name,
          category_id: item.category_id,
          category_name: categories.find(c => c.id === item.category_id)?.name || '',
          variant_id: variantId,
          variant_name: variant ? variant.name : null
        };
      });

      const { error } = await supabase
        .from('enquiries')
        .insert([{
          name: formData.name,
          phone: formData.phone,
          event_date: formData.event_date,
          guests: parseInt(formData.guests) || selectedPackage.max_guests,
          pincode: formData.pincode,
          notes: formData.notes,
          package_id: selectedPackage.id,
          menu_selections: structuredMenu
        }]);

      if (error) {
        console.error("Supabase Error:", error);
      }

      let msg = `*NEW ARIVA BOOKING ENQUIRY*\n\n`;
      msg += `*Name:* ${formData.name}\n`;
      msg += `*Phone:* ${formData.phone}\n`;
      msg += `*Date:* ${formData.event_date}\n`;
      msg += `*Guests:* ${formData.guests}\n`;
      msg += `*Pincode:* ${formData.pincode}\n\n`;
      
      msg += `*Package Selected:* ${selectedPackage.name} (₹${selectedPackage.price.toLocaleString()})\n\n`;
      msg += `*MENU SELECTIONS:*\n`;
      
      categories.forEach(cat => {
        const itemsInCat = structuredMenu.filter(m => m.category_id === cat.id);
        if (itemsInCat.length > 0) {
          msg += `_${cat.name}_\n`;
          itemsInCat.forEach(m => {
            msg += `- ${m.menu_item_name}`;
            if (m.variant_name) msg += ` (${m.variant_name})`;
            msg += `\n`;
          });
          msg += `\n`;
        }
      });
      
      if (formData.notes) {
        msg += `*Notes / Heritage Recipe:* ${formData.notes}\n`;
      }

      const waUrl = `https://wa.me/919703823111?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
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
    <div className="book-page">
      {/* NAV */}
      <nav id="nav" className={scrolled ? 'scrolled' : ''}>
        <div className="wrap nav-inner">
          <Link to="/" className="logo" aria-label="ariva home">
            <img className="logo-img" src="/assets/ariva-logo-dark.svg" alt="ariva" />
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Back to Home</Link></li>
            <li><Link to="/account">{selectedPackage ? 'My Account' : 'Login'}</Link></li>
          </ul>
        </div>
      </nav>

      <section className="booking-wizard">
        <div className="wrap">
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
                <p className="section-sub">Pick the package that fits your gathering — from an intimate dinner to a celebration for 50.</p>
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
                      className="btn btn-outline"
                      onClick={() => handleSelectPackage(pkg)} 
                      style={{ marginTop: '24px', width: '100%' }}
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
                <p className="section-sub">You've selected the <strong>{selectedPackage?.name}</strong> package. Choose your dishes below.</p>
              </div>

              <div className="menu-builder-layout">
                <div className="menu-main">
                  {categories.map(cat => {
                    const limit = getLimitForCategory(cat.limit_group);
                    const selectedCount = getSelectedCountForGroup(cat.limit_group);
                    const catItems = menuItems.filter(i => i.category_id === cat.id);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="act">
                        <div className="act-head" style={{ padding: '0 0 15px 0' }}>
                          <div>
                            <h3 style={{ margin: 0 }}><span className="act-roman">0{cat.section_number}</span> {cat.name}</h3>
                            <span className="act-tag">{cat.subtitle}</span>
                          </div>
                          <div className={`limit-badge ${selectedCount >= limit ? 'reached' : ''}`}>
                            {selectedCount} / {limit} Selected
                          </div>
                        </div>
                        
                        <div className="act-body" style={{ display: 'block', padding: '15px 0 30px 0' }}>
                          <div className="menu-items-grid">
                            {catItems.map(item => {
                              const isSelected = menuSelections[item.id] !== undefined;
                              const selectedVariantId = menuSelections[item.id];
                              const itemVariants = variants.filter(v => v.menu_item_id === item.id);

                              return (
                                <div 
                                  key={item.id} 
                                  className={`builder-item ${isSelected ? 'selected' : ''} ${item.has_variants ? 'has-variants' : ''}`}
                                  onClick={() => {
                                    if (!item.has_variants) {
                                      handleToggleItem(item);
                                    }
                                  }}
                                >
                                  <div className="builder-item-head">
                                    <span className={item.diet_type === 'veg' ? 'veg-dot' : item.diet_type === 'nonveg' ? 'nonveg-dot' : 'both-dot'}></span>
                                    <span className="builder-item-name">{item.name}</span>
                                  </div>
                                  {item.description && <p className="builder-item-desc">{item.description}</p>}
                                  
                                  {item.accompaniment_label && (
                                    <p className="builder-item-accomp">
                                      <strong>{item.accompaniment_label}</strong> {item.accompaniment_text}
                                    </p>
                                  )}

                                  {item.has_variants && (
                                    <div className="builder-variants">
                                      <p className="builder-variant-label">Choose option:</p>
                                      <div className="builder-variant-list">
                                        {itemVariants.map(v => (
                                          <button
                                            key={v.id}
                                            className={`variant-pill ${selectedVariantId === v.id ? 'active' : ''}`}
                                            onClick={() => handleToggleItem(item, v.id)}
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

                <div className="menu-sidebar">
                  <div className="menu-sidebar-inner">
                    <h3>Your Selections</h3>
                    <div className="sidebar-limits">
                      {Object.entries(limitStats).map(([group, stats]) => (
                        <div key={group} className="sidebar-limit-row">
                          <span className="limit-row-name">{group.replace('_', ' ')}</span>
                          <span className={`limit-row-count ${stats.count >= stats.limit ? 'reached' : ''}`}>
                            {stats.count} / {stats.limit}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="sidebar-actions">
                      <button className="btn btn-outline" style={{ width: '100%', marginBottom: '10px' }} onClick={() => setStep(1)}>Back</button>
                      <button className="btn btn-primary" style={{ width: '100%', opacity: isMenuComplete ? 1 : 0.6 }} onClick={() => { 
                        if (isMenuComplete) {
                          setStep(3); 
                          window.scrollTo(0,0);
                        } else {
                          alert("Please complete your menu selections to proceed to the next step.");
                        }
                      }}>Continue</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="wizard-pane">
              <div className="center">
                <span className="eyebrow">Step 03</span>
                <h2 className="section-title">Final Details</h2>
                <p className="section-sub">We'll confirm availability and call you back within a few hours.</p>
              </div>

              <div className="book-grid" style={{ marginTop: '50px' }}>
                <div className="book-info">
                  <h3>Booking Summary</h3>
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
                  <h3 style={{ marginTop: '30px' }}>Need help?</h3>
                  <p className="section-sub" style={{ fontSize: '15px' }}>Chat with us directly on WhatsApp for immediate support.</p>
                </div>
                
                <form className="form-card" onSubmit={handleSubmitEnquiry}>
                  <div className="form-row">
                    <div className="field"><label>Your Name</label><input type="text" name="name" value={formData.name} onChange={handleFormChange} minLength="2" required /></div>
                    <div className="field"><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} required /></div>
                  </div>
                  <div className="form-row">
                    <div className="field"><label>Event Date</label><input type="date" name="event_date" value={formData.event_date} onChange={handleFormChange} min={minDate} required /></div>
                    <div className="field">
                      <label>Guests (Max: {selectedPackage?.max_guests})</label>
                      <input type="number" name="guests" value={formData.guests} onChange={handleFormChange} max={selectedPackage?.max_guests} required />
                      {formData.guests && parseInt(formData.guests) > selectedPackage?.max_guests && (
                        <span style={{ color: 'var(--terracotta)', fontSize: '12px', marginTop: '4px' }}>
                          Exceeds max limit of {selectedPackage?.max_guests}.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field" style={{ flex: '1' }}><label>Pincode</label>
                      <input type="text" maxLength="6" value={formData.pincode} onChange={handlePincode} required />
                      <span className={`pincode-msg ${pinMsg.cls}`}>{pinMsg.text}</span>
                    </div>
                  </div>
                  <div className="field">
                    <label>Add-ons or Heritage Recipe Request</label>
                    <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3"></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Send Enquiry on WhatsApp'}
                    </button>
                  </div>
                  <p className="form-note">Your enquiry opens in WhatsApp - nothing is charged now.</p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
