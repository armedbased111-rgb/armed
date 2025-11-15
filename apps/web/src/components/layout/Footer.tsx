import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Shop */}
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">
                Shop
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sound Kits
                  </Link>
                </li>
                <li>
                  <Link to="/tracks" className="text-muted-foreground hover:text-foreground transition-colors">
                    Beats
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Bundles
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">
                    New Releases
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">
                Support
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                    Shipping
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">
                Legal
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                    License Agreement
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow */}
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">
                Follow Us
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    YouTube
                  </a>
                </li>
                <li>
                  <a 
                    href="https://soundcloud.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    SoundCloud
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">.armed</span>
                <span className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} All rights reserved.
                </span>
              </div>
              
              {/* Payment methods / Trust badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
