const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wyxvbzbqbznqjftbgcxc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHZiemJxYnpucWpmdGJnY3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTA5NzMsImV4cCI6MjA5NDA4Njk3M30.2mVqTfTfENipgAgvGWOPg2qPaZrZ4KdNoB6VckWgnG0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignIn() {
  console.log('Attempting sign in without redirect URL...')
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'claudiokurath@gmail.com'
  })

  console.log('Data:', JSON.stringify(data, null, 2))
  console.log('Error:', error ? JSON.stringify(error, null, 2) : null)
  if (error) {
    console.log('Error details:', error.message, error.name, error.status)
  }
}

testSignIn()
