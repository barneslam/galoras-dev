import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, Brain, Zap, Users, ArrowRight, CheckCircle2, Trophy } from "lucide-react";

const principles = [
  {
    icon: Brain,
    title: "Mental Performance",
    description: "Train your team's mindset like elite athletes. Build resilience, focus, and the ability to perform under pressure."
  },
  {
    icon: Users,
    title: "Team Dynamics",
    description: "Create the cohesion and trust that championship teams possess. Align individual strengths toward collective goals."
  },
  {
    icon: Zap,
    title: "Peak Performance",
    description: "Optimize performance cycles. Know when to push, when to recover, and how to sustain excellence over time."
  },
  {
    icon: Target,
    title: "Goal Achievement",
    description: "Set and achieve ambitious targets using the same periodization and milestone frameworks used by Olympic athletes."
  }
];

const programs = [
  {
    title: "Executive Performance Program",
    duration: "12 weeks",
    format: "1:1 + Team Sessions",
    description: "Intensive program for C-suite leaders wanting to operate at their peak.",
    outcomes: ["Enhanced decision-making under pressure", "Improved stress management", "Greater strategic clarity"]
  },
  {
    title: "Team Championship Program",
    duration: "6 months",
    format: "Team-based",
    description: "Transform your team into a high-performing unit that consistently delivers results.",
    outcomes: ["Stronger team cohesion", "Clear role clarity", "Improved communication"]
  },
  {
    title: "Sales Performance Intensive",
    duration: "8 weeks",
    format: "Group + 1:1",
    description: "Apply athletic performance principles to sales excellence.",
    outcomes: ["Mental resilience in negotiations", "Consistent quota achievement", "Faster recovery from setbacks"]
  }
];

const SportOfBusiness = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="container-wide relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Sport of Business</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Play Business Like an Elite Sport
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The world's best athletes don't just rely on talent—they train systematically, 
              optimize their mindset, and build winning habits. Your business can too.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">Start Your Training <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Four Pillars</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Core principles from elite athletics adapted for business excellence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => (
              <Card key={index} className="card-hover text-center">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <principle.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{principle.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Programs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Structured programs designed to deliver measurable performance improvements.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex gap-3 mb-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">{program.duration}</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">{program.format}</span>
                  </div>
                  <CardTitle>{program.title}</CardTitle>
                  <CardDescription className="text-base">{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-3 text-sm">Key Outcomes:</h4>
                  <ul className="space-y-2">
                    {program.outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/contact">Discuss Your Needs <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SportOfBusiness;
