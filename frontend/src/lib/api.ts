const API_URL = import.meta.env.VITE_API_URL;

export const apiService = {
    getHeaders(contentType: string | null = 'application/json') {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
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
            // Redirect only if in browser
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
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

    // Helper for sermons
    async getSermons() {
        return this.get('/sermons/');
    },

    // Helper for categories
    async getSermonCategories() {
        return this.get('/sermons/categories/');
    },

    // Helper for settings
    async getSettings() {
        return this.get('/settings/current/');
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

    // Helper for testimonials
    async getTestimonials() {
        return this.get('/testimonials/');
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

    // Admin Sermons helpers
    async getAdminSermons() {
        return this.get('/admin/sermons/sermons/');
    },

    async deleteSermon(id: number | string) {
        try {
            const response = await fetch(`${API_URL}/admin/sermons/sermons/${id}/`, {
                method: 'DELETE',
                headers: this.getHeaders(null),
                credentials: 'include'
            });
            if (response.status === 401) return this.handleResponse(response, `sermon delete ${id}`);
            if (!response.ok) throw new Error('Delete failed');
            return true;
        } catch (error) {
            console.error("Delete error:", error);
            throw error;
        }
    },

    async getSermonById(id: string) {
        return this.get(`/admin/sermons/sermons/${id}/`);
    },

    async updateSermon(id: string, data: any) {
        const isFormData = data instanceof FormData;
        try {
            const response = await fetch(`${API_URL}/admin/sermons/sermons/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders(isFormData ? null : 'application/json'),
                body: isFormData ? data : JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response, `sermon update ${id}`);
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

    async getSermonBySlug(slug: string) {
        return this.get(`/sermons/${slug}/`);
    },

    async getAnnouncements() {
        return this.get('/announcements/');
    },

    // Admin Announcements helpers
    async getAdminAnnouncements() {
        return this.get('/announcements/admin/');
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
        return this.get('/accounts/users/');
    },

    async getUserById(id: string | number) {
        return this.get(`/accounts/users/${id}/`);
    },

    async createUser(data: any) {
        return this.post('/accounts/users/', data);
    },

    async updateUser(id: string | number, data: any) {
        try {
            const response = await fetch(`${API_URL}/accounts/users/${id}/`, {
                method: 'PATCH',
                headers: this.getHeaders('application/json'),
                body: JSON.stringify(data),
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
    }
};
