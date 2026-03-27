import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, ReportStatus, Urgency } from "../backend";
import type { Report } from "../backend.d.ts";
import {
  StatusBadge,
  UrgencyBadge,
  formatDate,
} from "../components/ReportCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignAdminRole,
  useGetAllReports,
  useGetStats,
  useIsAdmin,
  useUpdateReportStatus,
} from "../hooks/useQueries";
import { getCategoryIcon } from "../utils/imageClassifier";

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: reports, isLoading: reportsLoading } = useGetAllReports();
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { mutateAsync: updateStatus, isPending: updating } =
    useUpdateReportStatus();
  const { mutateAsync: assignAdmin, isPending: assigningAdmin } =
    useAssignAdminRole();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<
    "all" | "urgent" | "standard"
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");

  const handleBecomeAdmin = async () => {
    if (!identity) return;
    try {
      await assignAdmin(identity.getPrincipal());
      toast.success("You are now an admin!");
    } catch {
      toast.error("Failed to assign admin role.");
    }
  };

  const handleUpdateStatus = async (
    reportId: bigint,
    newStatus: ReportStatus,
  ) => {
    try {
      await updateStatus({ reportId, newStatus });
      toast.success("Status updated successfully.");
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-ocid="admin.section"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground">
            Please sign in with an admin account to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-ocid="admin.section"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Use the button below for demo
            purposes.
          </p>
          <Button
            onClick={handleBecomeAdmin}
            disabled={assigningAdmin}
            variant="outline"
            className="rounded-full text-xs border-dashed"
            data-ocid="admin.primary_button"
          >
            {assigningAdmin ? (
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : null}
            🔧 Become Admin (Demo)
          </Button>
        </div>
      </div>
    );
  }

  const filtered = (reports ?? []).filter((r) => {
    const urgencyMatch = urgencyFilter === "all" || r.urgency === urgencyFilter;
    const statusMatch = statusFilter === "all" || r.status === statusFilter;
    return urgencyMatch && statusMatch;
  });

  return (
    <div className="section-alt min-h-screen py-12" data-ocid="admin.section">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage and resolve civic reports.
            </p>
          </div>
          <Button
            onClick={handleBecomeAdmin}
            disabled={assigningAdmin}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground opacity-40 hover:opacity-80"
            data-ocid="admin.secondary_button"
          >
            🔧 Refresh Admin
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total",
              value: statsLoading ? "—" : String(stats?.totalReports ?? 0),
              icon: <BarChart3 className="w-5 h-5" />,
              color: "text-primary",
            },
            {
              label: "Urgent",
              value: statsLoading ? "—" : String(stats?.urgentReports ?? 0),
              icon: <AlertTriangle className="w-5 h-5" />,
              color: "text-destructive",
            },
            {
              label: "Resolved",
              value: statsLoading ? "—" : String(stats?.resolvedReports ?? 0),
              icon: <CheckCircle className="w-5 h-5" />,
              color: "text-green-600",
            },
            {
              label: "Pending",
              value: reportsLoading
                ? "—"
                : String(
                    (reports ?? []).filter(
                      (r) => r.status !== ReportStatus.resolved,
                    ).length,
                  ),
              icon: <Clock className="w-5 h-5" />,
              color: "text-amber-600",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl p-4 border border-border shadow-card"
              data-ocid={`admin.item.${i + 1}`}
            >
              <div className={`flex items-center gap-2 mb-1 ${stat.color}`}>
                {stat.icon}
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className={`text-3xl font-bold font-display ${stat.color}`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Tabs
            value={urgencyFilter}
            onValueChange={(v) => setUrgencyFilter(v as any)}
          >
            <TabsList data-ocid="admin.tab">
              <TabsTrigger value="all">All Urgency</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
          >
            <TabsList data-ocid="admin.tab">
              <TabsTrigger value="all">All Status</TabsTrigger>
              <TabsTrigger value={ReportStatus.reported}>Reported</TabsTrigger>
              <TabsTrigger value={ReportStatus.inProgress}>
                In Progress
              </TabsTrigger>
              <TabsTrigger value={ReportStatus.resolved}>Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          {reportsLoading ? (
            <div className="p-6 space-y-3" data-ocid="admin.loading_state">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" data-ocid="admin.empty_state">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">
                No reports match the current filters.
              </p>
            </div>
          ) : (
            <Table data-ocid="admin.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report, i) => (
                  <TableRow
                    key={String(report.id)}
                    data-ocid={`admin.row.${i + 1}`}
                  >
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium text-sm line-clamp-1">
                          {report.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {report.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-lg">
                        {getCategoryIcon(report.category)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <UrgencyBadge urgency={report.urgency} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedReport(report)}
                          className="h-8 w-8 p-0"
                          data-ocid={`admin.edit_button.${i + 1}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select
                          value={report.status}
                          onValueChange={(v) =>
                            handleUpdateStatus(report.id, v as ReportStatus)
                          }
                          disabled={updating}
                        >
                          <SelectTrigger
                            className="h-8 w-32 text-xs"
                            data-ocid={`admin.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ReportStatus.reported}>
                              Reported
                            </SelectItem>
                            <SelectItem value={ReportStatus.inProgress}>
                              In Progress
                            </SelectItem>
                            <SelectItem value={ReportStatus.resolved}>
                              Resolved
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="max-w-lg" data-ocid="admin.dialog">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {selectedReport.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <span>{getCategoryIcon(selectedReport.category)}</span>
                  {selectedReport.classificationLabel}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedReport.image?.getDirectURL?.() && (
                  <img
                    src={selectedReport.image.getDirectURL()}
                    alt={selectedReport.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                <div className="flex gap-2">
                  <UrgencyBadge urgency={selectedReport.urgency} />
                  <StatusBadge status={selectedReport.status} />
                </div>
                {selectedReport.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.description}
                  </p>
                )}
                {selectedReport.location && (
                  <p className="text-sm font-medium">
                    📍 {selectedReport.location}
                  </p>
                )}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Update Status
                  </p>
                  <div className="flex gap-2">
                    {[
                      ReportStatus.reported,
                      ReportStatus.inProgress,
                      ReportStatus.resolved,
                    ].map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={
                          selectedReport.status === s ? "default" : "outline"
                        }
                        onClick={() => handleUpdateStatus(selectedReport.id, s)}
                        disabled={updating || selectedReport.status === s}
                        className="rounded-full text-xs"
                        data-ocid="admin.confirm_button"
                      >
                        {s === ReportStatus.reported
                          ? "Reported"
                          : s === ReportStatus.inProgress
                            ? "In Progress"
                            : "Resolved"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-full"
                  data-ocid="admin.close_button"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
