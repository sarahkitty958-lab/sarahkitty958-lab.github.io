import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload, Sparkles, User, MapPin, Bell, Lock, CreditCard } from 'lucide-react';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  notifications_enabled: boolean | null;
  card_last_four: string | null;
  card_brand: string | null;
}

interface CharacterAvatar {
  id: string;
  name: string;
  image_url: string;
}

export default function Account() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [characterAvatars, setCharacterAvatars] = useState<CharacterAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('USA');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Card info (display only - last 4 digits)
  const [cardLastFour, setCardLastFour] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    
    if (user) {
      fetchProfile();
      fetchCharacterAvatars();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
      setPhone(data.phone || '');
      setShippingAddress(data.shipping_address || '');
      setShippingCity(data.shipping_city || '');
      setShippingState(data.shipping_state || '');
      setShippingZip(data.shipping_zip || '');
      setShippingCountry(data.shipping_country || 'USA');
      setNotificationsEnabled(data.notifications_enabled ?? true);
      setCardLastFour(data.card_last_four || '');
      setCardBrand(data.card_brand || '');
    }
    setLoading(false);
  };

  const fetchCharacterAvatars = async () => {
    const { data } = await supabase
      .from('character_avatars')
      .select('*')
      .order('name');
    
    if (data) {
      setCharacterAvatars(data);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        phone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_zip: shippingZip,
        shipping_country: shippingCountry,
        notifications_enabled: notificationsEnabled,
      })
      .eq('user_id', user.id);
    
    if (error) {
      toast.error('Failed to save profile 😢');
    } else {
      toast.success('Profile updated! ✨');
      fetchProfile();
    }
    setSaving(false);
  };

  const handleSaveCard = async () => {
    if (!user) return;
    
    // Validate card number format (basic validation)
    const cleanNumber = newCardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      toast.error('Please enter a valid card number 💳');
      return;
    }
    
    // Detect card brand
    let brand = 'Card';
    if (cleanNumber.startsWith('4')) brand = 'Visa';
    else if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) brand = 'Mastercard';
    else if (/^3[47]/.test(cleanNumber)) brand = 'Amex';
    else if (/^6(?:011|5)/.test(cleanNumber)) brand = 'Discover';
    
    // Store only last 4 digits
    const lastFour = cleanNumber.slice(-4);
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        card_last_four: lastFour,
        card_brand: brand,
      })
      .eq('user_id', user.id);
    
    if (error) {
      toast.error('Failed to save card 😢');
    } else {
      toast.success('Card saved securely! 💳');
      setCardLastFour(lastFour);
      setCardBrand(brand);
      setNewCardNumber('');
    }
    setSaving(false);
  };

  const handleRemoveCard = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        card_last_four: null,
        card_brand: null,
      })
      .eq('user_id', user.id);
    
    if (error) {
      toast.error('Failed to remove card 😢');
    } else {
      toast.success('Card removed!');
      setCardLastFour('');
      setCardBrand('');
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match! 🙈");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters! 🔐');
      return;
    }
    
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password changed successfully! 🎉');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaving(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    setSaving(true);
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file);
    
    if (uploadError) {
      toast.error('Failed to upload image 😢');
      setSaving(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);
    
    await updateAvatarUrl(publicUrl);
    setSaving(false);
    setAvatarDialogOpen(false);
  };

  const updateAvatarUrl = async (url: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('user_id', user.id);
    
    if (error) {
      toast.error('Failed to update avatar 😢');
    } else {
      toast.success('Avatar updated! 🌟');
      fetchProfile();
    }
  };

  const handleCharacterSelect = async (avatar: CharacterAvatar) => {
    await updateAvatarUrl(avatar.image_url);
    setAvatarDialogOpen(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce">🧸</span>
          <p className="mt-2 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">My Account 🧸</h1>
          <p className="text-muted-foreground">Customize your stuffed adventure profile!</p>
        </div>
        
        {/* Avatar Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-2xl">
                  {displayName?.[0]?.toUpperCase() || '🧸'}
                </AvatarFallback>
              </Avatar>
              
              <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Change Picture
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center font-display text-xl">
                      Choose Your Avatar! 🌟
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Upload options */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                    
                    {/* Character avatars */}
                    {characterAvatars.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground text-center mb-3 flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Or pick a character!
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                          {characterAvatars.map((avatar) => (
                            <button
                              key={avatar.id}
                              onClick={() => handleCharacterSelect(avatar)}
                              className="group relative aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-105"
                            >
                              <img
                                src={avatar.image_url}
                                alt={avatar.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">{avatar.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {characterAvatars.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        No character avatars yet! Admins can add them soon 🎨
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="gap-1">
              <User className="w-4 h-4 hidden sm:inline" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="shipping" className="gap-1">
              <MapPin className="w-4 h-4 hidden sm:inline" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-1">
              <CreditCard className="w-4 h-4 hidden sm:inline" />
              Card
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1">
              <Bell className="w-4 h-4 hidden sm:inline" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1">
              <Lock className="w-4 h-4 hidden sm:inline" />
              Password
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Info
                </CardTitle>
                <CardDescription>Tell us about yourself! 🌈</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your awesome name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Save Changes ✨'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Shipping Tab */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
                <CardDescription>Where should we send your goodies? 📦</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="123 Teddy Bear Lane"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="Stuffington"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      placeholder="CA"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Save Address 📍'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Stay updated on new adventures! 🔔</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get updates about new stories, products, and special offers!
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <div className="p-4 rounded-lg border-2 border-dashed border-primary/20 text-center">
                  <span className="text-2xl">🎉</span>
                  <p className="text-sm text-muted-foreground mt-2">
                    {notificationsEnabled 
                      ? "You'll be the first to know about new stuffed adventures!"
                      : "You won't receive any marketing emails from us."}
                  </p>
                </div>
                
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Save Preferences 🔔'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payment Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Card
                </CardTitle>
                <CardDescription>
                  Save a card for faster checkout! 💳
                  <br />
                  <span className="text-xs text-muted-foreground/70">
                    Only you can see this info - not even admins!
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cardLastFour ? (
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-r from-primary to-accent rounded flex items-center justify-center text-white text-xs font-bold">
                          {cardBrand === 'Visa' ? 'VISA' : 
                           cardBrand === 'Mastercard' ? 'MC' : 
                           cardBrand === 'Amex' ? 'AMEX' : '💳'}
                        </div>
                        <div>
                          <p className="font-medium">{cardBrand}</p>
                          <p className="text-sm text-muted-foreground">•••• •••• •••• {cardLastFour}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleRemoveCard}
                        disabled={saving}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <p className="text-xs text-muted-foreground">
                        We only store the last 4 digits for your security 🔒
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleSaveCard} 
                      disabled={saving || !newCardNumber}
                      className="w-full"
                    >
                      {saving ? 'Saving...' : 'Save Card 💳'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Keep your account safe! 🔐</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={saving || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {saving ? 'Updating...' : 'Update Password 🔒'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
