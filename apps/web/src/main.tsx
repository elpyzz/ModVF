import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// #region agent log
fetch('http://127.0.0.1:7330/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e8bfc'},body:JSON.stringify({sessionId:'1e8bfc',runId:'pre-fix',hypothesisId:'H4',location:'src/main.tsx:7',message:'Frontend bootstrap start',data:{hasRoot:!!document.getElementById('root')},timestamp:Date.now()})}).catch(()=>{});
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// #region agent log
fetch('http://127.0.0.1:7330/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e8bfc'},body:JSON.stringify({sessionId:'1e8bfc',runId:'pre-fix',hypothesisId:'H5',location:'src/main.tsx:17',message:'Frontend render scheduled',data:{router:'BrowserRouter'},timestamp:Date.now()})}).catch(()=>{});
// #endregion
