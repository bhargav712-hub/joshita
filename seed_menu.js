import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jkdsyxhtpitdpjoqhngy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHN5eGh0cGl0ZHBqb3Fobmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzQzMTUsImV4cCI6MjA5Njg1MDMxNX0.7rIw6gdOYIqTs2d9jgDie7HmaKv3qLpKc2T90X318nI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const categories = [
  { section_number: 1, name: 'Welcome Drinks', subtitle: 'Traditional Coolers & Sharbats', limit_group: 'welcome_drinks' },
  { section_number: 2, name: 'Signature Starters', subtitle: 'ARIVA\'s hero plates — built fresh and bold.', limit_group: 'beverages' },
  { section_number: 3, name: 'Street Food', subtitle: 'Live Fried & Chaat Counters', limit_group: 'street_food' },
  { section_number: 4, name: 'Starters', subtitle: 'Fried · Grilled · Tandoor', limit_group: 'starters' },
  { section_number: 5, name: 'Main Course', subtitle: 'Biryani · Curries · Breads', limit_group: 'mains' },
  { section_number: 6, name: 'Desserts', subtitle: 'Live Sweets & Closers', limit_group: 'desserts' },
]

const menuItemsData = {
  'Welcome Drinks': [
    { name: 'Panakam', desc: 'Traditional jaggery-lemon cooler with cardamom & pepper; temple-style recipe', diet: 'veg' },
    { name: 'Rose Sharbat', desc: 'Damascena rose syrup, chilled milk, sabja seeds', diet: 'veg' },
    { name: 'Masala Chaas', desc: 'Spiced buttermilk with cumin, curry leaf, green chilli', diet: 'veg' },
    { name: 'Nannari Sherbet', desc: 'Sarasaparilla root syrup, lime, served over crushed ice', diet: 'veg' },
    { name: 'Jigarthanda', desc: 'Madurai-style almond gum, sarsaparilla, reduced milk, ice cream', diet: 'veg' },
    { name: 'Sol Kadhi', desc: 'Kokum-coconut milk cooler, tempered with garlic & curry leaf', diet: 'veg' },
    { name: 'Aam Panna', desc: 'Raw mango pulp, roasted cumin, mint, black salt', diet: 'veg' },
    { name: 'Jaljeera Fizz', desc: 'Classic jaljeera with soda fizz, boondi float', diet: 'veg' }
  ],
  'Signature Starters': [
    { name: 'Irani Chai', desc: 'Hyderabadi-style with condensed milk, brewed in brass kettle', diet: 'veg' },
    { name: 'Filter Kaapi', desc: 'Degree coffee, hand-pulled, served in dabara-tumbler set', diet: 'veg' },
    { name: 'Masala Karak Chai', desc: 'Strong CTC tea, ginger, cardamom, clove', diet: 'veg' },
    { name: 'Sulaimani Chai', desc: 'Malabar black tea with lime & cardamom, no milk', diet: 'veg' },
    { name: 'Badam Milk', desc: 'Slow-cooked saffron-almond milk, served hot or chilled', diet: 'veg' },
    { name: 'Fresh Lime Soda', desc: 'Nimbu pani with soda, black salt, cumin', diet: 'veg' },
    { name: 'Kokum Soda', desc: 'Sweet-sour kokum with soda & mint', diet: 'veg' },
    { name: 'Virgin Mojito', desc: 'Muddled mint, lime, sugar, soda water, crushed ice', diet: 'veg' }
  ],
  'Street Food': [
    { name: 'Punugulu', desc: 'Crispy idli-batter fritters; <em>fried live</em> with allam pachadi & peanut chutney', diet: 'veg' },
    { name: 'Mirchi Bajji', desc: 'Bajji-batter green chillies; <em>fried live</em>; served with tamarind chutney', diet: 'veg' },
    { name: 'Aloo Bonda', desc: 'Potato-stuffed gram-flour fritter; served with coconut chutney', diet: 'veg' },
    { name: 'Sakinalu', desc: 'Rice-flour spiral crisps with sesame; traditional Telangana recipe', diet: 'veg' },
    { name: 'Masala Corn Cup', desc: 'Butter-tossed sweet corn with lime, peri-peri, chaat masala', diet: 'veg' },
    { name: 'Pani Puri Station', desc: 'Crisp puris with 3 waters: hing-jeera, green mint, sweet tamarind', diet: 'veg' },
    { name: 'Dahi Puri', desc: 'Crushed puris with curd, chutneys, sev, pomegranate', diet: 'veg' },
    { name: 'Bhel Puri Live Counter', desc: 'Puffed rice tossed live with chutneys, onion, coriander', diet: 'veg' },
    { name: 'Bread Omelette', desc: 'Double-egg omelette folded in butter-toasted bread; <em>live tawa</em>', diet: 'nonveg' },
    { name: 'Egg Bhurji Pav', desc: 'Spiced scrambled eggs, served with butter pav; <em>live preparation</em>', diet: 'nonveg' }
  ],
  'Starters': [
    { name: 'Paneer 65', desc: 'Hyderabadi-style paneer, shallow-fried with curry leaf & red chilli', diet: 'veg' },
    { name: 'Gobi 65', desc: 'Cauliflower florets in spiced rice-flour batter, double-fried', diet: 'veg' },
    { name: 'Baby Corn Pepper Fry', desc: 'Tossed in crushed pepper, curry leaf & butter', diet: 'veg' },
    { name: 'Mushroom Pepper Fry', desc: 'Button mushrooms flash-fried with cracked pepper & garlic', diet: 'veg' },
    { name: 'Veg Manchurian (Dry)', desc: 'Cabbage-carrot koftas in soy-garlic sauce', diet: 'veg' },
    { name: 'Hara Bhara Kebab', desc: 'Spinach-pea-paneer patties, pan-seared on <em>live tawa</em>', diet: 'veg' },
    { name: 'Paneer Tikka', desc: 'Tandoor-style paneer with bell pepper, marinated in hung curd & spices', diet: 'veg' },
    { name: 'Chicken 65', desc: 'Hyderabadi classic, deep-fried with curry leaf tempering', diet: 'nonveg' },
    { name: 'Chicken Lollipop', desc: 'Frenched drumette, batter-fried, tossed in hot sauce', diet: 'nonveg' },
    { name: 'Chicken Manchurian (Dry)', desc: 'Chicken koftas in Indo-Chinese soy-garlic-chilli sauce', diet: 'nonveg' },
    { name: 'Tandoori Chicken', desc: 'Half-leg marinated in yoghurt-spice, cooked on <em>live charcoal</em>', diet: 'nonveg' },
    { name: 'Chicken Malai Tikka', desc: 'Cream-cheese-marinated breast, chargrilled, mild & smoky', diet: 'nonveg' },
    { name: 'Fish Amritsari', desc: 'Ajwain-spiced gram-flour batter, fried golden', diet: 'nonveg' },
    { name: 'Prawns Pepper Fry', desc: 'Jumbo prawns tossed in crushed pepper, garlic & butter', diet: 'nonveg' }
  ],
  'Main Course': [
    { name: 'Veg Dum Biryani', desc: 'Basmati rice layered with mixed vegetables, saffron, fried onion, slow-cooked in sealed handi', diet: 'veg' },
    { name: 'Paneer Butter Masala', desc: 'Cottage cheese in tomato-cashew-butter gravy', diet: 'veg' },
    { name: 'Dal Tadka', desc: 'Yellow lentils tempered with ghee, cumin, garlic, dry red chilli', diet: 'veg' },
    { name: 'Aloo Gobi', desc: 'Potato-cauliflower dry curry with turmeric, cumin & coriander', diet: 'veg' },
    { name: 'Veg Kolhapuri', desc: 'Mixed vegetables in spicy Kolhapuri masala', diet: 'veg' },
    { name: 'Ghee Karam Dosa', desc: 'Crispy dosa with ghee & gun-powder chutney, <em>live tawa</em>', diet: 'veg' },
    { name: 'Butter Naan', desc: 'Leavened bread baked on tawa, brushed with butter', diet: 'veg' },
    { name: 'Jeera Rice', desc: 'Basmati rice tempered with cumin & ghee', diet: 'veg' },
    { name: 'Hyderabadi Chicken Dum Biryani', desc: 'Marinated chicken layered with basmati, saffron, fried onion, sealed & slow-cooked', diet: 'nonveg' },
    { name: 'Butter Chicken', desc: 'Tandoor-smoked chicken in tomato-butter-cream gravy', diet: 'nonveg' },
    { name: 'Mutton Rogan Josh', desc: 'Slow-braised lamb in Kashmiri chilli-yoghurt sauce', diet: 'nonveg' },
    { name: 'Chicken Chettinad', desc: 'Fiery roasted-spice curry, South Indian style', diet: 'nonveg' },
    { name: 'Egg Curry', desc: 'Boiled eggs in onion-tomato masala, tempered with mustard & curry leaf', diet: 'nonveg' },
    { name: 'Fish Curry', desc: 'Coastal-style fish in tangy kokum-coconut gravy', diet: 'nonveg' }
  ],
  'Desserts': [
    { name: 'Jalebi with Rabri', desc: 'Piped & <em>fried live</em>; served with thick saffron-cardamom rabri', diet: 'veg' },
    { name: 'Gulab Jamun', desc: 'Khoya dumplings in rose-cardamom sugar syrup', diet: 'veg' },
    { name: 'Double ka Meetha', desc: 'Hyderabadi bread pudding with reduced milk, dry fruits, saffron', diet: 'veg' },
    { name: 'Qubani ka Meetha', desc: 'Stewed dried apricots with clotted cream', diet: 'veg' },
    { name: 'Phirni', desc: 'Ground-rice pudding set in clay cups, topped with pistachios', diet: 'veg' },
    { name: 'Kulfi (Malai / Mango)', desc: 'Dense frozen dairy, sliced from mould; served with falooda', diet: 'veg' },
    { name: 'Ice-Cream Rolls', desc: 'Rolled <em>live</em> on a frozen slab; choice of fruit, cookie, or chocolate', diet: 'veg' },
    { name: 'Cutting Chai & Pan Counter', desc: 'Masala chai in cutting glasses alongside sweet & meetha paan', diet: 'veg' }
  ]
}

async function seed() {
  console.log('Clearing existing menu items...');
  await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('Clearing existing menu categories...');
  await supabase.from('menu_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('Inserting categories...');
  const { data: catData, error: catErr } = await supabase.from('menu_categories').insert(categories).select();
  if (catErr) {
    console.error('Error inserting categories:', catErr);
    return;
  }
  
  const itemsToInsert = [];
  
  for (const cat of catData) {
    const items = menuItemsData[cat.name] || [];
    items.forEach((item, index) => {
      itemsToInsert.push({
        category_id: cat.id,
        name: item.name,
        description: item.desc,
        diet_type: item.diet,
        display_order: index + 1,
        is_active: true,
        has_variants: false,
        price: 0
      });
    });
  }
  
  console.log('Inserting items...');
  const { error: itemErr } = await supabase.from('menu_items').insert(itemsToInsert);
  
  if (itemErr) {
    console.error('Error inserting items:', itemErr);
  } else {
    console.log('Successfully seeded menu data!');
  }
}

seed();
