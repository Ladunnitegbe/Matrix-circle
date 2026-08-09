import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import Logo from '../../components/Logo/Logo.jsx';
import { HeartIcon, GlobeIcon, BoltIcon } from '../../components/Icon/Icon.jsx';
import { getToken, getAccount } from '../../lib/authStorage.js';
import HeroImage from "../../assets/images/hero_image.png";


const RECIPIENT_STEPS = [
  { n: '01', title: 'Browse Locally', body: 'Open the feed to see surplus food within a 5km radius.' },
  { n: '02', title: 'Reserve Instantly.', body: 'Tap to claim a portion. No credit cards, no complicated sign-ups.' },
  { n: '03', title: 'Pick Up.', body: 'Follow the 15-minute countdown clock to the vendor and collect your food.' },
];

const VENDOR_STEPS = [
  { n: '01', title: 'Count & Post.', body: "Tell us what's left over, the quantity, and tap post." },
  { n: '02', title: 'Notify the Neighbourhood.', body: 'FoodShare instantly alerts nearby residents.' },
  { n: '03', title: 'Handoff & Track', body: 'Verify claims at your counter and track your community impact on your dashboard.' },
];

const CORE_VALUES = [
  { icon: HeartIcon, title: 'Community & Dignity', body: 'We treat surplus food as a shared neighborhood resource, built on mutual respect — not charity leftovers.' },
  { icon: GlobeIcon, title: 'Zero Waste Impact', body: 'Every meal claimed is a step toward sustainability. Perfectly good food stays on plates, not in landfills.' },
  { icon: BoltIcon, title: 'Built for Speed', body: 'Designed to be ultra-lightweight. Fast loading times, low data usage, and effortless navigation for everyone.' },
];

