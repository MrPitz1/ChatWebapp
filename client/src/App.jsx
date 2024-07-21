// App.js
import React from 'react'; 
import Index from './pages/Index';
import AllChat from './pages/AllChat';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import MainLayout from './components/Layout';
function App() {
  return (
    <MainLayout>
      <Router>
          <Routes>
            <Route index element={<Index/>} />
            <Route path='/all-chat' element={<AllChat/>} />
            
          </Routes>
      </Router>
    </MainLayout>
  );
}

export default App;