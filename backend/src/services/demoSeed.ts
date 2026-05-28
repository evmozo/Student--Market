import { Types } from "mongoose";
import { Post, type PostCategory, type PostCondition, type PostType, type ReactionType } from "../models/Post";
import { User, type IUser } from "../models/User";

interface DemoUser {
  name: string;
  email: string;
  school: string;
  course: string;
  bio: string;
  profilePicture: string;
  coverPhoto: string;
}

interface DemoPost {
  authorEmail: string;
  title: string;
  description: string;
  price: number;
  category: PostCategory;
  type: PostType;
  condition: PostCondition;
  location: string;
  images: string[];
  comments: Array<{ email: string; text: string }>;
  reactions: Array<{ email: string; type: ReactionType }>;
}

const password = "DemoPass123!";

const demoUsers: DemoUser[] = [
  {
    name: "Aira Mendoza",
    email: "aira.mendoza@nemsu.edu.ph",
    school: "NEMSU Cagwait Campus",
    course: "Bachelor of Science in Information Technology",
    bio: "IT student selling carefully used tech and school gear.",
    profilePicture: "https://api.dicebear.com/8.x/notionists/svg?seed=Aira%20Mendoza",
    coverPhoto: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Kyle Navarro",
    email: "kyle.navarro@nemsu.edu.ph",
    school: "NEMSU Tandag Campus",
    course: "Bachelor of Science in Civil Engineering",
    bio: "Engineering student. Books, drafting tools, and dorm finds.",
    profilePicture: "https://api.dicebear.com/8.x/notionists/svg?seed=Kyle%20Navarro",
    coverPhoto: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Mika Santos",
    email: "mika.santos@nemsu.edu.ph",
    school: "NEMSU Bislig Campus",
    course: "Bachelor of Science in Agriculture",
    bio: "Plant science student buying lab supplies and selling books.",
    profilePicture: "https://api.dicebear.com/8.x/notionists/svg?seed=Mika%20Santos",
    coverPhoto: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Janelle Cruz",
    email: "janelle.cruz@nemsu.edu.ph",
    school: "NEMSU Lianga Campus",
    course: "Bachelor of Science in Fisheries",
    bio: "Marine science student. Always looking for field gear.",
    profilePicture: "https://api.dicebear.com/8.x/notionists/svg?seed=Janelle%20Cruz",
    coverPhoto: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Renz Villanueva",
    email: "renz.villanueva@nemsu.edu.ph",
    school: "NEMSU Cantilan Campus",
    course: "Bachelor of Industrial Technology",
    bio: "Renewable energy student. Tools, gadgets, and project parts.",
    profilePicture: "https://api.dicebear.com/8.x/notionists/svg?seed=Renz%20Villanueva",
    coverPhoto: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80"
  },
  {
    name: "Bea Solis",
    email: "bea.solis@nemsu.edu.ph",
    school: "NEMSU Tagbina Campus",
    course: "Bachelor of Science in Agribusiness",
    bio: "Agribusiness student trading dorm and school essentials.",
    profilePicture: "https://api.dicebear.com/8.x/notionists/svg?seed=Bea%20Solis",
    coverPhoto: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"
  }
];

