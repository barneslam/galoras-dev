import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Lightbulb, Clock, Users, Presentation, ArrowRight, CheckCircle2 } from "lucide-react";

const workshopCategories = [
  {
    title: "Leadership Development",
    workshops: [
      { name: "Executive Presence", duration: "Full day", size: "Up to 20" },
      { name: "Difficult Conversations", duration: "Half day", size: "Up to 15" },
      { name: "Strategic Thinking", duration: "2 days", size: "Up to 12" },
      { name: "Leading Through Change", duration: "Full day", size: "Up to 25" }
    ]
  },
  {
    title: "Team Performance",
    workshops: [
      { name: "High-Performing Teams", duration: "2 days", size: "Team-based" },
      { name: "Psychological Safety", duration: "Half day", size: "Up to 30" },
      { name: "Cross-Functional Collaboration", duration: "Full day", size: "Up to 40" },
      { name: "Conflict Resolution", duration: "Half day", size: "Up to 20" }
    ]
  },
  {
    title: "Personal Effectiveness",
    workshops: [
      { name: "Energy Management", duration: "Half day", size: "Up to 30" },
      { name: "Mindfulness for Leaders", duration: "2 hours", size: "Up to 50" },
      { name: "Time & Priority Management", duration: "Full day", size: "Up to 25" },
      { name: "Building Resilience", duration: "Half day", size: "Up to 30" }
    ]
  }
];

const features = [
  {
    icon: Presentation,
    title: "Interactive Format",
    description: "Hands-on exercises, role-playing, and real-world application—not just lectures."
  },
  {
    icon: Users,
    title: "Customized Content",
    description: "Every workshop is tailored to your organization's specific context and challenges."
  },
  {
    icon: Clock,
    title: "Flexible Delivery",
    description: "In-person, virtual, or hybrid. Half-day intensives to multi-week programs."
  },
  {
    icon: Lightbulb,
    title: "Lasting Impact",
    description: "Post-workshop resources and follow-up sessions to ensure learning sticks."
  }
];

const Workshops = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="container-wide relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Workshops & Training</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Build Capabilities That Last
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Interactive workshops designed to develop specific skills and create immediate, 
              practical impact for your teams.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">Request a Workshop <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover text-center">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Categories */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Workshop Catalog</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our most popular workshops. Custom topics available on request.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {workshopCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.workshops.map((workshop, i) => (
                      <div key={i} className="p-4 rounded-lg bg-background border border-border/50">
                        <h4 className="font-medium mb-2">{workshop.name}</h4>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {workshop.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {workshop.size}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Workshop CTA */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Something Custom?</h2>
            <p className="text-muted-foreground mb-6">
              We design bespoke workshops tailored to your organization's specific challenges, 
              culture, and goals. Let's discuss what you need.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">Discuss Custom Workshop <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Workshops;