export default function LandingPage() {
  const isAuthenticated = Boolean(getToken());
  const account = getAccount();
  const isVendor = account?.role === 'vendor';

  const primaryAuthedHref = isVendor ? '/vendor/dashboard' : '/discover';
  const findFoodHref = isAuthenticated ? '/discover' : '/register';
  const shareFoodHref = isAuthenticated ? (isVendor ? '/create-listing' : '/register') : '/register';

  return (
    <div className="min-h-screen bg-surface">
      <Navbar
        brand={<Logo size="md" />}
        ariaLabel="Primary"
        actions={
          !isAuthenticated ? (
            <>
              <Link to="/login" className="text-body2 font-medium text-ink hover:text-accent-orange">
                Login
              </Link>
              <Link to="/register">
                <Button color="accent" variant="solid" fullWidth={false}>Register</Button>
              </Link>
            </>
          ) : (
            <Link to={primaryAuthedHref}>
              <Button color="secondary" variant="solid" fullWidth={false}>
                {isVendor ? 'Dashboard' : 'Discover Food'}
              </Button>
            </Link>
          )
        }
      >
        <a href="#home" className="text-body2 font-semibold text-accent-orange">Home</a>
        <a href="#how-it-works" className="text-body2 font-medium text-ink hover:text-accent-orange">How It Works</a>
        <a href="#for-vendors" className="text-body2 font-medium text-ink hover:text-accent-orange">For Vendors</a>
      </Navbar>

      <main id="home" className="mx-auto max-w-6xl px-4 py-10 tablet:px-6 tablet:py-14 laptop:px-8">
        {/* Hero */}
        <section className="flex flex-col items-center gap-10 tablet:flex-row tablet:items-center">
          <div className="tablet:flex-1">
            <h1 className="text-h3 font-bold leading-tight text-ink">
              Good food belongs<br />
              to the <span className="text-accent-green">community</span>,<br />
              <span className="text-accent-green">not the bin.</span>
            </h1>
            <p className="mt-4 text-body1 text-ink-muted">
              Connecting local food vendors with neighbors, students, and charities to share surplus meals in
              real-time. Fresh, local, and completely free.
            </p>
            <div className="mt-6 flex flex-col gap-3 tablet:flex-row">
              <Link to={findFoodHref}>
                <Button color="secondary" variant="solid" fullWidth={false}>Find Food Nearby</Button>
              </Link>
              <Link to={shareFoodHref}>
                <Button color="accent" variant="solid" fullWidth={false}>Share Surplus Food</Button>
              </Link>
            </div>
          </div>
         <div className="tablet:flex-1 flex justify-center">
    <img
        src={HeroImage}
        alt="Food sharing"
        className="w-full max-w-[650px] object-contain"
    />
</div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mt-20">
          <h2 className="text-center text-h4 font-bold text-ink">How It Works</h2>
          <div className="mt-10 grid grid-cols-1 gap-10 tablet:grid-cols-2">
            <div>
              <h3 className="text-sh1 font-bold text-ink">For Neighbors &amp; Charities</h3>
              <p className="mt-1 text-body2 text-ink-muted">Claim a meal in minutes.</p>
              <div className="mt-4 flex flex-col gap-4">
                {RECIPIENT_STEPS.map((step) => (
                  <Card key={step.n} padding="md">
                    <div className="flex gap-4">
                      <span className="text-h4 font-bold text-accent-orange">{step.n}</span>
                      <div>
                        <p className="text-sh2 font-bold text-accent-orange">{step.title}</p>
                        <p className="mt-1 text-body2 text-ink-muted">{step.body}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div id="for-vendors">
              <h3 className="text-sh1 font-bold text-ink">For Food Vendors</h3>
              <p className="mt-1 text-body2 text-ink-muted">Share surplus in under 60 seconds.</p>
              <div className="mt-4 flex flex-col gap-4">
                {VENDOR_STEPS.map((step) => (
                  <Card key={step.n} padding="md">
                    <div className="flex gap-4">
                      <span className="text-h4 font-bold text-accent-green">{step.n}</span>
                      <div>
                        <p className="text-sh2 font-bold text-accent-green">{step.title}</p>
                        <p className="mt-1 text-body2 text-ink-muted">{step.body}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values & Benefits */}
        <section className="mt-20">
          <h2 className="text-center text-h4 font-bold text-ink">Core Values &amp; Benefits</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 tablet:grid-cols-3">
            {CORE_VALUES.map(({ icon: ValueIcon, title, body }) => (
              <Card key={title} padding="lg" className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-orange-light text-accent-orange">
                  <ValueIcon />
                </div>
                <p className="mt-4 text-sh1 font-bold text-ink">{title}</p>
                <p className="mt-2 text-body2 text-ink-muted">{body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Safe, Verified, and Local banner */}
        <section className="mt-16 rounded-2xl bg-accent-green px-6 py-12 text-center tablet:px-12">
          <h2 className="text-h4 font-bold text-white">Safe, Verified, and Local.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-body1 text-white/90">
            Vendors are registered local businesses, and charities are officially verified. You always know
            exactly where your food is coming from and who is providing it.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-h3 font-bold text-ink">
            Ready to reduce food waste<br />in your neighborhood?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body1 text-ink-muted">
            Join thousands of neighbours and vendors working together to reduce food waste while helping the
            community.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 tablet:flex-row">
            <Link to={findFoodHref}>
              <Button color="secondary" variant="solid">Open the Feed</Button>
            </Link>
            <Link to={shareFoodHref}>
              <Button color="accent" variant="solid">Register as Vendor</Button>
            </Link>
          </div>
          {!isAuthenticated && (
            <p className="mt-5 text-body2 text-ink-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent-green hover:underline">Log in</Link>
            </p>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-24 border-t border-border bg-primary-light">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 tablet:grid-cols-3 tablet:px-6 laptop:px-8">
            <div>
              <Logo size="md" />
              <p className="mt-4 text-body2 text-ink-muted">
                Connecting communities with surplus food to reduce waste and fight hunger one meal at a time.
              </p>
            </div>

            <div>
              <h3 className="text-sh2 font-bold text-ink">Quick Links</h3>
              <ul className="mt-4 space-y-3 text-body2">
                <li><a href="#home" className="text-ink-muted hover:text-accent-orange">Home</a></li>
                <li><a href="#how-it-works" className="text-ink-muted hover:text-accent-orange">How It Works</a></li>
                <li><a href="#for-vendors" className="text-ink-muted hover:text-accent-orange">For Vendors</a></li>
                <li><Link to="/login" className="text-ink-muted hover:text-accent-orange">Login</Link></li>
                <li><Link to="/register" className="text-ink-muted hover:text-accent-orange">Register</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sh2 font-bold text-ink">Policies</h3>
              {/* These three routes don't exist in App.jsx yet — clicking
                  them currently falls through to the catch-all redirect
                  back to "/". Left in as real <Link>s since a Privacy
                  Policy / Terms / Contact page is a reasonable future
                  addition, not invented as fully-built pages here. */}
              <ul className="mt-4 space-y-3 text-body2">
                <li><Link to="/privacy-policy" className="text-ink-muted hover:text-accent-orange">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-ink-muted hover:text-accent-orange">Terms &amp; Conditions</Link></li>
                <li><Link to="/contact" className="text-ink-muted hover:text-accent-orange">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border py-5 text-center">
            <p className="text-body2 text-ink-muted">© {new Date().getFullYear()} FoodShare. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