const demoPosts: DemoPost[] = [
  {
    authorEmail: "aira.mendoza@nemsu.edu.ph",
    title: "Lenovo ThinkPad for IT projects",
    description: "Reliable laptop for programming, docs, and online classes. Includes charger, laptop sleeve, and fresh Windows install.",
    price: 18500,
    category: "electronics",
    type: "sell",
    condition: "used-good",
    location: "Cagwait Campus Gate",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
    ],
    comments: [
      { email: "kyle.navarro@nemsu.edu.ph", text: "Available pa? Good for AutoCAD light work?" },
      { email: "renz.villanueva@nemsu.edu.ph", text: "Solid deal for IT students. May RAM upgrade na ba?" }
    ],
    reactions: [
      { email: "kyle.navarro@nemsu.edu.ph", type: "interested" },
      { email: "mika.santos@nemsu.edu.ph", type: "like" },
      { email: "bea.solis@nemsu.edu.ph", type: "love" }
    ]
  },
  {
    authorEmail: "kyle.navarro@nemsu.edu.ph",
    title: "Engineering drawing set bundle",
    description: "Complete drafting tools for first-year engineering students. T-square, triangles, compass, and technical pens included.",
    price: 1450,
    category: "school-supplies",
    type: "sell",
    condition: "like-new",
    location: "Tandag Main Library",
    images: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"],
    comments: [
      { email: "aira.mendoza@nemsu.edu.ph", text: "Nice bundle. Good for incoming freshmen." },
      { email: "janelle.cruz@nemsu.edu.ph", text: "Can reserve until Friday?" }
    ],
    reactions: [
      { email: "aira.mendoza@nemsu.edu.ph", type: "like" },
      { email: "janelle.cruz@nemsu.edu.ph", type: "interested" }
    ]
  },
  {
    authorEmail: "mika.santos@nemsu.edu.ph",
    title: "Looking for secondhand lab coat",
    description: "Need clean medium-size lab coat for agriculture lab. Prefer Bislig meetup, but can coordinate through friends.",
    price: 350,
    category: "clothing",
    type: "buy",
    condition: "used-good",
    location: "Bislig Campus",
    images: ["https://images.unsplash.com/photo-1581093458791-9d42cc0309bc?auto=format&fit=crop&w=1200&q=80"],
    comments: [
      { email: "bea.solis@nemsu.edu.ph", text: "I have one from last sem. Will message you." },
      { email: "aira.mendoza@nemsu.edu.ph", text: "Try posting sa Agri group din." }
    ],
    reactions: [
      { email: "bea.solis@nemsu.edu.ph", type: "interested" },
      { email: "kyle.navarro@nemsu.edu.ph", type: "wow" }
    ]
  },
  {
    authorEmail: "janelle.cruz@nemsu.edu.ph",
    title: "Marine biology field notebook set",
    description: "Water-resistant notebooks and waterproof pen set for field observations. Used once during coastal survey.",
    price: 780,
    category: "books",
    type: "sell",
    condition: "like-new",
    location: "Lianga Campus",
    images: ["https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80"],
    comments: [
      { email: "mika.santos@nemsu.edu.ph", text: "Useful for our field notes too. Nice!" },
      { email: "renz.villanueva@nemsu.edu.ph", text: "Waterproof pen included?" }
    ],
    reactions: [
      { email: "mika.santos@nemsu.edu.ph", type: "love" },
      { email: "renz.villanueva@nemsu.edu.ph", type: "like" }
    ]
  },
  {
    authorEmail: "renz.villanueva@nemsu.edu.ph",
    title: "Solar project components kit",
    description: "Small solar panel, charge controller, wires, and multimeter leads. Great for renewable energy prototypes.",
    price: 2200,
    category: "electronics",
    type: "sell",
    condition: "used-good",
    location: "Cantilan Workshop",
    images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80"],
    comments: [
      { email: "kyle.navarro@nemsu.edu.ph", text: "Pwede for capstone demo?" },
      { email: "aira.mendoza@nemsu.edu.ph", text: "This looks good for IoT projects." }
    ],
    reactions: [
      { email: "kyle.navarro@nemsu.edu.ph", type: "interested" },
      { email: "aira.mendoza@nemsu.edu.ph", type: "wow" },
      { email: "janelle.cruz@nemsu.edu.ph", type: "like" }
    ]
  },
  {
    authorEmail: "bea.solis@nemsu.edu.ph",
    title: "Dorm study table and chair",
    description: "Compact study table with chair. Clean, sturdy, and easy to move. Best for boarding house setup.",
    price: 1600,
    category: "furniture",
    type: "sell",
    condition: "used-good",
    location: "Tagbina Campus",
    images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80"],
    comments: [
      { email: "janelle.cruz@nemsu.edu.ph", text: "Perfect size for dorm rooms." },
      { email: "mika.santos@nemsu.edu.ph", text: "Can you send dimensions?" }
    ],
    reactions: [
      { email: "janelle.cruz@nemsu.edu.ph", type: "love" },
      { email: "mika.santos@nemsu.edu.ph", type: "interested" },
      { email: "aira.mendoza@nemsu.edu.ph", type: "like" }
    ]
  }
];

const getOrCreateUsers = async (): Promise<Map<string, IUser>> => {
  const users = new Map<string, IUser>();

  for (const demoUser of demoUsers) {
    const existing = await User.findOne({ email: demoUser.email });
    if (existing) {
      users.set(demoUser.email, existing);
      continue;
    }

    const created = await User.create({
      ...demoUser,
      password,
      verificationStatus: "verified",
      verificationSubmittedAt: new Date(),
      verificationReviewedAt: new Date()
    });
    users.set(demoUser.email, created);
  }

  const allUsers = Array.from(users.values());
  for (const user of allUsers) {
    user.friends = allUsers.filter((friend) => friend._id.toString() !== user._id.toString()).map((friend) => friend._id);
    await user.save({ validateBeforeSave: false });
  }

  return users;
};

export const seedDemoData = async (): Promise<void> => {
  const existingDemoPosts = await Post.countDocuments({ title: { $in: demoPosts.map((post) => post.title) } });
  if (existingDemoPosts > 0) {
    return;
  }

  const users = await getOrCreateUsers();

  for (const post of demoPosts) {
    const author = users.get(post.authorEmail);
    if (!author) continue;

    await Post.create({
      author: author._id,
      title: post.title,
      description: post.description,
      price: post.price,
      category: post.category,
      type: post.type,
      images: post.images,
      condition: post.condition,
      location: post.location,
      status: "active",
      views: 24 + Math.floor(Math.random() * 120),
      shares: 1 + Math.floor(Math.random() * 9),
      comments: post.comments
        .map((comment) => {
          const user = users.get(comment.email);
          return user ? { user: user._id, text: comment.text, createdAt: new Date() } : null;
        })
        .filter((comment): comment is { user: Types.ObjectId; text: string; createdAt: Date } => Boolean(comment)),
      reactions: post.reactions
        .map((reaction) => {
          const user = users.get(reaction.email);
          return user ? { user: user._id, type: reaction.type } : null;
        })
        .filter((reaction): reaction is { user: Types.ObjectId; type: ReactionType } => Boolean(reaction))
    });
  }

  console.log("Demo users, posts, comments, and reactions seeded");
};
