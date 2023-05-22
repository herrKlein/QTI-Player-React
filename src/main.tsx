import React from 'react'
import ReactDOM from 'react-dom/client'
import {Player} from './Player.tsx'

import './style.css'

import '@citolab/qti-components';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Player server="/" pkg='assets' />
  </React.StrictMode>,
)
