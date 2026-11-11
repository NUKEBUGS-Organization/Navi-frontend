import { api } from "./client";
import type {
  DiagnosticsSummary,
  ErrorGroup,
  ErrorGroupDetail,
  ErrorGroupPage,
  ErrorGroupStatus,
  ListGroupsParams,
} from "@/types/diagnostics";

export const diagnosticsApi = {
  getSummary: () => api.get<DiagnosticsSummary>("/diagnostics/summary"),

  listGroups: (params: ListGroupsParams = {}) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      qs.set(key, String(value));
    }
    const query = qs.toString();
    return api.get<ErrorGroupPage>(`/diagnostics/groups${query ? `?${query}` : ""}`);
  },

  getGroup: (id: string) =>
    api.get<ErrorGroupDetail>(`/diagnostics/groups/${encodeURIComponent(id)}`),

  setStatus: (id: string, status: ErrorGroupStatus) =>
    api.patch<ErrorGroup>(`/diagnostics/groups/${encodeURIComponent(id)}`, { status }),
};
