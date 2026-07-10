import {
  Headphones, Zap, Tag, Battery, Smartphone, Award, Box, LayoutGrid,
  ShoppingCart, Search, Menu, X, Star, Heart, ChevronLeft, ChevronRight,
  Minus, Plus, Trash2, Check, Package, Truck, Shield, Phone, Mail,
  MapPin, Instagram, Twitter, Facebook, BarChart2, Settings,
  LogOut, Bell, Users, DollarSign, ArrowLeft, MessageCircle, RefreshCw,
  Image as ImageIcon, Eye, TrendingUp, Edit, Trash
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Headphones, Zap, Tag, Battery, Smartphone, Award, Box, LayoutGrid,
  ShoppingCart, Search, Menu, X, Star, Heart, ChevronLeft, ChevronRight,
  Minus, Plus, Trash2, Check, Package, Truck, Shield, Phone, Mail,
  MapPin, Instagram, Twitter, Facebook, BarChart2, Settings,
  LogOut, Bell, Users, DollarSign, ArrowLeft, MessageCircle, RefreshCw,
  Image: ImageIcon, Eye, TrendingUp, Edit, Trash
};

export const getIconComponent = (name: string, size = 26) => {
  const Comp = iconMap[name] || LayoutGrid;
  return <Comp size={size} />;
};
