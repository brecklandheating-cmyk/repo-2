import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import CertificateRegistry from "@/components/CertificateRegistry";
import CertificateForm from "@/components/CertificateForm";
import CertificateDetail from "@/components/CertificateDetail";
import { Toaster } from "@/components/ui/toaster";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const navigate = useNavigate();
  
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
    // Redirect to certificates page by default
    navigate('/certificates');
  }, []);

  return (
    <div>
      <header className="App-header">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">CP12 Certificate System</h1>
          <p className="text-lg text-gray-600 mb-6">Gas Safety Certificate Management</p>
          <button
            onClick={() => navigate('/certificates')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            data-testid="go-to-certificates-btn"
          >
            Go to Certificates
          </button>
        </div>
      </header>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/certificates" element={<CertificateRegistry />} />
          <Route path="/certificates/new" element={<CertificateForm />} />
          <Route path="/certificates/:id" element={<CertificateDetail />} />
          <Route path="/certificates/:id/edit" element={<CertificateForm editMode={true} />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
