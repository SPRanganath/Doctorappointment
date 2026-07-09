import {
  HeartPulse,
  Sparkles,
  Baby,
  Bone,
  Brain,
  Smile,
  Ear,
  Flower2,
  Stethoscope,
  BrainCog,
  Eye,
  Pill,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Sparkles,
  Baby,
  Bone,
  Brain,
  Smile,
  Ear,
  Flower2,
  Stethoscope,
  BrainCog,
  Eye,
  Pill,
};

export default function SpecialtyIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Stethoscope;
  return <Icon className={className} />;
}
