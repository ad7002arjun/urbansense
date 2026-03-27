import { Link } from "@tanstack/react-router";
import { SiFacebook, SiGithub, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="section-alt border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo + tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/urbansense-logo-transparent.dim_64x64.png"
                alt="UrbanSense"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold font-display text-gradient">
                UrbanSense
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Smart civic reporting that connects citizens with local government
              to build better cities together.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", to: "/" },
                { label: "Submit Report", to: "/submit" },
                { label: "My Reports", to: "/my-reports" },
                { label: "Admin Dashboard", to: "/admin" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <SiGithub className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                aria-label="X"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <SiX className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <SiFacebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© {year} UrbanSense. All rights reserved.</span>
          <span>
            Built with ❤️ using{" "}
            <a
              href={utmLink}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
