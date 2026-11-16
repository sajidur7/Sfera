import * as stylex from '@stylexjs/stylex';
import type { LucideIcon } from 'lucide-react';
import {
  Activity, AlarmClock, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, AtSign, BadgeCheck, Bell, Bookmark, Bot, Box,
  Briefcase, Building2, Calendar, Camera, ChartLine, ChartPie, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleAlert,
  CircleCheck, CircleHelp, Clock, Cloud, Code, Command, Copy, CreditCard, Database, DollarSign, Download, Ellipsis, ExternalLink, Eye,
  EyeOff, File, FileText, Filter, Flag, Folder, Gauge, GitBranch, Globe, Grid2x2, Hash, Headphones, Heart, House, Image, Inbox, Info, Key,
  Kanban, Landmark, Layers, LayoutDashboard, Link, List, ListFilter, Lock, LogOut, Mail, MapPin, Megaphone, Menu, MessageSquare, Mic, Minus,
  Moon, Package, PanelLeft, Paperclip, Pause, Pencil, Phone, Play, Plus, Receipt, RefreshCw, Rocket, Search, Send, Server, Settings,
  Share2, Shield, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone, Star, Sun, Tag, Target, Terminal, ThumbsUp, Ticket, Trash2,
  TrendingDown, TrendingUp, Truck, Upload, User, UserPlus, Users, Video, Wallet, Webhook, Workflow, X, Zap,
} from 'lucide-react';
import { colors } from './tokens.stylex';

// #region Icon
const ic = stylex.create({
  root: { display: 'inline-flex', flexShrink: 0 },
  muted: { color: colors.textMuted },
  subtle: { color: colors.textSubtle },
});
export const iconSize = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 } as const;
/**
 * Lucide only, drawn as SVG. One stroke width (1.75) across the system.
 * `<Icon as={Inbox} size="md" />`
 */
export function Icon({ as: I, size = 'md', tone, label }: { as: LucideIcon; size?: keyof typeof iconSize; tone?: 'muted' | 'subtle'; label?: string }) {
  return (
    <span {...stylex.props(ic.root, tone && ic[tone])} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <I size={iconSize[size]} strokeWidth={1.75} />
    </span>
  );
}
// #endregion

/** Curated Lucide set shown on the Iconography page. */
export const iconCatalog: Record<string, LucideIcon> = {
  Activity, AlarmClock, Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, AtSign, BadgeCheck, Bell, Bookmark, Bot, Box,
  Briefcase, Building2, Calendar, Camera, ChartLine, ChartPie, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleAlert,
  CircleCheck, CircleHelp, Clock, Cloud, Code, Command, Copy, CreditCard, Database, DollarSign, Download, Ellipsis, ExternalLink, Eye,
  EyeOff, File, FileText, Filter, Flag, Folder, Gauge, GitBranch, Globe, Grid2x2, Hash, Headphones, Heart, House, Image, Inbox, Info, Key,
  Kanban, Landmark, Layers, LayoutDashboard, Link, List, ListFilter, Lock, LogOut, Mail, MapPin, Megaphone, Menu, MessageSquare, Mic, Minus,
  Moon, Package, PanelLeft, Paperclip, Pause, Pencil, Phone, Play, Plus, Receipt, RefreshCw, Rocket, Search, Send, Server, Settings,
  Share2, Shield, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone, Star, Sun, Tag, Target, Terminal, ThumbsUp, Ticket, Trash2,
  TrendingDown, TrendingUp, Truck, Upload, User, UserPlus, Users, Video, Wallet, Webhook, Workflow, X, Zap,
};
