// hooks/useServiceRequests.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
  description?: string;
  image?: string;
}

interface ServiceRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsApp?: string;
  addressRequestingService: string;
  selectedServices: Service[];
  totalCost: number;
  status: "open" | "in_progress" | "completed";
  acceptedBy: string[];
  eventDate?: string;
  createdAt: string;
  updatedAt: string;
  isAllowedToAccept?: boolean;
  acceptedByCount?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface KeyBundle {
  _id: string;
  bundleName: string;
  keysRemaining: number;
  purchaseDate: Date;
}

interface UseServiceRequestsReturn {
  requests: ServiceRequest[];
  isLoading: boolean;
  isAccepting: string | null;
  pagination: Pagination;
  statusCounts: {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
    acceptedByMe: number;
    acceptedByMeOpen: number;
    acceptedByMeInProgress: number;
    acceptedByMeCompleted: number;
  };
  fetchServiceRequests: () => Promise<void>;
  acceptRequest: (requestId: string, bundleId: string) => Promise<void>;
  fetchKeyBundles: () => Promise<KeyBundle[]>;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  handlePageChange: (page: number) => void;
  hasUserAccepted: (request: ServiceRequest) => boolean;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const useServiceRequests = (): UseServiceRequestsReturn => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [keyBundles, setKeyBundles] = useState<KeyBundle[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchServiceRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter === "all" ? "" : statusFilter,
        filter: statusFilter === "accepted" ? "accepted_by_me" : "all",
        search: searchTerm,
      });

      const response = await fetch(`/api/services/requests?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRequests(data.serviceRequests);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch service requests");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to fetch requests",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, searchTerm, user]);
  const fetchKeyBundles = useCallback(async (): Promise<KeyBundle[]> => {
    try {
      const response = await fetch(
        "/api/paystack/service-providers-plans/keys/bundles"
      );
      const data = await response.json();

      if (response.ok && data.success) {
        // Filter out duplicates by transactionId
        const uniqueBundles = data.bundles.filter(
          (bundle: any, index: number, self: any[]) =>
            index ===
            self.findIndex((b) => b.transactionId === bundle.transactionId)
        );

        const bundles = uniqueBundles.map((bundle: any) => ({
          _id: bundle._id.toString(),
          bundleName: bundle.bundleName,
          keysRemaining: bundle.keysRemaining,
          purchaseDate: new Date(bundle.purchaseDate),
        }));

        setKeyBundles(bundles);
        return bundles;
      } else {
        throw new Error(data.error || "Failed to fetch key bundles");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to load key bundles",
      });
      return [];
    }
  }, []);

  const acceptRequest = useCallback(
    async (requestId: string, bundleId: string) => {
      setIsAccepting(requestId);
      const toastId = toast.loading("Accepting service request...");

      try {
        const response = await fetch("/api/services/requests/accept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            bundleId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message, { id: toastId });
          await fetchServiceRequests();
        } else {
          throw new Error(data.error || "Failed to accept request");
        }
      } catch (error) {
        toast.error("Error", {
          description:
            error instanceof Error ? error.message : "Failed to accept request",
          id: toastId,
        });
      } finally {
        setIsAccepting(null);
      }
    },
    [fetchServiceRequests]
  );

  const getStatusCounts = useCallback(() => {
    const userAcceptedRequests = requests.filter((request) =>
      request.acceptedBy.includes(user?.id || "")
    );

    return {
      total: requests.length,
      open: requests.filter((r) => r.status === "open").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      completed: requests.filter((r) => r.status === "completed").length,
      acceptedByMe: userAcceptedRequests.length,
      acceptedByMeOpen: userAcceptedRequests.filter((r) => r.status === "open")
        .length,
      acceptedByMeInProgress: userAcceptedRequests.filter(
        (r) => r.status === "in_progress"
      ).length,
      acceptedByMeCompleted: userAcceptedRequests.filter(
        (r) => r.status === "completed"
      ).length,
    };
  }, [requests, user]);

  const hasUserAccepted = useCallback(
    (request: ServiceRequest) => {
      return user?.id && request.acceptedBy.includes(user.id);
    },
    [user]
  );

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Open";
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  useEffect(() => {
    if (user) {
      fetchServiceRequests();
    }
  }, [user, fetchServiceRequests]);

  return {
    requests,
    isLoading,
    isAccepting,
    pagination,
    statusCounts: getStatusCounts(),
    fetchServiceRequests,
    acceptRequest,
    fetchKeyBundles,
    setSearchTerm,
    setStatusFilter,
    handlePageChange,
    hasUserAccepted,
    getStatusColor,
    getStatusText,
  };
};
