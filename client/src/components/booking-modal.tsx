import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  schedule: any;
  classInfo: any;
  isLoading: boolean;
}

export default function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  schedule,
  classInfo,
  isLoading
}: BookingModalProps) {
  if (!schedule || !classInfo) return null;

  const startTime = new Date(schedule.startTime);
  const endTime = new Date(schedule.endTime);
  const price = parseFloat(classInfo.price || "0");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bells-dark border-bells-gray text-white max-w-md" data-testid="dialog-booking-confirmation">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-bells-gold" data-testid="text-booking-title">
            Confirm Booking
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Class Details */}
          <div className="bg-bells-darker p-4 rounded-lg border border-bells-gray/50">
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src={classInfo.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60"} 
                alt={classInfo.name}
                className="w-16 h-16 rounded-lg object-cover"
                data-testid="img-class-preview"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-white" data-testid="text-class-name">
                  {classInfo.name || 'Boxing Class'}
                </h4>
                <p className="text-gray-400 text-sm" data-testid="text-class-description">
                  {classInfo.description || 'High-intensity boxing training session'}
                </p>
                <Badge 
                  className={
                    classInfo.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    classInfo.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }
                  data-testid="badge-class-level"
                >
                  {classInfo.level || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span className="text-white font-medium" data-testid="text-session-date">
                {startTime.toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="text-white font-medium" data-testid="text-session-time">
                {startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="text-white font-medium" data-testid="text-session-duration">
                {classInfo.duration || 60} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Available Spots:</span>
              <span className={`font-medium ${schedule.availableSpots <= 2 ? 'text-bells-amber' : 'text-white'}`} data-testid="text-available-spots">
                {schedule.availableSpots} remaining
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-bells-gray">
              <span className="text-gray-300">Total Cost:</span>
              <span className="text-bells-gold" data-testid="text-total-cost">
                £{price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Warning for low availability */}
          {schedule.availableSpots <= 2 && (
            <div className="bg-bells-amber/20 border border-bells-amber/50 rounded-lg p-3" data-testid="alert-low-availability">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-bells-amber mr-2"></i>
                <span className="text-bells-amber text-sm font-medium">
                  Only {schedule.availableSpots} spot{schedule.availableSpots !== 1 ? 's' : ''} remaining!
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-bells-gray text-gray-300 hover:bg-bells-gray"
              data-testid="button-cancel-booking"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-bells-gold text-bells-dark hover:bg-bells-amber font-semibold"
              data-testid="button-confirm-booking"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-bells-dark border-t-transparent rounded-full mr-2" />
                  Booking...
                </div>
              ) : (
                `Confirm Booking - £${price.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
