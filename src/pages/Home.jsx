import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/ariva-website', { replace: true })
  }, [navigate])

  return (
    <p>Loading ARIVA… if it doesn't open, <a href="/ariva-website">click here</a>.</p>
  )
}
