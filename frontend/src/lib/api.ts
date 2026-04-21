import i18n from '@/i18n';

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export const apiService = {
    getHeaders(contentType: string | null = 'application/json') {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        
        // Add current language to headers
        headers['Accept-Language'] = i18n.language || 'fr';

        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    async handleResponse(response: Response, endpoint: string) {
        if (response.status === 401) {
            console.error(`Unauthorized access on ${endpoint}. Clearing session.`);
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            
            // On ne redirige vers le login que si on est déjà sur l'admin ou si la requête visait l'admin
            if (typeof window !== 'undefined') {
                const isLoginPage = window.location.pathname.includes('/admin/login');
                const isAdminPath = window.location.pathname.startsWith('/admin') || endpoint.includes('admin');
                
                if (isAdminPath && !isLoginPage) {
                    window.location.href = '/admin/login';
                } else if (!isLoginPage) {
                    // Pour le site public, on se contente de logguer sans bloquer l'exécution
                    console.warn(`[API] 401 détecté sur une route publique (${endpoint}). L'accès anonyme sera utilisé.`);
                    
                    // Retourner une structure vide par défaut pour éviter les plantages (Cannot read properties of null)
                    if (endpoint.includes('?') || endpoint.endsWith('/')) {
                        return { results: [], count: 0, next: null, previous: null };
                    }
                    return {};
                }
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            let errorMsg = `API Error: ${response.statusText}`;
            let errData = null;
            try {
                errData = await response.json();
                console.error(`Backend error details on ${endpoint}:`, errData);

                const firstError = Object.values(errData)[0];
                if (Array.isArray(firstError)) {
                    errorMsg = firstError[0];
                } else if (errData.detail) {
                    errorMsg = errData.detail;
                } else if (typeof firstError === 'string') {
                    errorMsg = firstError;
                }
            } catch (e) {
                // Not JSON or empty body
            }
            throw new ApiError(errorMsg, response.status, errData);
        }
        return await response.json();
    },

    /**
     * 🔥 "L'arme secrète Globale": Extrait le tableau de données, 
     * que ce soit une liste directe ou un format paginé (results).
     */
    handleList(data: any) {
        return (Array.isArray(data) ? (data as any) : data?.results) ?? null;
    },

    async get(endpoint: string) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            return await this.handleResponse(response, endpoint);
        } catch (error) {
            console.error(`Fetch error on ${endpoint}:`, error);
            throw error;
        }
    },

    async delete(endpoint: string) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            if (response.status === 204) return true;
            if (response.status === 401) return this.handleResponse(response, endpoint);
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (error) {
            console.error(`Delete error on ${endpoint}:`, error);
            throw error;
        }
    },

    // Helper for emissions
    async getEmissions(params = '') {
        const query = params ? (params.startsWith('?') ? params : `?${params}`) : '';
        const data = await this.get(`/sermons/${query}${query ? '&' : '?'}t=${Date.now()}`);
        return this.handleList(data);
    },

    // Helper for categories
    async getEmissionCategories() {
        // Use a cache-busting timestamp to ensure we get fresh categories on mobile
        const data = await this.get(`/sermons/categories/?t=${Date.now()}`);
        return this.handleList(data);
    },

    async createEmissionCategory(data: any) {
        return this.post('/admin/sermons/categories/', data);
    },

    async updateEmissionCategory(idOrSlug: string | number, data: any) {
        try {
            const response = await fetch(`${API_URL}/admin/sermons/categories/${idOrSlug}/`, {
                method: 'PATCH',
                headers: this.getHeaders('application/json'),
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, `category update ${idOrSlug}`);
        } catch (error) {
            console.error("Category update error:", error);
            throw error;
        }
    },
    
    async deleteEmissionCategory(idOrSlug: string | number) {
        try {
            const response = await fetch(`${API_URL}/admin/sermons/categories/${idOrSlug}/`, {
                method: 'DELETE',
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            if (response.status === 401) return this.handleResponse(response, `category delete ${idOrSlug}`);
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (error) {
            console.error("Category delete error:", error);
            throw error;
        }
    },

    // Helper for settings
    async getSettings() {
        return this.get(`/settings/current/?t=${Date.now()}`);
    },

    async updateSettings(data: any) {
        const isFormData = data instanceof FormData;

        let body;
        if (isFormData) {
            body = data;
        } else {
            // Filter out read-only or problematic fields for JSON
            const {
                id,
                created_at,
                updated_at,
                logo,
                logo_url_display,
                ...updateData
            } = data;
            body = JSON.stringify(updateData);
        }

        try {
            const response = await fetch(`${API_URL}/settings/1/`, {
                method: 'PATCH',
                headers: this.getHeaders(isFormData ? null : 'application/json'),
                body: body,
                credentials: 'include'
            });
            return await this.handleResponse(response, 'settings update');
        } catch (error) {
            console.error("Settings update error:", error);
            throw error;
        }
    },

    // Helper for team
    async getTeamMembers() {
        const data = await this.get('/settings/team/');
        return this.handleList(data);
    },

    async getTeamMemberById(id: string | number) {
        return this.get(`/settings/team/${id}/`);
    },

    async createTeamMember(data: FormData) {
        return this.post('/settings/team/', data);
    },

    async updateTeamMember(id: number, data: FormData) {
        try {
            const response = await fetch(`${API_URL}/settings/team/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders(null),
                body: data,
                credentials: 'include'
            });
            return await this.handleResponse(response, 'team member update');
        } catch (error) {
            console.error("Team member update error:", error);
            throw error;
        }
    },

    async deleteTeamMember(id: number) {
        return this.delete(`/settings/team/${id}/`);
    },

    // Helper for testimonials
    async getTestimonials() {
        const data = await this.get('/testimonials/');
        return this.handleList(data);
    },

    async deleteTestimonial(id: number | string) {
        try {
            const response = await fetch(`${API_URL}/testimonials/${id}/`, {
                method: 'DELETE',
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            if (response.status === 401) return this.handleResponse(response, `/testimonials/${id}/`);
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (error) {
            console.error("Delete error:", error);
            throw error;
        }
    },

    async getTestimonialById(id: string) {
        return this.get(`/testimonials/${id}/`);
    },

    async updateTestimonial(id: string, data: any) {
        try {
            const response = await fetch(`${API_URL}/testimonials/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders('application/json'),
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, `/testimonials/${id}/`);
        } catch (error) {
            console.error("Update error:", error);
            throw error;
        }
    },

    // Admin Emissions helpers
    async getAdminEmissions() {
        const data = await this.get('/admin/sermons/sermons/');
        return this.handleList(data);
    },

    async deleteEmission(id: number | string) {
        try {
            const response = await fetch(`${API_URL}/admin/sermons/sermons/${id}/`, {
                method: 'DELETE',
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            if (response.status === 401) return this.handleResponse(response, `emission delete ${id}`);
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (error) {
            console.error("Delete error:", error);
            throw error;
        }
    },

    async getEmissionById(id: string) {
        return this.get(`/admin/sermons/sermons/${id}/`);
    },

    async updateEmission(id: string, data: any) {
        const isFormData = data instanceof FormData;
        try {
            const response = await fetch(`${API_URL}/admin/sermons/sermons/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders(isFormData ? null : 'application/json'),
                body: isFormData ? data : JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, `emission update ${id}`);
        } catch (error) {
            console.error("Update error:", error);
            throw error;
        }
    },

    async post(endpoint: string, data: any) {
        const isFormData = data instanceof FormData;
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(isFormData ? null : 'application/json'),
                body: isFormData ? data : JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, endpoint);
        } catch (error) {
            console.error(`Post error on ${endpoint}:`, error);
            throw error;
        }
    },

    async getEmissionBySlug(slug: string) {
        return this.get(`/sermons/${slug}/`);
    },

    async getAnnouncements() {
        const data = await this.get('/announcements/');
        return this.handleList(data);
    },

    // Admin Announcements helpers
    async getAdminAnnouncements() {
        const data = await this.get('/announcements/admin/');
        return this.handleList(data);
    },

    async getAnnouncementById(id: string | number) {
        return this.get(`/announcements/admin/${id}/`);
    },

    async updateAnnouncement(id: string | number, data: any) {
        try {
            const response = await fetch(`${API_URL}/announcements/admin/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders('application/json'),
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, `/announcements/admin/${id}/`);
        } catch (error) {
            console.error("Announcement update error:", error);
            throw error;
        }
    },

    async deleteAnnouncement(id: string | number) {
        try {
            const response = await fetch(`${API_URL}/announcements/admin/${id}/`, {
                method: 'DELETE',
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            if (response.status === 401) return this.handleResponse(response, `announcement delete ${id}`);
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (error) {
            console.error("Announcement delete error:", error);
            throw error;
        }
    },

    // User management helpers
    async getUsers() {
        const data = await this.get('/accounts/users/');
        return this.handleList(data);
    },

    async getUserById(id: string | number) {
        return this.get(`/accounts/users/${id}/`);
    },

    async createUser(data: any) {
        return this.post('/accounts/users/', data);
    },

    async updateUser(id: string | number, data: any) {
        const isFormData = data instanceof FormData;
        try {
            const response = await fetch(`${API_URL}/accounts/users/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders(isFormData ? null : 'application/json'),
                body: isFormData ? data : JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, `/accounts/users/${id}/`);
        } catch (error) {
            console.error("User update error:", error);
            throw error;
        }
    },

    async deleteUser(id: string | number) {
        try {
            const response = await fetch(`${API_URL}/accounts/users/${id}/`, {
                method: 'DELETE',
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            if (response.status === 401) return this.handleResponse(response, `user delete ${id}`);
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (error) {
            console.error("User delete error:", error);
            throw error;
        }
    },

    async sendContactMessage(data: any) {
        return this.post('/contacts/contacts/', data);
    },

    // Global Stats helper
    async getGlobalStats() {
        return this.get('/admin/sermons/sermons/global_stats/');
    },

    // Media helpers
    async getMediaFiles(params = '') {
        const data = await this.get(`/admin/media/${params}`);
        return this.handleList(data);
    },

    async uploadMediaFile(data: FormData) {
        return this.post('/admin/media/', data);
    },

    async deleteMediaFile(id: number | string) {
        return this.delete(`/admin/media/${id}/`);
    },

    // Sermon Comments helpers
    async getSermonComments(sermonId: number | string) {
        const data = await this.get(`/sermons/comments/?sermon=${sermonId}`);
        return this.handleList(data);
    },

    async postSermonComment(data: any) {
        return this.post('/sermons/comments/', data);
    },

    async getAdminComments() {
        const data = await this.get('/admin/sermons/comments/');
        return this.handleList(data);
    },

    async updateCommentStatus(id: number | string, data: any) {
        try {
            const response = await fetch(`${API_URL}/admin/sermons/comments/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders('application/json'),
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, `comment update ${id}`);
        } catch (error) {
            console.error("Comment update error:", error);
            throw error;
        }
    },

    async deleteComment(id: number | string) {
        return this.delete(`/admin/sermons/comments/${id}/`);
    }
};
