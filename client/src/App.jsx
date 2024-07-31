// App.js
import React from 'react'; 
import Index from './pages/Index';
import AllChat from './pages/AllChat';
import Room from './pages/Room'
import JoinRoom from './pages/JoinRoom'
import Login from './pages/Login'
import Register from './pages/Register'
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
            <Route path='/join-room' element={<JoinRoom/>} /> 
            <Route path='/chat-room/:uuid' element={<Room/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />           
          </Routes>
      </Router>
    </MainLayout>
  );
}

export default App;