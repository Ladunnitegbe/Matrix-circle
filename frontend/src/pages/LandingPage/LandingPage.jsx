import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import { HeartIcon, GlobeIcon, BoltIcon } from '../../components/Icon/Icon.jsx';
import { getToken, getAccount } from '../../lib/authStorage.js';

/**
 * LandingPage — public marketing home. No auth, no API calls.
 *
 * The Figma hero includes a large illustration (a vendor handing a
 * neighbor a bag of food). No such asset exists in this project and
 * none was provided — rather than hotlinking a stock image into
 * production code, this ships without one. A real illustration/SVG
 * from design should replace the placeholder block below.
 *
 * CTA buttons route smartly based on auth state: signed-in visitors
 * go straight to the relevant authenticated page; signed-out visitors
 * go to Registration, since neither button makes sense before an
 * account exists.
 */
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
  {
    icon: HeartIcon,
    title: 'Community & Dignity',
    body: 'We treat surplus food as a shared neighborhood resource, built on mutual respect — not charity leftovers.',
  },
  {
    icon: GlobeIcon,
    title: 'Zero Waste Impact',
    body: 'Every meal claimed is a step toward sustainability. Perfectly good food stays on plates, not in landfills.',
  },
  {
    icon: BoltIcon,
    title: 'Built for Speed',
    body: 'Designed to be ultra-lightweight. Fast loading times, low data usage, and effortless navigation for everyone.',
  },
];

export default function LandingPage() {
  const isAuthenticated = Boolean(getToken());
  const account = getAccount();

  const findFoodHref = isAuthenticated ? '/discover' : '/register';
  const shareFoodHref = isAuthenticated
    ? account?.role === 'vendor'
      ? '/create-listing'
      : '/register'
    : '/register';

  return (
    <div className="min-h-screen bg-surface">
      <Navbar
        brand={<span className="text-sh2 font-bold text-ink">Food<span className="text-accent-orange">Share</span></span>}
        ariaLabel="Primary"
      >
        <a href="#home" className="text-body2 font-semibold text-accent-orange">Home</a>
        <a href="#how-it-works" className="text-body2 font-medium text-ink hover:text-accent-orange">How it Works</a>
        <a href="#for-vendors" className="text-body2 font-medium text-ink hover:text-accent-orange">For Vendors</a>
      </Navbar>

      <main id="home" className="mx-auto max-w-6xl px-4 py-10 tablet:px-6 tablet:py-14 laptop:px-8">
        {/* Hero */}
        <section className="flex flex-col items-center gap-10 tablet:flex-row tablet:items-center">
          <div className="tablet:flex-1">
            <h1 className="text-h4 font-bold leading-tight text-ink tablet:text-h3">
              Good food belongs to the <span className="text-accent-green">community</span>, not the bin.
            </h1>
            <p className="mt-4 text-body1 text-ink-muted">
              Connecting local food vendors with neighbors, students, and charities to share surplus meals in
              real-time. Fresh, local, and completely free.
            </p>
            <div className="mt-6 flex flex-col gap-3 tablet:flex-row">
              <Link to={findFoodHref}>
                <Button color="secondary" variant="solid" fullWidth={false}>
                  Find Food Nearby
                </Button>
              </Link>
              <Link to={shareFoodHref}>
                <Button color="accent" variant="solid" fullWidth={false}>
                  Share Surplus Food
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-primary-light tablet:h-72 tablet:flex-1">
            <span className="text-body2 text-ink-faint">Illustration pending — asset not yet provided</span>
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
      </main>
    </div>
  );
}
