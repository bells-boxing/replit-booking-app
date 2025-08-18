import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
    enabled: user?.role === 'admin',
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    retry: false,
    enabled: user?.role === 'admin',
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments"],
    retry: false,
    enabled: user?.role === 'admin',
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ["/api/trainers"],
    retry: false,
    enabled: user?.role === 'admin',
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
    enabled: user?.role === 'admin',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bells-darker flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-bells-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bells-darker text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2" data-testid="text-admin-title">
            Admin <span className="text-bells-gold">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg" data-testid="text-admin-subtitle">
            Manage your gym operations and view analytics
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-bells-dark border-bells-gray" data-testid="card-total-bookings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-total-bookings">
                    {stats?.bookings?.total || bookings.length}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <i className="fas fa-calendar-check text-blue-400 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bells-dark border-bells-gray" data-testid="card-confirmed-bookings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Confirmed Bookings</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-confirmed-bookings">
                    {stats?.bookings?.confirmed || bookings.filter((b: any) => b.status === 'confirmed').length}
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <i className="fas fa-check-circle text-green-400 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bells-dark border-bells-gray" data-testid="card-active-trainers">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Active Trainers</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-active-trainers">
                    {trainers.filter((t: any) => t.isActive).length}
                  </p>
                </div>
                <div className="bg-bells-gold/20 p-3 rounded-lg">
                  <i className="fas fa-user-tie text-bells-gold text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bells-dark border-bells-gray" data-testid="card-total-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-total-revenue">
                    £{stats?.revenue?.total || payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0).toFixed(0)}
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <i className="fas fa-pound-sign text-green-400 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-bells-dark border-bells-gray" data-testid="tabs-admin">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-bells-gold data-[state=active]:text-bells-dark">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-bells-gold data-[state=active]:text-bells-dark">
              Payments
            </TabsTrigger>
            <TabsTrigger value="trainers" className="data-[state=active]:bg-bells-gold data-[state=active]:text-bells-dark">
              Trainers
            </TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-bells-gold data-[state=active]:text-bells-dark">
              Classes
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" data-testid="tab-content-bookings">
            <Card className="bg-bells-dark border-bells-gray">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Recent Bookings
                  <Button className="bg-bells-gold text-bells-dark hover:bg-bells-amber" data-testid="button-add-booking">
                    Add Booking
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400" data-testid="text-no-bookings">
                    No bookings found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 10).map((booking: any, index: number) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-bells-darker rounded-lg border border-bells-gray/50" data-testid={`booking-row-${index}`}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-500/20 p-2 rounded">
                            <i className="fas fa-calendar text-blue-400"></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium" data-testid={`booking-id-${index}`}>
                              Booking #{booking.id.slice(-6)}
                            </h4>
                            <p className="text-gray-400 text-sm" data-testid={`booking-date-${index}`}>
                              {new Date(booking.createdAt).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
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
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid={`button-edit-booking-${index}`}>
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" data-testid="tab-content-payments">
            <Card className="bg-bells-dark border-bells-gray">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Payment History
                  <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-export-payments">
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400" data-testid="text-no-payments">
                    No payments found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.slice(0, 10).map((payment: any, index: number) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-bells-darker rounded-lg border border-bells-gray/50" data-testid={`payment-row-${index}`}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-500/20 p-2 rounded">
                            <i className="fas fa-pound-sign text-green-400"></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium" data-testid={`payment-description-${index}`}>
                              {payment.description}
                            </h4>
                            <p className="text-gray-400 text-sm" data-testid={`payment-date-${index}`}>
                              {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-semibold" data-testid={`payment-amount-${index}`}>
                            £{payment.amount}
                          </span>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainers Tab */}
          <TabsContent value="trainers" data-testid="tab-content-trainers">
            <Card className="bg-bells-dark border-bells-gray">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Trainer Management
                  <Button className="bg-bells-gold text-bells-dark hover:bg-bells-amber" data-testid="button-add-trainer">
                    Add Trainer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400" data-testid="text-no-trainers">
                    No trainers found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trainers.map((trainer: any, index: number) => (
                      <div key={trainer.id} className="flex items-center justify-between p-4 bg-bells-darker rounded-lg border border-bells-gray/50" data-testid={`trainer-row-${index}`}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-bells-gold/20 p-2 rounded">
                            <i className="fas fa-user-tie text-bells-gold"></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium" data-testid={`trainer-name-${index}`}>
                              Trainer #{trainer.id.slice(-4)}
                            </h4>
                            <p className="text-gray-400 text-sm" data-testid={`trainer-specialty-${index}`}>
                              {trainer.specialty || 'Boxing Specialist'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-bells-gold font-semibold" data-testid={`trainer-rate-${index}`}>
                            £{trainer.hourlyRate || '60'}/hr
                          </span>
                          <Badge 
                            className={trainer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                            data-testid={`trainer-status-${index}`}
                          >
                            {trainer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid={`button-edit-trainer-${index}`}>
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" data-testid="tab-content-classes">
            <Card className="bg-bells-dark border-bells-gray">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Class Management
                  <Button className="bg-bells-gold text-bells-dark hover:bg-bells-amber" data-testid="button-add-class">
                    Add Class
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400" data-testid="text-no-classes">
                    No classes found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classes.map((classItem: any, index: number) => (
                      <div key={classItem.id} className="flex items-center justify-between p-4 bg-bells-darker rounded-lg border border-bells-gray/50" data-testid={`class-row-${index}`}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-500/20 p-2 rounded">
                            <i className="fas fa-dumbbell text-blue-400"></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium" data-testid={`class-name-${index}`}>
                              {classItem.name || 'Boxing Class'}
                            </h4>
                            <p className="text-gray-400 text-sm" data-testid={`class-level-${index}`}>
                              {classItem.level} • {classItem.duration || 60} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-bells-gold font-semibold" data-testid={`class-price-${index}`}>
                            £{classItem.price}
                          </span>
                          <Badge 
                            className={classItem.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                            data-testid={`class-status-${index}`}
                          >
                            {classItem.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid={`button-edit-class-${index}`}>
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
