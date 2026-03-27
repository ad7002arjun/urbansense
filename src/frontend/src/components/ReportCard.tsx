import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Clock,
  MapPin,
} from "lucide-react";
import { Category, ReportStatus, Urgency } from "../backend";
import type { Report } from "../backend.d.ts";
import { getCategoryIcon } from "../utils/imageClassifier";

interface ReportCardProps {
  report: Report;
  onViewDetails?: (report: Report) => void;
  index?: number;
}

function formatDate(timestamp: bigint): string {
  if (timestamp === 0n) return "Just now";
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: ReportStatus }) {
  switch (status) {
    case ReportStatus.reported:
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
          <Circle className="w-2 h-2 fill-red-500" />
          Reported
        </Badge>
      );
    case ReportStatus.inProgress:
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
          <Circle className="w-2 h-2 fill-blue-500" />
          In Progress
        </Badge>
      );
    case ReportStatus.resolved:
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
          <CheckCircle className="w-3 h-3" />
          Resolved
        </Badge>
      );
  }
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  if (urgency === Urgency.urgent) {
    return (
      <Badge className="bg-red-500 text-white border-0 gap-1">
        <AlertTriangle className="w-3 h-3" />
        Urgent
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
      Standard
    </Badge>
  );
}

export default function ReportCard({
  report,
  onViewDetails,
  index = 0,
}: ReportCardProps) {
  const imageUrl = report.image?.getDirectURL?.();

  return (
    <Card
      className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 group"
      data-ocid={`reports.item.${index + 1}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{getCategoryIcon(report.category)}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <UrgencyBadge urgency={report.urgency} />
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
          {report.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {report.description || "No description provided."}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">
            {report.location || "Location not specified"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{formatDate(report.createdAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
        <StatusBadge status={report.status} />
        {onViewDetails && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(report)}
            className="text-primary border-primary/30 hover:bg-primary/5"
            data-ocid={`reports.item.${index + 1}`}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export { StatusBadge, UrgencyBadge, formatDate };
