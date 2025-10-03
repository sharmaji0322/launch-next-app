import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  is_private: boolean;
}

const Trips = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterAndSortTrips();
  }, [trips, searchQuery, filterStatus, sortBy]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrips = () => {
    let filtered = [...trips];
    const today = new Date();

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (trip) =>
          trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((trip) => {
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        
        if (filterStatus === "upcoming") return startDate > today;
        if (filterStatus === "current") return startDate <= today && endDate >= today;
        if (filterStatus === "past") return endDate < today;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
      if (sortBy === "destination") {
        return a.destination.localeCompare(b.destination);
      }
      return 0;
    });

    setFilteredTrips(filtered);
  };

  const getTripStatus = (trip: Trip) => {
    const today = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    if (startDate > today) return "upcoming";
    if (startDate <= today && endDate >= today) return "current";
    return "past";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "current": return "bg-green-100 text-green-800";
      case "past": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">My Trips</h1>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trips by name or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="destination">Sort by Destination</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trips Grid */}
          {filteredTrips.length === 0 ? (
            <Card className="text-center p-12">
              <CardContent>
                <p className="text-lg text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== "all"
                    ? "No trips found matching your filters"
                    : "You haven't created any trips yet"}
                </p>
                <Button onClick={() => navigate("/trips/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Trip
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => {
                const status = getTripStatus(trip);
                return (
                  <Card
                    key={trip.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{trip.name}</CardTitle>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        {trip.destination}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(trip.start_date), "MMM d")} -{" "}
                          {format(new Date(trip.end_date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs capitalize">
                          {trip.trip_type}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Floating Action Button */}
          <Button
            size="lg"
            className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-lg"
            onClick={() => navigate("/trips/create")}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Trips;
