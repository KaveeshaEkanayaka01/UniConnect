import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50">
          <div className="max-w-3xl bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold text-red-700">An error occurred rendering the app</h2>
            <pre className="mt-4 text-sm text-slate-700 whitespace-pre-wrap">{String(this.state.error && this.state.error.toString())}</pre>
            <details className="mt-3 text-xs text-slate-500">
              <summary>Stack</summary>
              <pre className="text-xs text-slate-500">{this.state.info && this.state.info.componentStack}</pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home";
import NewsPage from "./pages/NewsPages/NewsPage";
import NewsEditor from "./pages/NewsEditor";
import AdminDashboard from "./pages/AdminDashboard";
import NewsOnlyPage from "./pages/NewsPages/NewsOnlyPage";
import ProjectFeed from "./pages/ProjectFeed";
import UploadProject from "./pages/UploadProject";
import ClubEventAnalysis from "./pages/ClubEventAnalysis";

const PublicLayout = () => (
  <>
    <Navbar />
    <div className="min-h-screen gradient-bg">
      <Outlet />
    </div>
  </>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Toaster />
        <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/News-only" element={<NewsOnlyPage />} />
          <Route path="/ProjectFeed" element={<ProjectFeed />} />
          <Route path="/analysis" element={<ClubEventAnalysis />} />
        </Route>

        <Route path="/Managenews" element={<NewsPage />} />
        <Route path="/Managenews/new" element={<NewsEditor />} />
        <Route path="/Managenews/edit/:id" element={<NewsEditor />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/UploadProject" element={<UploadProject />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
