import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bells-darker text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-bells-darker via-bells-dark to-bells-gray">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="text-6xl font-black text-bells-gold mb-4" data-testid="text-logo">
              BELLS GYM
            </div>
            <h1 className="text-5xl font-bold text-white mb-6" data-testid="text-tagline">
              Transform Your Body.<br />
              Elevate Your Mind.
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-description">
              With over 40 unique boxing themed classes a month and 1-1 private boxing sessions to choose from, 
              Bells is the perfect place to start your fitness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-bells-gold hover:bg-bells-amber text-bells-dark font-bold text-lg px-8 py-4"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Start Your Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-bells-gold text-bells-gold hover:bg-bells-gold hover:text-bells-dark font-bold text-lg px-8 py-4"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-bells-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4" data-testid="text-features-title">
              What We Offer
            </h2>
            <p className="text-xl text-gray-400" data-testid="text-features-subtitle">
              Programs for Every Body and Every Goal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-bells-darker border-bells-gray" data-testid="card-feature-classes">
              <CardContent className="p-6 text-center">
                <div className="bg-bells-gold/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-boxing-glove text-bells-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Group Classes</h3>
                <p className="text-gray-400 mb-4">
                  Over 40 unique boxing themed classes monthly including HIIT Boxing, Boxing Fundamentals, and more.
                </p>
                <Badge className="bg-bells-gold text-bells-dark">40+ Classes/Month</Badge>
              </CardContent>
            </Card>

            <Card className="bg-bells-darker border-bells-gray" data-testid="card-feature-pt">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-user-plus text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Personal Training</h3>
                <p className="text-gray-400 mb-4">
                  One-on-one sessions with professional trainers including former champions and licensed coaches.
                </p>
                <Badge className="bg-blue-500 text-white">Expert Trainers</Badge>
              </CardContent>
            </Card>

            <Card className="bg-bells-darker border-bells-gray" data-testid="card-feature-membership">
              <CardContent className="p-6 text-center">
                <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-crown text-green-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Premium Memberships</h3>
                <p className="text-gray-400 mb-4">
                  Flexible membership plans with unlimited classes, priority booking, and exclusive benefits.
                </p>
                <Badge className="bg-green-500 text-white">Unlimited Access</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trainers Section */}
      <div className="py-24 bg-bells-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4" data-testid="text-trainers-title">
              Meet The Team
            </h2>
            <p className="text-xl text-gray-400" data-testid="text-trainers-subtitle">
              Certified. Experienced. Committed to You.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="bg-bells-dark border-bells-gray" data-testid="card-trainer-stevie">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-2xl font-bold text-white">Stevie Bell</h3>
                  <p className="text-bells-gold font-semibold">Boxing Champion</p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  2x National Title winner, England Team Captain at Manchester Commonwealth Games 2002. 
                  Over 175 fights both amateur and professional. Now offering his wealth of experience 
                  giving sound advice and high standard training to all clients.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-bells-dark border-bells-gray" data-testid="card-trainer-ryan">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-2xl font-bold text-white">Ryan Oliver</h3>
                  <p className="text-bells-gold font-semibold">Former Professional</p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Former professional boxer who began coaching at Bells in 2014. Holds a professional 
                  boxing trainers licence with numerous professional fighters and personal training clients. 
                  Let Ryan take your training to the next level.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-bells-gold to-bells-amber">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-bells-dark mb-4" data-testid="text-cta-title">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-bells-dark/80 mb-8" data-testid="text-cta-subtitle">
            Join the Bells Gym family today and start your journey to becoming the best version of yourself.
          </p>
          <Button 
            size="lg" 
            className="bg-bells-dark hover:bg-gray-800 text-bells-gold font-bold text-lg px-12 py-4"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-join-now"
          >
            Join Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-bells-dark border-t border-bells-gray py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-black text-bells-gold mb-2" data-testid="text-footer-logo">
              BELLS GYM
            </div>
            <p className="text-gray-400 text-sm mb-4" data-testid="text-footer-tagline">
              Transform Your Body. Elevate Your Mind.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
              <span data-testid="text-address">Unit 1-2 Denmark Street, Altrincham, Cheshire WA14 2SS</span>
              <span className="hidden sm:block">•</span>
              <span data-testid="text-phone">07926 589189</span>
              <span className="hidden sm:block">•</span>
              <span data-testid="text-email">info@bellsgym.co.uk</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
