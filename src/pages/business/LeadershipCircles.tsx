import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Shield, MessageCircle, Compass, ArrowRight, CheckCircle2, Quote } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Peer Learning",
    description: "Learn from fellow executives who've faced similar challenges. Gain perspectives you can't get from consultants or direct reports."
  },
  {
    icon: Shield,
    title: "Confidential Environment",
    description: "A safe space to discuss sensitive issues openly. What's shared in the circle, stays in the circle."
  },
  {
    icon: MessageCircle,
    title: "Expert Facilitation",
    description: "Experienced facilitators guide discussions, ensure balanced participation, and draw out actionable insights."
  },
  {
    icon: Compass,
    title: "Accountability",
    description: "Commit to action and report back. The circle holds you accountable to your own goals."
  }
];

const circleTypes = [
  {
    title: "CEO Circle",
    size: "8-12 members",
    frequency: "Monthly",
    description: "For chief executives navigating the unique challenges of leading organizations.",
    topics: ["Strategic vision", "Board relations", "Succession planning", "Work-life integration"]
  },
  {
    title: "Emerging Leaders Circle",
    size: "10-15 members",
    frequency: "Bi-weekly",
    description: "For high-potential leaders preparing for their first executive role.",
    topics: ["Executive presence", "Cross-functional leadership", "Managing up", "Building influence"]
  },
  {
    title: "Functional Leaders Circle",
    size: "8-12 members",
    frequency: "Monthly",
    description: "Industry-specific circles for CFOs, CTOs, CHROs, and other functional heads.",
    topics: ["Function-specific challenges", "Best practices", "Technology trends", "Talent development"]
  }
];

const testimonial = {
  quote: "The Leadership Circle has been invaluable. Having a group of peers who truly understand the weight of executive decisions has made me a better leader.",
  author: "Sarah Chen",
  role: "CEO, TechVentures Inc."
};

const LeadershipCircles = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="container-wide relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Leadership Circles</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Lead Better, Together
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join a confidential peer advisory group of executives who challenge, support, 
              and hold each other accountable to becoming better leaders.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">Apply for Membership <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join a Circle?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leadership can be isolating. Circles provide the support and perspective every leader needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="card-hover text-center">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-medium mb-6 italic">
              "{testimonial.quote}"
            </blockquote>
            <div>
              <div className="font-semibold">{testimonial.author}</div>
              <div className="text-muted-foreground">{testimonial.role}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Circle Types Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Circle</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Different circles for different leadership journeys.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {circleTypes.map((circle, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex gap-3 mb-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">{circle.size}</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">{circle.frequency}</span>
                  </div>
                  <CardTitle>{circle.title}</CardTitle>
                  <CardDescription className="text-base">{circle.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-3 text-sm">Discussion Topics:</h4>
                  <ul className="space-y-2">
                    {circle.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/contact">Apply Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LeadershipCircles;
