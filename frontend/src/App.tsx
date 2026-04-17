import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import { useEffect } from "react";
import { apiService } from "@/lib/api";
import { getFullImageUrl } from "@/lib/utils";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEmissions from "./pages/admin/Emissions";
import AdminEmissionsCreate from "./pages/admin/CreateEmission";
import AdminGuide from "./pages/admin/Guide";
import AdminEmissionsEdit from "./pages/admin/EditEmission";
import AdminCategories from "./pages/admin/Categories";
import AdminMedia from "./pages/admin/Media";
import AdminSettings from "./pages/admin/Settings";
import AdminUsers from "./pages/admin/Users";
import AdminCreateUser from "./pages/admin/CreateUser";
import AdminEditUser from "./pages/admin/EditUser";
import AdminPages from "./pages/admin/Pages";
import AdminEditPage from "./pages/admin/EditPage";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminStats from "./pages/admin/Stats";
import AdminCreateAnnouncement from "./pages/admin/CreateAnnouncement";
import AdminEditAnnouncement from "./pages/admin/EditAnnouncement";
import AdminCreateTestimonial from "./pages/admin/CreateTestimonial";
import AdminEditTestimonial from "./pages/admin/EditTestimonial";
import EmissionDetail from "./pages/EmissionDetail";
import AdminTeam from "./pages/admin/Team";
import AdminCreateTeamMember from "./pages/admin/CreateTeamMember";
import AdminEditTeamMember from "./pages/admin/EditTeamMember";
import NewsTicker from "./components/NewsTicker";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/admin/login";
  const isAdminPath = location.pathname.startsWith("/admin") && !isLoginPage;

  // Redirection pour les anciens liens /sermon/:slug
  const EmissionRedirect = () => {
    const { slug } = useParams();
    return <Navigate to={`/emission/${slug}`} replace />;
  };

  return (
    <>
      <div className={!isAdminPath ? "pb-[60px] sm:pb-12" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/emission/:slug" element={<EmissionDetail />} />
          <Route path="/sermon/:slug" element={<EmissionRedirect />} />

          {/* Admin Login (public) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes (protected) */}
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          
          {/* Emissions & Testimonials (Accessible to all roles: user, team, admin) */}
          <Route path="/admin/emissions" element={<PrivateRoute><AdminEmissions /></PrivateRoute>} />
          <Route path="/admin/emissions/create" element={<PrivateRoute><AdminEmissionsCreate /></PrivateRoute>} />
          <Route path="/admin/emissions/edit/:id" element={<PrivateRoute><AdminEmissionsEdit /></PrivateRoute>} />
          <Route path="/admin/testimonials" element={<PrivateRoute><AdminTestimonials /></PrivateRoute>} />
          <Route path="/admin/testimonials/create" element={<PrivateRoute><AdminCreateTestimonial /></PrivateRoute>} />
          <Route path="/admin/testimonials/edit/:id" element={<PrivateRoute><AdminEditTestimonial /></PrivateRoute>} />
          
          {/* Content Management (Accessible to team and admin) */}
          <Route path="/admin/announcements" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminAnnouncements /></PrivateRoute>} />
          <Route path="/admin/announcements/create" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminCreateAnnouncement /></PrivateRoute>} />
          <Route path="/admin/announcements/edit/:id" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminEditAnnouncement /></PrivateRoute>} />
          <Route path="/admin/categories" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminCategories /></PrivateRoute>} />
          <Route path="/admin/media" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminMedia /></PrivateRoute>} />
          <Route path="/admin/stats" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminStats /></PrivateRoute>} />
          <Route path="/admin/team" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminTeam /></PrivateRoute>} />
          <Route path="/admin/team/create" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminCreateTeamMember /></PrivateRoute>} />
          <Route path="/admin/team/edit/:id" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminEditTeamMember /></PrivateRoute>} />
          <Route path="/admin/settings" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminSettings /></PrivateRoute>} />
          <Route path="/admin/guide" element={<PrivateRoute allowedRoles={['admin', 'team']}><AdminGuide /></PrivateRoute>} />
          
          {/* Strict Admin/Superuser Only (System Users & Pages) */}
          <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/users/create" element={<PrivateRoute allowedRoles={['admin']}><AdminCreateUser /></PrivateRoute>} />
          <Route path="/admin/users/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><AdminEditUser /></PrivateRoute>} />
          <Route path="/admin/pages" element={<PrivateRoute allowedRoles={['admin']}><AdminPages /></PrivateRoute>} />
          <Route path="/admin/pages/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><AdminEditPage /></PrivateRoute>} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAdminPath && <NewsTicker />}
    </>
  );
};

const App = () => {
  useEffect(() => {
    apiService.getSettings().then(data => {
      if (data.site_name) {
        document.title = data.site_name;
      }
      if (data.logo) {
        const fullLogoUrl = getFullImageUrl(data.logo);
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = fullLogoUrl;
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = fullLogoUrl;
          document.head.appendChild(newLink);
        }
      }
    }).catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
