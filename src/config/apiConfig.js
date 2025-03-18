// Base URL'i tanımla
export const API_BASE_URL = "https://d9ad-78-187-59-29.ngrok-free.app/api";

// Admin ID yönetimi için global değişken ve yönetim fonksiyonları
let currentAdminId = 4;

export const setCurrentAdminId = (adminId) => {
    currentAdminId = adminId;
};

export const getCurrentAdminId = () => {
    return currentAdminId;
};

// Endpoint'leri kategorilere ayırarak tanımla
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: `${API_BASE_URL}/Auth/login`,
        REGISTER: `${API_BASE_URL}/Auth/register`,
        FORGOT_PASSWORD: `${API_BASE_URL}/Auth/forgot-password`,
        RESET_PASSWORD: `${API_BASE_URL}/Auth/reset-password`,
        VERIFY_EMAIL: `${API_BASE_URL}/Auth/verify-email`,
        REFRESH_TOKEN: `${API_BASE_URL}/Auth/refresh-token`,
        CHANGE_PASSWORD: `${API_BASE_URL}/Auth/change-password`,
        LOGOUT: `${API_BASE_URL}/Auth/logout`,
    },

    // Admin endpoints
    ADMIN: {
        BASE: `${API_BASE_URL}/Admin`,
        GET_ALL: `${API_BASE_URL}/Admin`,
        CREATE: `${API_BASE_URL}/Admin`,
        DETAIL: (adminId = currentAdminId) => `${API_BASE_URL}/Admin/${adminId}`,
        UPDATE: (adminId = currentAdminId) => `${API_BASE_URL}/Admin/${adminId}`,
        DELETE: (adminId = currentAdminId) => `${API_BASE_URL}/Admin/${adminId}`,
        BUILDINGS: (adminId = currentAdminId) => `${API_BASE_URL}/Admin/${adminId}/buildings`,
        ASSIGN_BUILDING: (adminId, buildingId) => `${API_BASE_URL}/Admin/${adminId}/buildings/${buildingId}/assign`,
        UNASSIGN_BUILDING: (adminId, buildingId) => `${API_BASE_URL}/Admin/${adminId}/buildings/${buildingId}/unassign`,
        ACTIVITIES: (adminId) => `${API_BASE_URL}/Admin/${adminId}/activities`,
        FINANCIAL_SUMMARIES: (adminId) => `${API_BASE_URL}/Admin/${adminId}/financial-summaries`,
        PROFILE: {
            GET: (adminId) => `${API_BASE_URL}/Admin/${adminId}`,
            UPDATE: (adminId) => `${API_BASE_URL}/Admin/${adminId}/profile`,
            UPDATE_PASSWORD: (adminId) => `${API_BASE_URL}/Admin/${adminId}/password`,
            UPDATE_CONTACT: (adminId) => `${API_BASE_URL}/Admin/${adminId}/contact`
        },
        NOTIFICATIONS: `${API_BASE_URL}/Admin/notifications`,
        MEETINGS: {
            BASE: `${API_BASE_URL}/Meeting`,
            GET_ALL: `${API_BASE_URL}/Meeting`,
            CREATE: `${API_BASE_URL}/Meeting`,
            DETAIL: (id) => `${API_BASE_URL}/Meeting/${id}`,
            BY_BUILDING: (buildingId) => `${API_BASE_URL}/Meeting/building/${buildingId}`,
            UPCOMING: (buildingId) => `${API_BASE_URL}/Meeting/building/${buildingId}/upcoming`,
            CANCEL: (id) => `${API_BASE_URL}/Meeting/${id}/cancel`,
            UPDATE: (id) => `${API_BASE_URL}/Meeting/${id}`,
            DELETE: (id) => `${API_BASE_URL}/Meeting/${id}`,
            GET_ATTENDANCE: (id) => `${API_BASE_URL}/Meeting/${id}/attendance`,
            UPDATE_ATTENDANCE: (id) => `${API_BASE_URL}/Meeting/${id}/attendance`,
            EXPORT_ATTENDANCE: (id) => `${API_BASE_URL}/Meeting/${id}/attendance/export`
        },
        ASSIGN_OWNER: (apartmentId, ownerId) => `${API_BASE_URL}/Admin/apartments/${apartmentId}/owner/${ownerId}`,
        ASSIGN_TENANT: (apartmentId, tenantId) => `${API_BASE_URL}/Admin/apartments/${apartmentId}/tenant/${tenantId}`,
        APPROVE_TENANT_REQUEST: (requestId) => `${API_BASE_URL}/Admin/tenant-requests/${requestId}/approve`,
        REJECT_TENANT_REQUEST: (requestId) => `${API_BASE_URL}/Admin/tenant-requests/${requestId}/reject`,
        REPORTS: {
            MEETINGS: (adminId) => `${API_BASE_URL}/Admin/${adminId}/reports/meetings`,
            SUMMARY: (adminId) => `${API_BASE_URL}/Reports/admin/${adminId}`
        },
        ENHANCED_DASHBOARD: (adminId) => `${API_BASE_URL}/Admin/enhanced-dashboard/${adminId}`,
        STATISTICS: (adminId) => `${API_BASE_URL}/Admin/${adminId}/statistics`,
        MANAGEMENT: {
            BY_BUILDING: (adminId, buildingId) => `${API_BASE_URL}/Admin/management/${adminId}?buildingId=${buildingId}`,
            GET_BUILDING_DATA: (adminId, buildingId) => `${API_BASE_URL}/Admin/management/${adminId}?buildingId=${buildingId}`
        },
    },

    // Building endpoints
    BUILDING: {
        BASE: `${API_BASE_URL}/Buildings`,
        DETAIL: (id) => `${API_BASE_URL}/Buildings/${id}`,
        APARTMENTS: (buildingId) => `${API_BASE_URL}/Apartment/building/${buildingId}`,
    },

    // Apartment endpoints
    APARTMENT: {
        BASE: `${API_BASE_URL}/Apartment`,
        GET_ALL: `${API_BASE_URL}/Apartment`,
        CREATE: `${API_BASE_URL}/Apartment`,
        DETAIL: (id) => `${API_BASE_URL}/Apartment/${id}`,
        GET_DETAILS: (id) => `${API_BASE_URL}/Apartment/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Apartment/building/${buildingId}`,
        UPDATE: (id) => `${API_BASE_URL}/Apartment/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Apartment/${id}`,
        ASSIGN_OWNER: (id, ownerId) => `${API_BASE_URL}/Apartment/${id}/owner/${ownerId}`,
        ASSIGN_TENANT: (id, tenantId) => `${API_BASE_URL}/Apartment/${id}/tenant/${tenantId}`
    },

    // Meeting endpoints
    MEETING: {
        BASE: `${API_BASE_URL}/Meeting`,
        GET_ALL: `${API_BASE_URL}/Meeting`,
        CREATE: `${API_BASE_URL}/Meeting`,
        DETAIL: (id) => `${API_BASE_URL}/Meeting/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Meeting/building/${buildingId}`,
        UPCOMING: (buildingId) => `${API_BASE_URL}/Meeting/building/${buildingId}/upcoming`,
        CANCEL: (id) => `${API_BASE_URL}/Meeting/${id}/cancel`,
        UPDATE: (id) => `${API_BASE_URL}/Meeting/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Meeting/${id}`,
        GET_ATTENDANCE: (id) => `${API_BASE_URL}/Meeting/${id}/attendance`,
        UPDATE_ATTENDANCE: (id) => `${API_BASE_URL}/Meeting/${id}/attendance`,
        EXPORT_ATTENDANCE: (id) => `${API_BASE_URL}/Meeting/${id}/attendance/export`
    },

    // Notification endpoints
    NOTIFICATION: {
        BASE: `${API_BASE_URL}/Notification`,
        BY_USER: (userId) => `${API_BASE_URL}/Notification/user/${userId}`,
        UNREAD: (userId) => `${API_BASE_URL}/Notification/user/${userId}/unread`,
        UNREAD_COUNT: (userId) => `${API_BASE_URL}/Notification/user/${userId}/unread/count`,
        MARK_READ: (notificationId) => `${API_BASE_URL}/Notification/${notificationId}/read`,
        READ_ALL: (userId) => `${API_BASE_URL}/Notification/user/${userId}/read-all`
    },

    // Complaint endpoints
    COMPLAINT: {
        BASE: `${API_BASE_URL}/Complaint`,
        GET_ALL: `${API_BASE_URL}/Complaint`,
        CREATE: `${API_BASE_URL}/Complaint`,
        DETAIL: (id) => `${API_BASE_URL}/Complaint/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Complaint/building/${buildingId}`,
        BY_USER: (userId) => `${API_BASE_URL}/Complaint/user/${userId}`,
        ACTIVE_COUNT: (buildingId) => `${API_BASE_URL}/Complaint/building/${buildingId}/active/count`,
        UPDATE: (id) => `${API_BASE_URL}/Complaint/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Complaint/${id}`,
        RESOLVE: (id, adminId) => `${API_BASE_URL}/Complaint/${id}/resolve/${adminId}`,
        TAKE: (id, adminId) => `${API_BASE_URL}/Complaint/${id}/take?adminId=${adminId}`,
        REJECT: (id, adminId) => `${API_BASE_URL}/Complaint/${id}/reject/${adminId}`,
        CLOSE: (id, adminId) => `${API_BASE_URL}/Complaint/${id}/close/${adminId}`,
        ADD_COMMENT: (id) => `${API_BASE_URL}/Complaint/${id}/comment`
    },

    // Survey endpoints
    SURVEY: {
        BASE: `${API_BASE_URL}/Survey`,
        GET_ALL: `${API_BASE_URL}/Survey`,
        CREATE: `${API_BASE_URL}/Survey`,
        DETAIL: (id) => `${API_BASE_URL}/Survey/${id}`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Survey/building/${buildingId}`,
        UPDATE: (id) => `${API_BASE_URL}/Survey/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Survey/${id}`,
        GET_RESULTS: (id) => `${API_BASE_URL}/Survey/${id}/results`,
        SUBMIT_RESPONSE: (id) => `${API_BASE_URL}/Survey/${id}/respond`,
        CLOSE: (id) => `${API_BASE_URL}/Survey/${id}/close`
    },

    // Tenant endpoints
    TENANT: {
        GET_DETAILS: (id) => `${API_BASE_URL}/Tenant/${id}`,
    },

    // Owner endpoints
    OWNER: {
        GET_DETAILS: (id) => `${API_BASE_URL}/Owner/${id}`,
    },

    // Finance endpoints
    FINANCE: {
        DASHBOARD: `${API_BASE_URL}/Finance/dashboard`,
        BY_BUILDING: (buildingId) => `${API_BASE_URL}/Finance/building/${buildingId}`,
        PAYMENTS: {
            GET_ALL: `${API_BASE_URL}/Finance/payments`,
            CREATE: `${API_BASE_URL}/Finance/payments`,
            DETAIL: (id) => `${API_BASE_URL}/Finance/payments/${id}`,
            UPDATE: (id) => `${API_BASE_URL}/Finance/payments/${id}`,
            DELETE: (id) => `${API_BASE_URL}/Finance/payments/${id}`,
            BY_APARTMENT: (apartmentId) => `${API_BASE_URL}/Finance/payments/apartment/${apartmentId}`,
            BY_BUILDING: (buildingId) => `${API_BASE_URL}/Finance/payments/building/${buildingId}`,
            OVERDUE: `${API_BASE_URL}/Finance/payments/overdue`,
            STATISTICS: `${API_BASE_URL}/Finance/payments/statistics`
        }
    },

    // User Profile endpoints
    USER_PROFILE: {
        DETAIL: (userId) => `${API_BASE_URL}/UserProfile/${userId}`,
        UPDATE: (userId) => `${API_BASE_URL}/UserProfile/${userId}`,
        UPDATE_IMAGE: (userId) => `${API_BASE_URL}/UserProfile/${userId}/profile-image`,
        DELETE_IMAGE: (userId) => `${API_BASE_URL}/UserProfile/${userId}/profile-image`,
        UPDATE_DESCRIPTION: (userId) => `${API_BASE_URL}/UserProfile/${userId}/description`,
        UPDATE_DISPLAY_NAME: (userId) => `${API_BASE_URL}/UserProfile/${userId}/display-name`
    }
};

// API_ENDPOINTS tanımlandıktan sonra
console.log('\n=== API Endpoints Yapılandırması ===');
console.log('ADMIN.REPORTS:', API_ENDPOINTS.ADMIN.REPORTS);

// Axios config
export const axiosConfig = {
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Auth token yönetimi için helper fonksiyonlar
export const setAuthToken = (token) => {
    if (token) {
        axiosConfig.headers['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosConfig.headers['Authorization'];
    }
};

// Error handling için helper fonksiyonlar
export const handleApiError = (error) => {
    if (error.response) {
        // Sunucudan gelen hata yanıtı
        console.error('API Error Response:', error.response.data);
        console.error('API Error Status:', error.response.status);
        return {
            status: error.response.status,
            message: error.response.data.message || 'Bir hata oluştu',
            data: error.response.data
        };
    } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error('API Request Error:', error.request);
        return {
            status: 0,
            message: 'Sunucuya ulaşılamıyor',
            data: null
        };
    } else {
        // İstek oluşturulurken hata oluştu
        console.error('API Error:', error.message);
        return {
            status: 0,
            message: 'İstek oluşturulamadı',
            data: null
        };
    }
};

// Helper fonksiyonlar
export const getProfileResponseFormat = (data) => ({
    data: {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
        isActive: data.isActive,
        details: {
            // Owner details
            iban: data.role === 'owner' ? data.details?.iban : undefined,
            bankName: data.role === 'owner' ? data.details?.bankName : undefined,
            
            // Tenant details
            apartmentId: data.role === 'tenant' ? data.details?.apartmentId : undefined,
            leaseStartDate: data.role === 'tenant' ? data.details?.leaseStartDate : undefined,
            leaseEndDate: data.role === 'tenant' ? data.details?.leaseEndDate : undefined,
            monthlyRent: data.role === 'tenant' ? data.details?.monthlyRent : undefined,
            
            // Security details
            buildingId: data.role === 'security' ? data.details?.buildingId : undefined,
            shiftHours: data.role === 'security' ? data.details?.shiftHours : undefined
        },
        profileImageUrl: data.profileImageUrl,
        description: data.description,
        profileUpdatedAt: data.profileUpdatedAt
    },
    success: true,
    message: "İşlem başarılı"
});

export default {
    API_BASE_URL,
    API_ENDPOINTS,
    axiosConfig,
    setAuthToken,
    handleApiError,
    setCurrentAdminId,
    getCurrentAdminId
}; 