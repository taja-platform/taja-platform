import { useState } from 'react'
import './App.css'
import { Toaster } from 'sonner';
import Login from './page/Login';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Toaster position="top-right" richColors />
      <Login />
    </>
  )
}

export default App