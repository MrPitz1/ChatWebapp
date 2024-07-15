// App.js
import React from 'react'; 
import Index from './pages/Index'; 
import Chat from './pages/Chat'; 

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import MainLayout from './components/layout';
function App() {
  return (
    <MainLayout>
      <Router>
          <Routes>
            <Route index element={<Index/>} />
            <Route path="/chat" element={<Chat/>} />
          </Routes>
      </Router>
    </MainLayout>
  );
}

export default App;
