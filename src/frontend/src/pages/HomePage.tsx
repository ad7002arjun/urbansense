import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle,
  Zap,
} from "lucide-react";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import ReportCard from "../components/ReportCard";
import { useGetRecentReports, useGetStats } from "../hooks/useQueries";

const SAMPLE_REPORTS = [
  {
    id: 1n,
    title: "Deep Pothole on Main Street",
    description:
      "Large pothole causing hazard near intersection with Oak Ave, vehicles swerving to avoid it.",
    status: "reported" as const,
    urgency: "urgent" as const,
    category: "pothole" as const,
    location: "Main St & Oak Ave, Downtown",
    createdAt: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000) * 1000000n,
    classificationLabel: "Road Damage / Pothole",
    submittedBy: {} as any,
    image: {
      getDirectURL: () => "/assets/generated/report-pothole.dim_400x300.jpg",
    } as any,
  },
  {
    id: 2n,
    title: "Graffiti on Community Center Wall",
    description:
      "Extensive spray paint tags covering north-facing wall of the community center building.",
    status: "inProgress" as const,
    urgency: "standard" as const,
    category: "graffiti" as const,
    location: "456 Community Drive, Westside",
    createdAt: BigInt(Date.now() - 5 * 24 * 60 * 60 * 1000) * 1000000n,
    classificationLabel: "Graffiti / Vandalism",
    submittedBy: {} as any,
    image: {
      getDirectURL: () => "/assets/generated/report-graffiti.dim_400x300.jpg",
    } as any,
  },
  {
    id: 3n,
    title: "Street Flooding Near Park",
    description:
      "Blocked storm drain causing significant water accumulation after recent rainfall.",
    status: "reported" as const,
    urgency: "urgent" as const,
    category: "waterIssue" as const,
    location: "Riverside Park Entrance, North District",
    createdAt: BigInt(Date.now() - 1 * 24 * 60 * 60 * 1000) * 1000000n,
    classificationLabel: "Water Issue / Flooding",
    submittedBy: {} as any,
    image: {
      getDirectURL: () => "/assets/generated/report-flooding.dim_400x300.jpg",
    } as any,
  },
  {
    id: 4n,
    title: "Broken Streetlight on Elm Road",
    description:
      "Street lamp has been out for 3 days creating a safety hazard for pedestrians after dark.",
    status: "resolved" as const,
    urgency: "standard" as const,
    category: "streetlight" as const,
    location: "123 Elm Road, East Quarter",
    createdAt: BigInt(Date.now() - 8 * 24 * 60 * 60 * 1000) * 1000000n,
    classificationLabel: "Streetlight / Infrastructure",
    submittedBy: {} as any,
    image: {
      getDirectURL: () =>
        "/assets/generated/report-streetlight.dim_400x300.jpg",
    } as any,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <Camera className="w-6 h-6" />,
    title: "Capture the Issue",
    description:
      "Use your phone camera or upload a photo of any civic problem you notice in your neighborhood.",
  },
  {
    step: "02",
    icon: <Zap className="w-6 h-6" />,
    title: "AI Classification",
    description:
      "Our smart system automatically identifies the type and urgency of the issue from your photo.",
  },
  {
    step: "03",
    icon: <MapPin className="w-6 h-6" />,
    title: "Report & Track",
    description:
      "Submit your report directly to the relevant government department and track its resolution.",
  },
];

export default function HomePage() {
  const { data: recentReports, isLoading: reportsLoading } =
    useGetRecentReports();
  const { data: stats, isLoading: statsLoading } = useGetStats();

  const displayReports =
    recentReports && recentReports.length > 0 ? recentReports : SAMPLE_REPORTS;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="hero-pattern relative overflow-hidden"
        data-ocid="hero.section"
      >
        <div className="container mx-auto px-4 py-24 md:py-32 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Smart Civic Reporting System
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Report City Issues,
              <br />
              <span className="opacity-90">Build Better Communities</span>
            </h1>
            <p className="text-white/85 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Snap a photo of any civic problem — potholes, flooding, graffiti,
              broken lights — and let AI classify and route it to the right
              government team instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-8 shadow-lg"
                data-ocid="hero.primary_button"
              >
                <Link to="/submit">
                  <Camera className="w-5 h-5 mr-2" />
                  Start a New Report
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white bg-white/10 hover:bg-white/20 rounded-full px-8 backdrop-blur-sm"
                data-ocid="hero.secondary_button"
              >
                <a href="#how-it-works">
                  How It Works
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <title>Wave divider</title>
            <path
              d="M0 80L1440 80L1440 20C1200 70 960 0 720 40C480 80 240 10 0 40L0 80Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-white"
        data-ocid="how_it_works.section"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to report a civic issue and get it resolved.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-200"
                data-ocid={`how_it_works.item.${i + 1}`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 hero-gradient rounded-2xl text-white mb-4">
                  {item.icon}
                </div>
                <div className="text-4xl font-bold font-display text-gradient opacity-50 mb-2">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="py-20 section-alt" data-ocid="recent_reports.section">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Recent Reports
            </h2>
            <p className="text-muted-foreground text-lg">
              See what citizens are reporting in your city.
            </p>
          </motion.div>

          {reportsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-border bg-white"
                  data-ocid="recent_reports.loading_state"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayReports.slice(0, 8).map((report, i) => (
                <motion.div
                  key={String(report.id)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <ReportCard report={report as any} index={i} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-primary/30 text-primary hover:bg-primary/5"
              data-ocid="recent_reports.secondary_button"
            >
              <Link to="/submit">
                Submit Your Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white" data-ocid="stats.section">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              System Statistics
            </h2>
            <p className="text-muted-foreground text-lg">
              Our impact in numbers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                label: "Total Reports",
                value: statsLoading ? "—" : String(stats?.totalReports ?? 0),
                icon: <BarChart3 className="w-6 h-6" />,
                color: "text-primary",
              },
              {
                label: "Urgent Reports",
                value: statsLoading ? "—" : String(stats?.urgentReports ?? 0),
                icon: <AlertTriangle className="w-6 h-6" />,
                color: "text-destructive",
              },
              {
                label: "Resolved",
                value: statsLoading ? "—" : String(stats?.resolvedReports ?? 0),
                icon: <CheckCircle className="w-6 h-6" />,
                color: "text-green-600",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-2xl border border-border shadow-card"
                data-ocid={`stats.item.${i + 1}`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4 ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`text-5xl font-bold font-display mb-2 ${stat.color}`}
                >
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="hero-pattern py-16 text-center"
        data-ocid="cta.section"
      >
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            See a Problem? Report It Now.
          </h2>
          <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
            Your report can trigger real government action. Together, we make
            our city safer.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-8"
            data-ocid="cta.primary_button"
          >
            <Link to="/submit">
              <Camera className="w-5 h-5 mr-2" />
              Report an Issue
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
