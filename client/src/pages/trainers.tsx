import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Trainers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ["/api/trainers"],
    retry: false,
  });

  const bookingMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      await apiRequest("POST", "/api/personal-training", sessionData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "Your personal training session has been booked successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-training"] });
      setShowBookingDialog(false);
      setSelectedTrainer(null);
      setSelectedDate(new Date());
      setSelectedTime("");
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
        description: "Failed to book the session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookSession = (trainer: any) => {
    setSelectedTrainer(trainer);
    setShowBookingDialog(true);
  };

  const confirmBooking = () => {
    if (!selectedTrainer || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':');
    const startTime = new Date(selectedDate);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1); // 1 hour session

    bookingMutation.mutate({
      trainerId: selectedTrainer.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      price: selectedTrainer.hourlyRate || "60.00",
    });
  };

  // Available time slots
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <div className="min-h-screen bg-bells-darker text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2" data-testid="text-page-title">
            Our <span className="text-bells-gold">Professional</span> Trainers
          </h1>
          <p className="text-gray-400 text-lg" data-testid="text-page-subtitle">
            Certified. Experienced. Committed to Your Success.
          </p>
        </div>

        {/* Trainers Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bells-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading trainers...</p>
          </div>
        ) : trainers.length === 0 ? (
          <Card className="bg-bells-dark border-bells-gray" data-testid="card-no-trainers">
            <CardContent className="p-12 text-center">
              <div className="bg-gray-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-user-times text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Trainers Available</h3>
              <p className="text-gray-400">Our trainers will be available soon.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer: any, index: number) => (
              <Card key={trainer.id} className="bg-bells-dark border-bells-gray hover:border-bells-gold transition-colors" data-testid={`card-trainer-${index}`}>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-bells-gold to-bells-amber rounded-full mx-auto mb-4 flex items-center justify-center">
                      <i className="fas fa-user text-bells-dark text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white" data-testid={`text-trainer-name-${index}`}>
                      Trainer #{trainer.id.slice(-4)}
                    </h3>
                    <p className="text-bells-gold font-semibold" data-testid={`text-trainer-specialty-${index}`}>
                      {trainer.specialty || 'Boxing Specialist'}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed" data-testid={`text-trainer-bio-${index}`}>
                      {trainer.bio || 'Professional boxing trainer with years of experience helping clients achieve their fitness goals.'}
                    </p>
                    {trainer.experience && (
                      <div className="mt-3">
                        <Badge className="bg-blue-500/20 text-blue-400" data-testid={`badge-trainer-experience-${index}`}>
                          {trainer.experience}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">Hourly Rate</p>
                      <p className="text-2xl font-bold text-bells-gold" data-testid={`text-trainer-rate-${index}`}>
                        £{trainer.hourlyRate || '60'}/hr
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Availability</p>
                      <Badge className="bg-green-500/20 text-green-400" data-testid={`badge-trainer-availability-${index}`}>
                        Available
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleBookSession(trainer)}
                    className="w-full bg-bells-gold text-bells-dark hover:bg-bells-amber font-semibold"
                    data-testid={`button-book-trainer-${index}`}
                  >
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Trainers Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center" data-testid="text-featured-title">
            Featured Professional Trainers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="bg-bells-dark border-bells-gray" data-testid="card-featured-stevie">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-bells-gold to-bells-amber rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-crown text-bells-dark text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Stevie Bell</h3>
                    <p className="text-bells-gold font-semibold mb-3">Boxing Champion</p>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      2x National Title winner, England Team Captain at Manchester Commonwealth Games 2002. 
                      Over 175 fights both amateur and professional. Now offering his wealth of experience 
                      giving sound advice and high standard training to all clients.
                    </p>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-bells-gold/20 text-bells-gold">2x National Champion</Badge>
                      <Badge className="bg-blue-500/20 text-blue-400">175+ Fights</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-bells-dark border-bells-gray" data-testid="card-featured-ryan">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-boxing-glove text-white text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Ryan Oliver</h3>
                    <p className="text-bells-gold font-semibold mb-3">Former Professional</p>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Former professional boxer who began coaching at Bells in 2014. Holds a professional 
                      boxing trainers licence with numerous professional fighters and personal training clients. 
                      Let Ryan take your training to the next level.
                    </p>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-500/20 text-green-400">Licensed Trainer</Badge>
                      <Badge className="bg-purple-500/20 text-purple-400">10+ Years Experience</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="bg-bells-dark border-bells-gray text-white max-w-2xl" data-testid="dialog-booking">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-bells-gold">
              Book Personal Training Session
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedTrainer && (
              <div className="bg-bells-darker p-4 rounded-lg border border-bells-gray/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-bells-gold/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-bells-gold"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white" data-testid="text-selected-trainer">
                      Trainer #{selectedTrainer.id.slice(-4)}
                    </h4>
                    <p className="text-gray-400 text-sm">{selectedTrainer.specialty || 'Boxing Specialist'}</p>
                    <p className="text-bells-gold font-semibold">£{selectedTrainer.hourlyRate || '60'}/hour</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Select Date</label>
                <div className="bg-bells-darker border border-bells-gray rounded-lg p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="text-white"
                    data-testid="calendar-session-date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Select Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="bg-bells-darker border-bells-gray text-white" data-testid="select-session-time">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Session Duration:</span>
                    <span className="text-white">1 hour</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-bells-gold font-semibold">
                      £{selectedTrainer?.hourlyRate || '60'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button 
                onClick={() => setShowBookingDialog(false)}
                variant="outline"
                className="flex-1 border-bells-gray text-gray-300 hover:bg-bells-gray"
                data-testid="button-cancel-booking"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmBooking}
                disabled={!selectedDate || !selectedTime || bookingMutation.isPending}
                className="flex-1 bg-bells-gold text-bells-dark hover:bg-bells-amber font-semibold"
                data-testid="button-confirm-booking"
              >
                {bookingMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-bells-dark border-t-transparent rounded-full mr-2" />
                    Booking...
                  </div>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
