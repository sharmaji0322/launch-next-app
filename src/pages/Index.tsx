import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, MapPin, Calendar, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";


const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">TravelTrek</span>
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground flex items-center">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth/login")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth/register")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              TravelTrek
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Your Ultimate Travel Companion
            </p>
            <p className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto">
              Plan, organize, and enjoy your trips seamlessly. From itinerary management to real-time updates, everything you need in one dynamic platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="min-w-[160px] h-12 text-base font-medium"
                onClick={() => navigate(user ? "/dashboard" : "/auth/register")}
              >
                {user ? "Go to Dashboard" : "Get Started"}
              </Button>
              <Button size="lg" variant="outline" className="min-w-[160px] h-12 text-base font-medium">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to Travel Smart
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            All essential travel functions consolidated into a single, intuitive platform
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow border-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">In-App Booking</h3>
              <p className="text-muted-foreground">
                Book flights, hotels, and activities directly within the app
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Smart Discovery</h3>
              <p className="text-muted-foreground">
                AI-powered recommendations for destinations and local experiences
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Itinerary Management</h3>
              <p className="text-muted-foreground">
                Create and organize detailed travel plans with real-time updates
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Safety First</h3>
              <p className="text-muted-foreground">
                Emergency contacts, SOS functionality, and secure document storage
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have made their trips seamless with TravelTrek
          </p>
          <Button size="lg" variant="secondary" className="min-w-[200px] h-12 text-base font-medium">
            Download Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TravelTrek. Your Ultimate Travel Companion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
