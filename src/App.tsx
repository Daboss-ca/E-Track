import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UpdatePassword from './pages/UpdatePassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;