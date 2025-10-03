import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, MapPin, Clock, GripVertical, Trash2 } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
}

interface ItineraryItem {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  day_number: number;
  order_index: number;
  notes: string | null;
}

const TripItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [tripResponse, itemsResponse] = await Promise.all([
        supabase.from("trips").select("*").eq("id", id).single(),
        supabase.from("itinerary_items").select("*").eq("trip_id", id).order("day_number").order("order_index"),
      ]);

      if (tripResponse.error) throw tripResponse.error;
      if (itemsResponse.error) throw itemsResponse.error;

      setTrip(tripResponse.data);
      setItems(itemsResponse.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/trips");
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trip || !formData.title || !formData.startTime || !formData.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const dayDate = addDays(new Date(trip.start_date), selectedDay - 1);
      const startDateTime = new Date(`${format(dayDate, "yyyy-MM-dd")}T${formData.startTime}`);
      const endDateTime = new Date(`${format(dayDate, "yyyy-MM-dd")}T${formData.endTime}`);

      const maxOrder = items
        .filter((item) => item.day_number === selectedDay)
        .reduce((max, item) => Math.max(max, item.order_index), -1);

      const { error } = await supabase.from("itinerary_items").insert({
        trip_id: id,
        title: formData.title,
        description: formData.description || null,
        location: formData.location || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        day_number: selectedDay,
        order_index: maxOrder + 1,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity added to itinerary",
      });

      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteActivity = async (itemId: string) => {
    try {
      const { error } = await supabase.from("itinerary_items").delete().eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity removed from itinerary",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const tripDuration = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const days = Array.from({ length: tripDuration }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="outline" onClick={() => navigate(`/trips/${id}`)} className="mb-4">
            ← Back to Trip Details
          </Button>
          <h1 className="font-heading text-3xl font-bold">{trip.name} - Itinerary</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {days.map((day) => {
            const dayDate = addDays(new Date(trip.start_date), day - 1);
            const dayItems = items.filter((item) => item.day_number === day);

            return (
              <Card key={day}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Day {day}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(dayDate, "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                    <Dialog open={dialogOpen && selectedDay === day} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setSelectedDay(day);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleAddActivity}>
                          <DialogHeader>
                            <DialogTitle>Add Activity - Day {day}</DialogTitle>
                            <DialogDescription>
                              Add a new activity to your itinerary
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Activity Title *</Label>
                              <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time *</Label>
                                <Input
                                  id="startTime"
                                  type="time"
                                  value={formData.startTime}
                                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="endTime">End Time *</Label>
                                <Input
                                  id="endTime"
                                  type="time"
                                  value={formData.endTime}
                                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Activity</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {dayItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No activities planned for this day
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold">{item.title}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteActivity(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {format(new Date(item.start_time), "HH:mm")} -{" "}
                                    {format(new Date(item.end_time), "HH:mm")}
                                  </span>
                                </div>
                                {item.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{item.location}</span>
                                  </div>
                                )}
                              </div>
                              {item.notes && (
                                <p className="text-sm italic text-muted-foreground">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TripItinerary;
