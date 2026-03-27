import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveUserProfile,
} from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveUserProfile();
  const [name, setName] = useState("");

  const isAuthenticated = !!identity;
  const showModal =
    isAuthenticated && !isLoading && isFetched && profile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile({ name: name.trim() });
      toast.success("Profile created! Welcome to UrbanSense.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={showModal}>
      <DialogContent className="sm:max-w-md" data-ocid="profile_setup.dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-display text-xl">
              Welcome to UrbanSense!
            </DialogTitle>
          </div>
          <DialogDescription>
            Please enter your name to get started. This helps government
            officials identify your reports.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Your Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              data-ocid="profile_setup.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full hero-gradient text-white border-0 hover:opacity-90"
            disabled={isPending || !name.trim()}
            data-ocid="profile_setup.submit_button"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Get Started
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
