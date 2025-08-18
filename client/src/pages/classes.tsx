import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import BookingModal from "@/components/booking-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Classes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["/api/class-schedules", { date: selectedDate }],
    retry: false,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const bookingMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      await apiRequest("POST", "/api/bookings", { classScheduleId: scheduleId });
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "Your class has been booked successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/class-schedules"] });
      setShowBookingModal(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Booking Failed",
        description: "Failed to book the class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookClass = (schedule: any) => {
    setSelectedSchedule(schedule);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (selectedSchedule) {
      bookingMutation.mutate(selectedSchedule.id);
    }
  };

  const getClassInfo = (classId: string) => {
    return classes.find((c: any) => c.id === classId) || {};
  };

  const filteredSchedules = schedules.filter((schedule: any) => {
    const classInfo = getClassInfo(schedule.classId);
    const matchesSearch = !searchTerm || classInfo.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevel || classInfo.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-bells-darker text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2" data-testid="text-page-title">
            <span className="text-bells-gold">Class</span> Schedule
          </h1>
          <p className="text-gray-400 text-lg" data-testid="text-page-subtitle">
            Book your next boxing session and transform your fitness journey
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-bells-dark border-bells-gray mb-8" data-testid="card-filters">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-bells-darker border-bells-gray text-white"
                  data-testid="input-date-filter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Classes</label>
                <Input
                  type="text"
                  placeholder="Search by class name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-bells-darker border-bells-gray text-white"
                  data-testid="input-search-filter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="bg-bells-darker border-bells-gray text-white" data-testid="select-level-filter">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setSearchTerm("");
                    setSelectedLevel("");
                  }}
                  variant="outline"
                  className="w-full border-bells-gold text-bells-gold hover:bg-bells-gold hover:text-bells-dark"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Schedule */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bells-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading classes...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <Card className="bg-bells-dark border-bells-gray" data-testid="card-no-classes">
            <CardContent className="p-12 text-center">
              <div className="bg-gray-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-calendar-times text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Classes Found</h3>
              <p className="text-gray-400 mb-4">
                {selectedDate !== new Date().toISOString().split('T')[0] 
                  ? "No classes scheduled for the selected date." 
                  : "No classes match your current filters."}
              </p>
              <Button 
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  setSearchTerm("");
                  setSelectedLevel("");
                }}
                className="bg-bells-gold text-bells-dark hover:bg-bells-amber"
                data-testid="button-reset-filters"
              >
                Show Today's Classes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule: any, index: number) => {
              const classInfo = getClassInfo(schedule.classId);
              const startTime = new Date(schedule.startTime);
              const endTime = new Date(schedule.endTime);
              const isFullyBooked = schedule.availableSpots === 0;
              const isAlmostFull = schedule.availableSpots <= 2 && schedule.availableSpots > 0;

              return (
                <Card 
                  key={schedule.id} 
                  className={`bg-bells-dark border-bells-gray hover:border-bells-gold transition-colors ${isFullyBooked ? 'opacity-60' : ''}`}
                  data-testid={`card-class-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        className={
                          classInfo.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                          classInfo.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }
                        data-testid={`badge-level-${index}`}
                      >
                        {classInfo.level || 'Unknown'}
                      </Badge>
                      <div className="text-right">
                        <p className="text-bells-gold font-semibold" data-testid={`text-price-${index}`}>
                          £{classInfo.price || '0'}
                        </p>
                        <p className="text-gray-400 text-xs" data-testid={`text-duration-${index}`}>
                          {classInfo.duration || 60} min
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <img 
                        src={classInfo.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200"} 
                        alt={classInfo.name || "Boxing class"}
                        className="w-full h-32 object-cover rounded-lg"
                        data-testid={`img-class-${index}`}
                      />
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2" data-testid={`text-class-name-${index}`}>
                        {classInfo.name || 'Boxing Class'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3" data-testid={`text-class-description-${index}`}>
                        {classInfo.description || 'High-intensity boxing training session'}
                      </p>
                      <div className="flex items-center text-sm text-gray-300 mb-2">
                        <i className="fas fa-clock mr-2"></i>
                        <span data-testid={`text-class-time-${index}`}>
                          {startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <i className="fas fa-users mr-2"></i>
                        <span 
                          className={isAlmostFull ? 'text-bells-amber' : isFullyBooked ? 'text-red-400' : 'text-gray-300'}
                          data-testid={`text-spots-available-${index}`}
                        >
                          {schedule.availableSpots} spots available
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleBookClass(schedule)}
                      disabled={isFullyBooked || bookingMutation.isPending}
                      className={
                        isFullyBooked 
                          ? "w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "w-full bg-bells-gold text-bells-dark hover:bg-bells-amber font-semibold"
                      }
                      data-testid={`button-book-class-${index}`}
                    >
                      {bookingMutation.isPending && selectedSchedule?.id === schedule.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin w-4 h-4 border-2 border-bells-dark border-t-transparent rounded-full mr-2" />
                          Booking...
                        </div>
                      ) : isFullyBooked ? (
                        "Class Full"
                      ) : (
                        "Book Now"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={confirmBooking}
        schedule={selectedSchedule}
        classInfo={selectedSchedule ? getClassInfo(selectedSchedule.classId) : {}}
        isLoading={bookingMutation.isPending}
      />
    </div>
  );
}
