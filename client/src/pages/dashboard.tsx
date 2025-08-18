import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    retry: false,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
    retry: false,
  });

  const { data: ptSessions = [], isLoading: ptLoading } = useQuery({
    queryKey: ["/api/personal-training"],
    retry: false,
  });

  const { data: todaysSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["/api/class-schedules", { date: new Date().toISOString().split('T')[0] }],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bells-darker flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-bells-gold border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const upcomingBookings = bookings.filter((booking: any) => booking.status !== 'cancelled').slice(0, 3);
  const recentPayments = payments.slice(0, 3);

  return (
    <div className="min-h-screen bg-bells-darker text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2" data-testid="text-welcome">
            Welcome back, <span className="text-bells-gold">{user?.firstName || 'Member'}</span>
          </h1>
          <p className="text-gray-400 text-lg" data-testid="text-tagline">
            Ready to transform your body and elevate your mind?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-bells-dark border-bells-gray" data-testid="card-membership">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Active Membership</p>
                  <p className="text-2xl font-bold text-bells-gold" data-testid="text-membership-type">
                    {user?.membershipType || 'Basic'}
                  </p>
                </div>
                <div className="bg-bells-gold/20 p-3 rounded-lg">
                  <i className="fas fa-crown text-bells-gold text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bells-dark border-bells-gray" data-testid="card-classes-count">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Classes This Month</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-classes-count">
                    {bookings.filter((b: any) => b.status === 'confirmed').length}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <i className="fas fa-dumbbell text-blue-400 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bells-dark border-bells-gray" data-testid="card-pt-sessions">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">PT Sessions</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-pt-sessions">
                    {ptSessions.length}
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <i className="fas fa-user-plus text-green-400 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bells-dark border-bells-gray" data-testid="card-next-payment">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Last Payment</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-last-payment">
                    {payments[0] ? new Date(payments[0].createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : 'None'}
                  </p>
                </div>
                <div className="bg-bells-amber/20 p-3 rounded-lg">
                  <i className="fas fa-credit-card text-bells-amber text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Bookings */}
            <Card className="bg-bells-dark border-bells-gray" data-testid="card-upcoming-bookings">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Upcoming Bookings</h2>
                  <Button variant="ghost" className="text-bells-gold hover:text-bells-amber" data-testid="button-view-all-bookings">
                    View All
                  </Button>
                </div>
                
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-bells-gold border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400" data-testid="text-no-bookings">
                    No upcoming bookings. Book a class to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking: any, index: number) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-bells-darker rounded-lg border border-bells-gray/50" data-testid={`booking-item-${index}`}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-bells-gold/20 p-3 rounded-lg">
                            <i className="fas fa-boxing-glove text-bells-gold"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white" data-testid={`booking-title-${index}`}>
                              Class Booking
                            </h3>
                            <p className="text-gray-400 text-sm" data-testid={`booking-date-${index}`}>
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                              booking.status === 'pending' ? 'bg-bells-gold/20 text-bells-gold' :
                              'bg-red-500/20 text-red-400'
                            }
                            data-testid={`booking-status-${index}`}
                          >
                            {booking.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400" data-testid={`button-cancel-booking-${index}`}>
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Classes */}
            <Card className="bg-bells-dark border-bells-gray" data-testid="card-todays-classes">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Today's Classes</h2>
                  <Button className="bg-bells-gold text-bells-dark hover:bg-bells-amber" data-testid="button-book-class">
                    Book Class
                  </Button>
                </div>
                
                {schedulesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-bells-gold border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : todaysSchedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-400" data-testid="text-no-classes">
                    No classes scheduled for today.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysSchedules.slice(0, 3).map((schedule: any, index: number) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 bg-bells-darker rounded-lg border border-bells-gray/50" data-testid={`class-item-${index}`}>
                        <div className="flex items-center space-x-4">
                          <img 
                            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                            alt="Boxing class" 
                            className="w-16 h-16 rounded-lg object-cover"
                            data-testid={`class-image-${index}`}
                          />
                          <div>
                            <h3 className="font-semibold text-white" data-testid={`class-name-${index}`}>
                              Boxing Class
                            </h3>
                            <p className="text-gray-400 text-sm" data-testid={`class-time-${index}`}>
                              {new Date(schedule.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-gray-400 text-sm" data-testid={`class-spots-${index}`}>
                              <span className={schedule.availableSpots <= 2 ? 'text-red-400' : 'text-white'}>
                                {schedule.availableSpots}
                              </span> spots left
                            </p>
                          </div>
                        </div>
                        <Button 
                          className={schedule.availableSpots > 0 ? "bg-bells-gold text-bells-dark hover:bg-bells-amber" : "bg-gray-600 text-gray-400 cursor-not-allowed"}
                          disabled={schedule.availableSpots === 0}
                          data-testid={`button-book-class-${index}`}
                        >
                          {schedule.availableSpots > 0 ? 'Book Now' : 'Full'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Membership Card */}
            <Card className="bg-gradient-to-br from-bells-gold to-bells-amber text-bells-dark" data-testid="card-membership-details">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    {user?.membershipType === 'premium' ? 'Premium' : 
                     user?.membershipType === 'unlimited' ? 'Unlimited' : 'Basic'} Membership
                  </h3>
                  <i className="fas fa-crown text-2xl"></i>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <i className="fas fa-check w-4 mr-2"></i>
                    <span>{user?.membershipType === 'basic' ? '10 Classes/Month' : 'Unlimited Classes'}</span>
                  </div>
                  {user?.membershipType !== 'basic' && (
                    <div className="flex items-center text-sm">
                      <i className="fas fa-check w-4 mr-2"></i>
                      <span>2 PT Sessions/Month</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <i className="fas fa-check w-4 mr-2"></i>
                    <span>Priority Booking</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Valid until: <span data-testid="text-membership-expiry">
                      {user?.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString('en-GB') : 'Active'}
                    </span>
                  </span>
                  <Button variant="outline" size="sm" className="border-bells-dark text-bells-dark hover:bg-bells-dark hover:text-bells-gold" data-testid="button-manage-membership">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="bg-bells-dark border-bells-gray" data-testid="card-recent-payments">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Payments</h2>
                  <Button variant="ghost" className="text-bells-gold hover:text-bells-amber text-sm" data-testid="button-view-all-payments">
                    View All
                  </Button>
                </div>
                
                {paymentsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-bells-gold border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : recentPayments.length === 0 ? (
                  <div className="text-center py-4 text-gray-400" data-testid="text-no-payments">
                    No payments yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPayments.map((payment: any, index: number) => (
                      <div key={payment.id} className="flex items-center justify-between py-2" data-testid={`payment-item-${index}`}>
                        <div>
                          <p className="text-white text-sm" data-testid={`payment-description-${index}`}>
                            {payment.description}
                          </p>
                          <p className="text-gray-400 text-xs" data-testid={`payment-date-${index}`}>
                            {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium" data-testid={`payment-amount-${index}`}>
                            £{payment.amount}
                          </p>
                          <Badge 
                            className={
                              payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              payment.status === 'pending' ? 'bg-bells-gold/20 text-bells-gold' :
                              'bg-red-500/20 text-red-400'
                            }
                            data-testid={`payment-status-${index}`}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stripe Footer */}
                <div className="mt-6 pt-4 border-t border-bells-gray">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <i className="fab fa-stripe text-blue-500"></i>
                      <span className="text-sm text-gray-400">Secure payments by Stripe</span>
                    </div>
                    <Button variant="outline" size="sm" className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white" data-testid="button-update-payment">
                      Update Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-bells-dark border-bells-gray text-center" data-testid="card-quick-action-classes">
            <CardContent className="p-6">
              <div className="bg-bells-gold/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-calendar-plus text-bells-gold text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Book a Class</h3>
              <p className="text-gray-400 text-sm mb-4">Join our group boxing sessions and training programs</p>
              <Button className="w-full bg-bells-gold text-bells-dark hover:bg-bells-amber" data-testid="button-browse-classes">
                Browse Classes
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-bells-dark border-bells-gray text-center" data-testid="card-quick-action-pt">
            <CardContent className="p-6">
              <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-user-plus text-blue-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Personal Training</h3>
              <p className="text-gray-400 text-sm mb-4">One-on-one sessions with professional trainers</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-book-pt">
                Book Session
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-bells-dark border-bells-gray text-center" data-testid="card-quick-action-membership">
            <CardContent className="p-6">
              <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-crown text-green-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upgrade Plan</h3>
              <p className="text-gray-400 text-sm mb-4">Unlock more features and unlimited access</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="button-view-plans">
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
