import type { PostCategory, PostCondition, PostType, ReactionType } from "../types";

export const categories: Array<{ value: PostCategory | "all"; label: string; color: string }> = [
  { value: "all", label: "All", color: "from-slate-900 to-slate-700" },
  { value: "books", label: "Books", color: "from-blue-600 to-indigo-600" },
  { value: "electronics", label: "Electronics", color: "from-violet-600 to-fuchsia-600" },
  { value: "clothing", label: "Clothing", color: "from-pink-500 to-rose-500" },
  { value: "school-supplies", label: "School Supplies", color: "from-amber-500 to-orange-500" },
  { value: "furniture", label: "Furniture", color: "from-emerald-600 to-teal-600" },
  { value: "services", label: "Services", color: "from-cyan-600 to-blue-600" },
  { value: "other", label: "Other", color: "from-slate-600 to-slate-800" }
];

export const postTypes: Array<{ value: PostType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "sell", label: "Selling" },
  { value: "buy", label: "Buying" }
];

export const conditions: Array<{ value: PostCondition; label: string }> = [
  { value: "brand-new", label: "Brand new" },
  { value: "like-new", label: "Like new" },
  { value: "used-good", label: "Used good" },
  { value: "used-fair", label: "Used fair" }
];

export const reactionLabels: Record<ReactionType, string> = {
  like: "Like",
  love: "Love",
  wow: "Wow",
  interested: "Interested"
};

export const reactionIcons: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  interested: "⭐"
};

export const nemsuCampuses = [
  {
    value: "NEMSU Tandag Campus",
    label: "Tandag Campus (Main)",
    location: "Rosario, Tandag City",
    focus: "Teacher education, business, law, and engineering"
  },
  {
    value: "NEMSU Bislig Campus",
    label: "Bislig Campus",
    location: "Bislig City",
    focus: "Agriculture, forestry, and industrial research"
  },
  {
    value: "NEMSU Cagwait Campus",
    label: "Cagwait Campus",
    location: "Cagwait",
    focus: "Industrial technology, hospitality management, and IT innovation"
  },
  {
    value: "NEMSU Cantilan Campus",
    label: "Cantilan Campus",
    location: "Cantilan",
    focus: "Industrial technology and renewable energy"
  },
  {
    value: "NEMSU Lianga Campus",
    label: "Lianga Campus",
    location: "Lianga",
    focus: "Fisheries, aquamarine sustainability, and marine sciences"
  },
  {
    value: "NEMSU San Miguel Campus",
    label: "San Miguel Campus",
    location: "San Miguel",
    focus: "Climate-smart agriculture and environmental science"
  },
  {
    value: "NEMSU Tagbina Campus",
    label: "Tagbina Campus",
    location: "Tagbina",
    focus: "Agri-business, food farming technology, and commercial sciences"
  },
  {
    value: "NEMSU Marihatag Campus",
    label: "Marihatag Campus",
    location: "Marihatag",
    focus: "Newest extension campus"
  }
];

export const nemsuCourses = [
  "Bachelor of Science in Information Technology",
  "Bachelor of Science in Computer Science",
  "Bachelor of Industrial Technology",
  "Bachelor of Science in Hospitality Management",
  "Bachelor of Science in Business Administration",
  "Bachelor of Science in Entrepreneurship",
  "Bachelor of Elementary Education",
  "Bachelor of Secondary Education",
  "Bachelor of Science in Civil Engineering",
  "Bachelor of Science in Electrical Engineering",
  "Bachelor of Science in Agriculture",
  "Bachelor of Science in Forestry",
  "Bachelor of Science in Fisheries",
  "Bachelor of Science in Marine Biology",
  "Bachelor of Science in Environmental Science",
  "Bachelor of Science in Agribusiness",
  "Bachelor of Science in Food Technology",
  "Bachelor of Science in Criminology",
  "Bachelor of Public Administration",
  "Juris Doctor"
];

export const categoryAccent = (category: PostCategory): string =>
  categories.find((item) => item.value === category)?.color ?? "from-slate-700 to-slate-900";
