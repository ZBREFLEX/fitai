import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Brain, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (mock)
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">AI FitGuide</span>
          </div>
          <nav className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]"
            >
              Home
            </Button>
            <Button 
              onClick={() => navigate('/onboarding')}
              className="bg-white text-black hover:bg-[#e0e0e0]"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-[#a0a0a0] max-w-2xl mx-auto">
            Have questions about our AI-powered fitness platform? We're here to help you on your journey.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="col-span-2">
            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <p className="text-sm text-[#a0a0a0]">Fill out the form below and we'll respond within 24 hours</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                        className="bg-[#0a0a0a] border-[#2a2a2a] text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required
                        className="bg-[#0a0a0a] border-[#2a2a2a] text-white mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-white">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={(e) => updateField('subject', e.target.value)}
                      required
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      required
                      rows={6}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white mt-2 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-white text-black hover:bg-[#e0e0e0]"
                    size="lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Email</div>
                    <a href="mailto:support@aifitguide.com" className="text-[#a0a0a0] hover:text-white transition-colors">
                      support@aifitguide.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Phone</div>
                    <a href="tel:+1234567890" className="text-[#a0a0a0] hover:text-white transition-colors">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Address</div>
                    <div className="text-[#a0a0a0]">
                      123 Fitness Street<br />
                      San Francisco, CA 94102<br />
                      United States
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Monday - Friday</span>
                  <span className="font-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Saturday</span>
                  <span className="font-semibold">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Sunday</span>
                  <span className="font-semibold">Closed</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-[#a0a0a0] hover:text-white transition-colors">FAQ</a>
                  </li>
                  <li>
                    <a href="#" className="text-[#a0a0a0] hover:text-white transition-colors">Documentation</a>
                  </li>
                  <li>
                    <a href="#" className="text-[#a0a0a0] hover:text-white transition-colors">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#" className="text-[#a0a0a0] hover:text-white transition-colors">Terms of Service</a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-[#a0a0a0] text-sm">
          © 2026 AI FitGuide. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
