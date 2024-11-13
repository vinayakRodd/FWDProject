

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import DashBoard from './Components/DashBoard';
import Documents from './Components/Documents';
import Images from './Components/Images';
import Videos from './Components/Videos';
import Others from './Components/Others';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Protect the dashboard route */}
          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute>
                <DashBoard />
              // </ProtectedRoute>
            }
          />

          <Route path="/documents" element={<Documents />} />
          <Route path="/images" element={<Images />} />
          <Route path="/others" element={<Others />} />
          <Route path="/videos" element={<Videos />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
