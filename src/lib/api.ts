const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = {
  token?: string;
  method?: string;
  body?: unknown;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, method = "GET", body } = options;

  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        const { signOut } = await import("next-auth/react");
        sessionStorage.setItem("login_error", "Sesi Anda telah berakhir. Silakan login kembali.");
        signOut({ redirect: true, callbackUrl: "/login" });
      }
    }
    throw new Error(json.message || "Terjadi kesalahan");
  }

  return json;
}

// Auth
export const api = {
  auth: {
    register: (data: {
      name: string;
      email: string;
      phone?: string;
      gender: string;
      password: string;
      confirm_password: string;
    }) => request("/v1/auth/register", { method: "POST", body: data }),

    login: (data: { email: string; password: string }) =>
      request("/v1/auth/login", { method: "POST", body: data }),

    logout: (refreshToken: string) =>
      request("/v1/auth/logout", {
        method: "POST",
        body: { refresh_token: refreshToken },
      }),

    refresh: (refreshToken: string) =>
      request("/v1/auth/refresh", {
        method: "POST",
        body: { refresh_token: refreshToken },
      }),

    forgotPassword: (data: { email: string }) =>
      request("/v1/auth/forgot-password", { method: "POST", body: data }),

    resetPassword: (data: {
      token: string;
      password: string;
      confirm_password: string;
    }) => request("/v1/auth/reset-password", { method: "POST", body: data }),
  },

  user: {
    me: (token: string) => request("/v1/user/me", { token }),

    update: (
      token: string,
      data: { name?: string; image?: string; gender?: string; phone?: string },
    ) => request("/v1/user/update", { token, method: "POST", body: data }),

    uploadAvatar: (token: string, file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      return request("/v1/user/upload-avatar", {
        token,
        method: "POST",
        body: form,
      });
    },

    changePassword: (
      token: string,
      data: { old_password?: string; new_password?: string },
    ) =>
      request("/v1/user/change-password", {
        token,
        method: "POST",
        body: data,
      }),
  },

  apps: {
    list: (token: string) => request("/v1/apps", { token }),

    get: (token: string, id: string) => request(`/v1/apps/${id}`, { token }),

    create: (
      token: string,
      data: {
        name: string;
        description?: string;
        redirect_uris: string[];
        logo_url?: string;
      },
    ) => request("/v1/apps", { token, method: "POST", body: data }),

    update: (token: string, id: string, data: object) =>
      request(`/v1/apps/${id}`, { token, method: "PUT", body: data }),

    delete: (token: string, id: string) =>
      request(`/v1/apps/${id}`, { token, method: "DELETE" }),

    regenerateSecret: (token: string, id: string) =>
      request(`/v1/apps/${id}/regenerate`, { token, method: "POST" }),

    toggleActive: (token: string, id: string) =>
      request(`/v1/apps/${id}/toggle-active`, { token, method: "PUT" }),

    getAccessList: (token: string, id: string) =>
      request(`/v1/apps/${id}/access`, { token }),

    searchUserAccess: (token: string, id: string, query: string) =>
      request(`/v1/apps/${id}/access/search?query=${encodeURIComponent(query)}`, { token }),

    updateAccessList: (token: string, id: string, userIds: string[]) =>
      request(`/v1/apps/${id}/access`, {
        token,
        method: "POST",
        body: { user_ids: userIds },
      }),
  },

  admin: {
    apps: {
      list: (token: string, params?: { page?: number; status?: string }) => {
        const q = new URLSearchParams(
          params as Record<string, string>,
        ).toString();
        return request(`/v1/admin/apps${q ? `?${q}` : ""}`, { token });
      },
      pending: (token: string) => request("/v1/admin/apps/pending", { token }),
      get: (token: string, id: string) =>
        request(`/v1/admin/apps/${id}`, { token }),
      update: (token: string, id: string, data: object) =>
        request(`/v1/admin/apps/${id}`, { token, method: "PUT", body: data }),
      toggleActive: (token: string, id: string) =>
        request(`/v1/admin/apps/${id}/toggle-active`, { token, method: "PUT" }),
      approve: (token: string, id: string) =>
        request(`/v1/admin/apps/${id}/approve`, { token, method: "POST" }),
      reject: (token: string, id: string) =>
        request(`/v1/admin/apps/${id}/reject`, { token, method: "POST" }),
    },
    users: {
      list: (token: string, params?: { page?: number }) => {
        const q = new URLSearchParams(
          params as Record<string, string>,
        ).toString();
        return request(`/v1/admin/users${q ? `?${q}` : ""}`, { token });
      },
      get: (token: string, id: string) => request(`/v1/admin/users/${id}`, { token }),
      updateRole: (token: string, id: string, role: string) =>
        request(`/v1/admin/users/${id}/role`, {
          token,
          method: "PUT",
          body: { role },
        }),
      deactivate: (token: string, id: string) =>
        request(`/v1/admin/users/${id}/deactivate`, { token, method: "PUT" }),
      activate: (token: string, id: string) =>
        request(`/v1/admin/users/${id}/activate`, { token, method: "PUT" }),
      verifyEmail: (token: string, id: string) =>
        request(`/v1/admin/users/${id}/verify-email`, { token, method: "PUT" }),
      delete: (token: string, id: string) =>
        request(`/v1/admin/users/${id}`, { token, method: "DELETE" }),
    },
  },

  oauth: {
    authorize: (params: {
      client_id: string;
      redirect_uri: string;
      scope: string;
      state: string;
    }) => {
      const q = new URLSearchParams({
        ...params,
        response_type: "code",
      }).toString();
      return request(`/oauth/authorize?${q}`);
    },
    confirm: (token: string, data: object) =>
      request("/oauth/authorize/confirm", {
        token,
        method: "POST",
        body: data,
      }),
  },
};
