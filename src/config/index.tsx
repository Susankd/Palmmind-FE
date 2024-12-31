export const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1'
export const socketUrl = import.meta.env.VITE_API_SOCKET_URL || 'http://localhost:4100'
export const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
});