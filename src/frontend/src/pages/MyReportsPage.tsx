import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { motion } from "motion/react";
import ReportCard from "../components/ReportCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyReports } from "../hooks/useQueries";

export default function MyReportsPage() {
  const { identity } = useInternetIdentity();
  const { data: reports, isLoading } = useGetMyReports();

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-ocid="my_reports.section"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Sign In to View Your Reports
          </h2>
          <p className="text-muted-foreground mb-6">
            Your submitted reports will appear here once you sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="section-alt min-h-screen py-12"
      data-ocid="my_reports.section"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Track the status of your submitted reports.
            </p>
          </div>
          <Button
            asChild
            className="hero-gradient text-white border-0 rounded-full"
            data-ocid="my_reports.primary_button"
          >
            <Link to="/submit">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="my_reports.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-border bg-white"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !reports || reports.length === 0 ? (
          <div
            className="text-center py-20 bg-white rounded-2xl border border-border shadow-card"
            data-ocid="my_reports.empty_state"
          >
            <FileText className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Reports Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't submitted any reports. Help improve your city!
            </p>
            <Button
              asChild
              className="hero-gradient text-white border-0 rounded-full"
              data-ocid="my_reports.primary_button"
            >
              <Link to="/submit">Submit Your First Report</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, i) => (
              <motion.div
                key={String(report.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <ReportCard report={report} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
