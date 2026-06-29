import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jkdsyxhtpitdpjoqhngy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHN5eGh0cGl0ZHBqb3Fobmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzQzMTUsImV4cCI6MjA5Njg1MDMxNX0.7rIw6gdOYIqTs2d9jgDie7HmaKv3qLpKc2T90X318nI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const { data, error } = await supabase.from('menu_categories').select('id, name, created_at, limit_group').order('created_at', { ascending: true })
  console.log(data)
  
  const { data: items } = await supabase.from('menu_items').select('id, name, category_id')
  console.log("Total items:", items?.length)
}
run()
