import {
  BookOpen,
  Bus,
  ChartColumn,
  ClipboardList,
  Coffee,
  Flame,
  Gamepad2,
  House,
  Lightbulb,
  Package,
  PiggyBank,
  Receipt,
  Scale,
  Shield,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Soup,
  Target,
  TriangleAlert,
  Trophy,
  User,
  Users,
  Utensils
} from "lucide-react";

const GLYPHS = {
  bag: ShoppingBag,
  book: BookOpen,
  bulb: Lightbulb,
  bus: Bus,
  cart: ShoppingCart,
  chart: ChartColumn,
  clipboard: ClipboardList,
  coffee: Coffee,
  flame: Flame,
  gamepad: Gamepad2,
  home: House,
  package: Package,
  piggy: PiggyBank,
  receipt: Receipt,
  scale: Scale,
  shield: Shield,
  sliders: SlidersHorizontal,
  soup: Soup,
  target: Target,
  trophy: Trophy,
  user: User,
  users: Users,
  utensils: Utensils,
  warn: TriangleAlert
};

export default function Glyph({ name, size = 20, ...rest }) {
  const C = GLYPHS[name] || Package;
  return <C aria-hidden="true" width={size} height={size} {...rest} />;
}