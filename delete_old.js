import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jkdsyxhtpitdpjoqhngy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHN5eGh0cGl0ZHBqb3Fobmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzQzMTUsImV4cCI6MjA5Njg1MDMxNX0.7rIw6gdOYIqTs2d9jgDie7HmaKv3qLpKc2T90X318nI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const cutoff = '2026-06-29T12:00:00+00:00';
  
  // 1. Get old categories
  const { data: oldCats } = await supabase.from('menu_categories').select('id').lt('created_at', cutoff);
  const oldCatIds = oldCats.map(c => c.id);
  
  if (oldCatIds.length === 0) {
    console.log("No old categories found.");
    return;
  }
  
  console.log(`Found ${oldCatIds.length} old categories. Deleting their items...`);
  
  // 2. Delete all items belonging to old categories
  const { data: deletedItems, error: itemsErr } = await supabase.from('menu_items').delete().in('category_id', oldCatIds).select();
  if (itemsErr) console.error("Error deleting items:", itemsErr);
  else console.log(`Deleted ${deletedItems.length} old menu items.`);
  
  // 3. Delete old categories
  const { data: deletedCats, error: catsErr } = await supabase.from('menu_categories').delete().in('id', oldCatIds).select();
  if (catsErr) console.error("Error deleting categories:", catsErr);
  else console.log(`Deleted ${deletedCats.length} old categories.`);
}
run()
