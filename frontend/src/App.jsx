import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import ScrollRestoration from './components/ScrollRestoration';
import GlobalLoader from './components/GlobalLoader';

// ─── Lazy-loaded pages (code-split) ───
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Communities = lazy(() => import('./pages/Communities'));
const CommunityDetails = lazy(() => import('./pages/CommunityDetails'));
const CommunityChat = lazy(() => import('./pages/CommunityChat'));
const CommunityDashboard = lazy(() => import('./pages/CommunityDashboard'));
const CommunityMembers = lazy(() => import('./pages/CommunityMembers'));
const CreateCommunity = lazy(() => import('./pages/CreateCommunity'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const Resources = lazy(() => import('./pages/Resources'));
const ResourceDetails = lazy(() => import('./pages/ResourceDetails'));
const CreateResource = lazy(() => import('./pages/CreateResource'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const CommunityMap = lazy(() => import('./pages/CommunityMap'));
const Newsletter = lazy(() => import('./pages/Newsletter'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Help = lazy(() => import('./pages/Help'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const Feed = lazy(() => import('./pages/Feed'));
const UserPublicProfile = lazy(() => import('./pages/UserPublicProfile'));
const MyNetwork = lazy(() => import('./pages/MyNetwork'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

/* ─── Premium 404 Page ─── */
function NotFoundPage() {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '70vh', textAlign: 'center',
            padding: '2rem', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background gradient orbs */}
            <div style={{
                position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                top: '10%', left: '20%', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
                bottom: '20%', right: '15%', pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                    fontSize: '8rem', fontWeight: '900', lineHeight: 1,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem', animation: 'fadeIn 0.6s ease-out'
                }}>
                    404
                </div>
                <h2 style={{
                    fontSize: '1.5rem', fontWeight: '700', color: '#1f2937',
                    marginBottom: '0.75rem', animation: 'fadeIn 0.6s ease-out 0.15s both'
                }}>
                    Oops! Page Not Found
                </h2>
                <p style={{
                    fontSize: '1.05rem', color: '#6b7280', marginBottom: '2rem',
                    maxWidth: '400px', lineHeight: 1.6,
                    animation: 'fadeIn 0.6s ease-out 0.3s both'
                }}>
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>
                <div style={{
                    display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap',
                    animation: 'fadeIn 0.6s ease-out 0.45s both'
                }}>
                    <Link to="/" style={{
                        background: 'linear-gradient(135deg, #4338ca, #6366f1)', color: '#fff',
                        padding: '0.8rem 2rem', borderRadius: '12px', textDecoration: 'none',
                        fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)'; }}
                    >
                        <i className="fas fa-home" style={{ fontSize: '0.9rem' }}></i> Go Home
                    </Link>
                    <Link to="/communities" style={{
                        background: '#eef2ff', color: '#4338ca',
                        padding: '0.8rem 2rem', borderRadius: '12px', textDecoration: 'none',
                        fontWeight: '600', transition: 'background 0.2s ease'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
                        onMouseLeave={e => e.currentTarget.style.background = '#eef2ff'}
                    >
                        Explore Communities
                    </Link>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <ScrollRestoration />
                    <GlobalLoader />
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Navbar />
                        <main style={{ flex: 1 }}>
                            <Suspense fallback={<LoadingSpinner />}>
                                <Routes>
                                    {/* Public */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/verify-email" element={<VerifyEmail />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                                    <Route path="/communities" element={<Communities />} />
                                    <Route path="/communities/:id" element={<CommunityDetails />} />
                                    <Route path="/projects" element={<Projects />} />
                                    <Route path="/projects/:id" element={<ProjectDetails />} />
                                    <Route path="/resources" element={<Resources />} />
                                    <Route path="/resources/:id" element={<ResourceDetails />} />
                                    <Route path="/map" element={<CommunityMap />} />
                                    <Route path="/newsletter" element={<Newsletter />} />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/faq" element={<FAQ />} />
                                    <Route path="/help" element={<Help />} />
                                    <Route path="/guidelines" element={<Guidelines />} />
                                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                    <Route path="/terms-of-service" element={<TermsOfService />} />

                                    {/* Protected */}
                                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                                    <Route path="/create-community" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
                                    <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
                                    <Route path="/create-resource" element={<ProtectedRoute><CreateResource /></ProtectedRoute>} />
                                    <Route path="/communities/:id/chat" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />
                                    <Route path="/communities/:id/dashboard" element={<ProtectedRoute><CommunityDashboard /></ProtectedRoute>} />
                                    <Route path="/communities/:id/members" element={<ProtectedRoute><CommunityMembers /></ProtectedRoute>} />
                                    <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                                    <Route path="/network" element={<ProtectedRoute><MyNetwork /></ProtectedRoute>} />
                                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                                    <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                                    <Route path="/users/:id" element={<UserPublicProfile />} />

                                    {/* 404 */}
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                        <ScrollToTop />
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
