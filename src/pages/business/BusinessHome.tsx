import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, Users, Lightbulb, BarChart3, ArrowRight, Building2, Trophy, TrendingUp } from "lucide-react";

const services = [
  {
    icon: Target,
    title: "Sport of Business",
    description: "Apply elite athletic principles to business performance. Build winning teams with proven sports psychology frameworks.",
    href: "/business/sport-of-business",
    features: ["Mental Performance", "Team Dynamics", "Peak Performance"]
  },
  {
    icon: Users,
    title: "Leadership Circles",
    description: "Peer advisory groups for executives. Confidential, facilitated sessions with fellow leaders facing similar challenges.",
    href: "/business/leadership-circles",
    features: ["Peer Learning", "Executive Networks", "Accountability"]
  },
  {
    icon: Lightbulb,
    title: "Workshops & Training",
    description: "Interactive sessions designed to build specific capabilities. From half-day intensives to multi-week programs.",
    href: "/business/workshops",
    features: ["Custom Programs", "Team Building", "Skill Development"]
  },
  {
    icon: BarChart3,
    title: "Diagnostics & Assessment",
    description: "Data-driven insights into your organization's culture, leadership effectiveness, and team dynamics.",
    href: "/business/diagnostics",
    features: ["360° Feedback", "Culture Assessment", "Team Analytics"]
  }
];

const stats = [
  { value: "500+", label: "Organizations Served" },
  { value: "92%", label: "Client Satisfaction" },
  { value: "3.2x", label: "Average ROI" },
  { value: "50+", label: "Fortune 500 Clients" }
];

const BusinessHome = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="container-wide relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">For Organizations</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Transform Your Organization's Performance
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Elite coaching methodologies adapted for the business world. We help organizations 
              build high-performing cultures, develop exceptional leaders, and achieve breakthrough results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">Schedule Consultation <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/business/diagnostics">Take Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions designed to elevate every aspect of your organization's performance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="card-hover group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.features.map((feature, i) => (
                      <span key={i} className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Button variant="ghost" className="group/btn" asChild>
                    <Link to={service.href}>
                      Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Galoras Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Organizations Choose Galoras</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Elite Performance Methodology</h3>
                    <p className="text-muted-foreground">Our coaches have trained Olympic athletes and Fortune 500 executives using the same proven frameworks.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Measurable Results</h3>
                    <p className="text-muted-foreground">Data-driven approach with clear metrics. Our clients see an average 3.2x ROI on their investment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Tailored Solutions</h3>
                    <p className="text-muted-foreground">Every engagement is customized to your organization's unique culture, challenges, and goals.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Ready to Transform Your Organization?</h3>
              <p className="text-muted-foreground mb-6">
                Schedule a complimentary consultation to discuss your organization's needs and explore how we can help.
              </p>
              <Button className="w-full" size="lg" asChild>
                <Link to="/contact">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BusinessHome;
