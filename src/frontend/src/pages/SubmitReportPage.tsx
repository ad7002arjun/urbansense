import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  SwitchCamera,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Category, ExternalBlob, ReportStatus, Urgency } from "../backend";
import { useCamera } from "../camera/useCamera";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSubmitReport } from "../hooks/useQueries";
import { classifyImage, getCategoryIcon } from "../utils/imageClassifier";
import type { ClassificationResult } from "../utils/imageClassifier";

const STEPS = ["Capture", "Classify", "Details", "Submit"];

const CATEGORY_OPTIONS = [
  { value: Category.pothole, label: "Road Damage / Pothole" },
  { value: Category.waterIssue, label: "Water Issue / Flooding" },
  { value: Category.graffiti, label: "Graffiti / Vandalism" },
  { value: Category.garbage, label: "Garbage / Waste" },
  { value: Category.streetlight, label: "Streetlight / Infrastructure" },
  { value: Category.other, label: "Other Issue" },
];

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { mutateAsync: submitReport, isPending: isSubmitting } =
    useSubmitReport();

  const [step, setStep] = useState(0);
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<
    string | null
  >(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] =
    useState<ClassificationResult | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: Category.other,
    urgency: Urgency.standard,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isSupported,
    error: camError,
    isLoading: camLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: "environment",
    quality: 0.85,
    format: "image/jpeg",
  });

  const handleCapturePhoto = async () => {
    const file = await capturePhoto();
    if (!file) return;
    setCapturedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImageDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    stopCamera();
    setStep(1);
    runClassification(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImageDataUrl(dataUrl);
      setStep(1);
      runClassificationFromDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const runClassification = async (file: File) => {
    setClassifying(true);
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      const result = await classifyImage(dataUrl);
      setClassification(result);
      setForm((prev) => ({
        ...prev,
        category: result.category,
        urgency: result.urgency,
        title: `${result.label} - Needs Attention`,
      }));
    } finally {
      setClassifying(false);
    }
  };

  const runClassificationFromDataUrl = async (dataUrl: string) => {
    setClassifying(true);
    try {
      const result = await classifyImage(dataUrl);
      setClassification(result);
      setForm((prev) => ({
        ...prev,
        category: result.category,
        urgency: result.urgency,
        title: `${result.label} - Needs Attention`,
      }));
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!identity) {
      toast.error("Please sign in to submit a report.");
      return;
    }
    if (!capturedFile) {
      toast.error("Please capture or upload an image.");
      return;
    }

    try {
      const bytes = new Uint8Array(await capturedFile.arrayBuffer());
      const imageBlob = ExternalBlob.fromBytes(bytes);

      await submitReport({
        id: 0n,
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        urgency: form.urgency,
        status: ReportStatus.reported,
        classificationLabel: classification?.label ?? "",
        createdAt: 0n,
        submittedBy: identity.getPrincipal(),
        image: imageBlob,
      });

      toast.success(
        "Report submitted successfully! Authorities have been notified.",
      );
      setStep(3);
    } catch {
      toast.error("Failed to submit report. Please try again.");
    }
  };

  const reset = () => {
    setStep(0);
    setCapturedImageDataUrl(null);
    setCapturedFile(null);
    setClassification(null);
    setUploadMode(false);
    setForm({
      title: "",
      description: "",
      location: "",
      category: Category.other,
      urgency: Urgency.standard,
    });
  };

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-24 text-center"
        data-ocid="submit.section"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-6">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Sign In to Submit a Report
          </h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to submit civic reports. Your identity
            helps track report resolution.
          </p>
          <Button
            className="hero-gradient text-white border-0 rounded-full"
            data-ocid="submit.primary_button"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 section-alt min-h-screen" data-ocid="submit.section">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Submit a Report
          </h1>
          <p className="text-muted-foreground">
            Snap a photo, let AI classify it, and report to authorities.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    i < step
                      ? "hero-gradient text-white"
                      : i === step
                        ? "border-2 border-primary text-primary bg-white"
                        : "border-2 border-border text-muted-foreground bg-white"
                  }`}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i <= step ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 mb-4 transition-colors ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 0: Capture */}
            {step === 0 && (
              <Card className="shadow-card" data-ocid="submit.card">
                <CardContent className="p-6">
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={uploadMode ? "outline" : "default"}
                      size="sm"
                      onClick={() => {
                        setUploadMode(false);
                        if (!isActive) startCamera();
                      }}
                      className="rounded-full"
                      data-ocid="submit.toggle"
                    >
                      <Camera className="w-4 h-4 mr-1" /> Camera
                    </Button>
                    <Button
                      variant={uploadMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setUploadMode(true);
                        stopCamera();
                      }}
                      className="rounded-full"
                      data-ocid="submit.toggle"
                    >
                      <Upload className="w-4 h-4 mr-1" /> Upload
                    </Button>
                  </div>

                  {!uploadMode ? (
                    <>
                      {isSupported === false ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>Camera not supported in this browser.</p>
                          <Button
                            variant="outline"
                            onClick={() => setUploadMode(true)}
                            className="mt-3"
                          >
                            Use File Upload Instead
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4"
                            style={{ minHeight: 240 }}
                          >
                            <video
                              ref={videoRef}
                              className="w-full h-full object-cover"
                              playsInline
                              muted
                              autoPlay
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            {!isActive && !camLoading && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-3">
                                <Camera className="w-12 h-12 opacity-60" />
                                <p className="text-sm opacity-80">
                                  Camera is off
                                </p>
                                <Button
                                  onClick={startCamera}
                                  className="rounded-full"
                                  data-ocid="submit.primary_button"
                                >
                                  Start Camera
                                </Button>
                              </div>
                            )}
                            {camLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          {camError && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg mb-3">
                              {camError.message}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCapturePhoto}
                              disabled={!isActive || camLoading}
                              className="flex-1 hero-gradient text-white border-0 rounded-full"
                              data-ocid="submit.primary_button"
                            >
                              <Camera className="w-4 h-4 mr-2" /> Capture Photo
                            </Button>
                            <Button
                              onClick={() => switchCamera()}
                              disabled={!isActive || camLoading}
                              variant="outline"
                              size="icon"
                              className="rounded-full"
                              aria-label="Switch Camera"
                              data-ocid="submit.secondary_button"
                            >
                              <SwitchCamera className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <button
                        type="button"
                        className="w-full border-2 border-dashed border-primary/30 rounded-xl p-12 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        data-ocid="submit.dropzone"
                      >
                        <Upload className="w-12 h-12 mx-auto mb-3 text-primary/50" />
                        <p className="font-medium text-foreground">
                          Click to upload an image
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG, WebP supported
                        </p>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        data-ocid="submit.upload_button"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 1: Classify */}
            {step === 1 && (
              <Card className="shadow-card" data-ocid="submit.card">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Classification
                  </h3>

                  {capturedImageDataUrl && (
                    <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-black">
                      <img
                        src={capturedImageDataUrl}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {classifying ? (
                    <div
                      className="text-center py-8"
                      data-ocid="submit.loading_state"
                    >
                      <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <p className="font-medium text-foreground">
                        Analyzing image...
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our AI is classifying your photo
                      </p>
                    </div>
                  ) : classification ? (
                    <div className="space-y-4" data-ocid="submit.success_state">
                      <div className="p-4 rounded-xl bg-muted border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {getCategoryIcon(classification.category)}
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {classification.label}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Confidence:{" "}
                                {Math.round(classification.confidence * 100)}%
                              </p>
                            </div>
                          </div>
                          {classification.urgency === Urgency.urgent ? (
                            <Badge className="bg-red-500 text-white border-0 gap-1">
                              <AlertTriangle className="w-3 h-3" /> Urgent
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              Standard
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Override classification (optional):
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs mb-1 block">
                              Category
                            </Label>
                            <Select
                              value={form.category}
                              onValueChange={(v) =>
                                setForm((p) => ({
                                  ...p,
                                  category: v as Category,
                                }))
                              }
                            >
                              <SelectTrigger data-ocid="submit.select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORY_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">
                              Urgency
                            </Label>
                            <Select
                              value={form.urgency}
                              onValueChange={(v) =>
                                setForm((p) => ({
                                  ...p,
                                  urgency: v as Urgency,
                                }))
                              }
                            >
                              <SelectTrigger data-ocid="submit.select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Urgency.urgent}>
                                  Urgent
                                </SelectItem>
                                <SelectItem value={Urgency.standard}>
                                  Standard
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStep(0);
                            startCamera();
                          }}
                          className="rounded-full"
                          data-ocid="submit.secondary_button"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" /> Retake
                        </Button>
                        <Button
                          onClick={() => setStep(2)}
                          className="flex-1 hero-gradient text-white border-0 rounded-full"
                          data-ocid="submit.primary_button"
                        >
                          Continue <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <Card className="shadow-card" data-ocid="submit.card">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Report Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="report-title">Title</Label>
                      <Input
                        id="report-title"
                        value={form.title}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, title: e.target.value }))
                        }
                        placeholder="Brief title for this issue"
                        className="mt-1"
                        data-ocid="submit.input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="report-desc">Description</Label>
                      <Textarea
                        id="report-desc"
                        value={form.description}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe the issue in detail..."
                        className="mt-1 min-h-[100px]"
                        data-ocid="submit.textarea"
                      />
                    </div>

                    <div>
                      <Label htmlFor="report-location">
                        <MapPin className="w-4 h-4 inline mr-1" /> Location
                      </Label>
                      <Input
                        id="report-location"
                        value={form.location}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, location: e.target.value }))
                        }
                        placeholder="Street address or landmark"
                        className="mt-1"
                        data-ocid="submit.input"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="rounded-full"
                        data-ocid="submit.secondary_button"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !form.title.trim()}
                        className="flex-1 hero-gradient text-white border-0 rounded-full"
                        data-ocid="submit.submit_button"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Done */}
            {step === 3 && (
              <Card
                className="shadow-card text-center"
                data-ocid="submit.success_state"
              >
                <CardContent className="p-10">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    Report Submitted!
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Your report has been successfully submitted and the relevant
                    government department has been notified.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={reset}
                      variant="outline"
                      className="rounded-full"
                      data-ocid="submit.secondary_button"
                    >
                      Submit Another
                    </Button>
                    <Button
                      onClick={() => navigate({ to: "/my-reports" })}
                      className="hero-gradient text-white border-0 rounded-full"
                      data-ocid="submit.primary_button"
                    >
                      View My Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
