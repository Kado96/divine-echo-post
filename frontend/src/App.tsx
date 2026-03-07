import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import { useEffect } from "react";
import { apiService } from "@/lib/api";
import { getFullImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSermons from "./pages/admin/Sermons";
import AdminSermonsCreate from "./pages/admin/CreateSermon";
import AdminGuide from "./pages/admin/Guide";
import AdminSermonsEdit from "./pages/admin/EditSermon";
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
import SermonDetail from "./pages/SermonDetail";
import NewsTicker from "./components/NewsTicker";

const queryClient = new QueryClient();

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
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = fullLogoUrl;
          document.head.appendChild(newLink);
        }
      }
    }).catch(console.error);
  }, []);

  const isAdminPath = window.location.pathname.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            {!isAdminPath && <NewsTicker />}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sermon/:slug" element={<SermonDetail />} />

              {/* Admin Login (public) */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes (protected) */}
              <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/sermons" element={<PrivateRoute><AdminSermons /></PrivateRoute>} />
              <Route path="/admin/sermons/create" element={<PrivateRoute><AdminSermonsCreate /></PrivateRoute>} />
              <Route path="/admin/sermons/edit/:id" element={<PrivateRoute><AdminSermonsEdit /></PrivateRoute>} />
              <Route path="/admin/categories" element={<PrivateRoute><AdminCategories /></PrivateRoute>} />
              <Route path="/admin/media" element={<PrivateRoute><AdminMedia /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
              <Route path="/admin/users/create" element={<PrivateRoute><AdminCreateUser /></PrivateRoute>} />
              <Route path="/admin/users/edit/:id" element={<PrivateRoute><AdminEditUser /></PrivateRoute>} />
              <Route path="/admin/pages" element={<PrivateRoute><AdminPages /></PrivateRoute>} />
              <Route path="/admin/pages/edit/:id" element={<PrivateRoute><AdminEditPage /></PrivateRoute>} />
              <Route path="/admin/announcements" element={<PrivateRoute><AdminAnnouncements /></PrivateRoute>} />
              <Route path="/admin/announcements/create" element={<PrivateRoute><AdminCreateAnnouncement /></PrivateRoute>} />
              <Route path="/admin/announcements/edit/:id" element={<PrivateRoute><AdminEditAnnouncement /></PrivateRoute>} />
              <Route path="/admin/testimonials" element={<PrivateRoute><AdminTestimonials /></PrivateRoute>} />
              <Route path="/admin/testimonials/create" element={<PrivateRoute><AdminCreateTestimonial /></PrivateRoute>} />
              <Route path="/admin/testimonials/edit/:id" element={<PrivateRoute><AdminEditTestimonial /></PrivateRoute>} />
              <Route path="/admin/stats" element={<PrivateRoute><AdminStats /></PrivateRoute>} />
              <Route path="/admin/settings" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
              <Route path="/admin/guide" element={<PrivateRoute><AdminGuide /></PrivateRoute>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
