"use client";

import { use, useState, useEffect } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { LearningPath } from "./components/LearningPath";
import { FlippableCard } from "./components/FlippableCard";
import { AIChatAssistant } from "./components/AIChatAssistant";
import { MessageCircle } from "lucide-react";

interface Chapter {
  id: number;
  title: string;
  nodes: Node[];
}

interface Node {
  id: number;
  type: "lesson" | "quiz";
  status: "locked" | "available" | "completed";
  content?: {
    front: string;
    back: string;
  };
}

export default function LessonRoadmapPage({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = use(params);
  const [selected, setSelected] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mock data - replace with API call
  const chapters: Chapter[] = [
    {
      id: 1,
      title: "Chapter 1: Basics",
      nodes: [
        {
          id: 1,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Rizz' mean?",
            back: "Eh, Rizz is like charisma lah. Means the person damn smooth, can attract people one. Like that friend who talk cock also can make people like them. Confirm got rizz.",
          },
        },
        {
          id: 2,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Skibidi' mean?",
            back: "Wah this one come from some viral YouTube video lah. Basically it's like a nonsense word, you use it when something damn weird or funny. Like 'alamak so skibidi' — means very siao lah.",
          },
        },
        {
          id: 3,
          type: "lesson",
          status: "available",
          content: {
            front: "What does 'Ohio' mean in slang?",
            back: "Ohio means something damn weird or cursed lah. If you say 'wah this one so Ohio', it's like saying 'walao eh, this one damn jialat and strange sia'.",
          },
        },
        {
          id: 4,
          type: "lesson",
          status: "locked",
          content: {
            front: "What does 'Gyatt' mean?",
            back: "Gyatt is like when you see someone and you go 'walao eh!' It's short for 'god dayum'. Basically you tio stunned by how someone look lah. Confirm say until cannot close mouth.",
          },
        },
        {
          id: 5,
          type: "quiz",
          status: "locked",
        },
      ],
    },
    {
      id: 2,
      title: "Chapter 2: Intermediate",
      nodes: [
        {
          id: 6,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Sigma' mean?",
            back: "Sigma is that one person who lone ranger one lah. Don't follow the crowd, do their own thing. Like that uncle at hawker centre eat alone, don't care what people think. Very ownself boss ownself.",
          },
        },
        {
          id: 7,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Mewing' mean?",
            back: "Mewing ah, is when you press your tongue on the top of your mouth, supposed to make your jawline more sharp. All the kids doing it now lah. Like doing exercise for your face liddat. Got use or not, who knows sia.",
          },
        },
        {
          id: 8,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Fanum Tax' mean?",
            back: "Fanum Tax is when your friend come and chope your food without asking lah! Like you buy chicken rice, then kena tax — they just take one piece. Named after some streamer who always curi his friend's food. Damn jialat right.",
          },
        },
        {
          id: 9,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Cap / No Cap' mean?",
            back: "Cap means you bluffing lah. Like 'don't cap leh' means 'don't bluff'. No cap means you speaking the truth, confirm plus chop. Same as saying 'seriously ah, I not lying one'.",
          },
        },
        {
          id: 10,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Slay' mean?",
            back: "Slay means you damn power lah, you nailed it! Like if your friend wear new outfit and look damn chio, you say 'wah you slay sia'. Means they confirm on point, shiok to the max.",
          },
        },
        {
          id: 11,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Skibidi Ohio Rizz' mean?",
            back: "Wah if someone call you 'Skibidi Ohio Rizz', means you damn weird lah. It's like stacking all the siao words together to say you very the strange. Confirm plus guarantee chop — you acting damn paiseh sia.",
          },
        },
        {
          id: 12,
          type: "quiz",
          status: "available",
        },
      ],
    },
    {
      id: 3,
      title: "Chapter 3: Advanced",
      nodes: [
        {
          id: 13,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Bussin' mean?",
            back: "Bussin means damn shiok lah, especially when talking about food. Like you eat laksa and it's so good you say 'wah this one bussin sia'. Same energy as 'sedap gila'.",
          },
        },
        {
          id: 14,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Bet' mean?",
            back: "Bet is like saying 'can' or 'on lah'. Your friend ask 'want go makan?' you just reply 'bet' — means confirm going. Same same as 'okay steady, let's go'.",
          },
        },
        {
          id: 15,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Sus' mean?",
            back: "Sus means suspicious lah, like the person damn fishy. Come from that Among Us game one. If your friend acting weird you say 'eh you damn sus sia'. Same as saying 'wah this one got something to hide ah'.",
          },
        },
        {
          id: 16,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'W / L' mean?",
            back: "W is Win, L is Loss lah. If something good happen, you say 'big W sia'. If jialat, then it's an L. Like you get A for exam — that's a W. Kena caught by teacher — confirm L already.",
          },
        },
        {
          id: 17,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Brainrot' mean?",
            back: "Brainrot is when you scroll TikTok until your brain rosak already lah. You watch so much meme content until you talk like the internet. Everything also 'skibidi' this, 'sigma' that. Your parents confirm don't understand what you saying.",
          },
        },
        {
          id: 18,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'Aura' mean?",
            back: "Aura is like your swag level lah. You do something cool, you gain aura points. You do something paiseh, minus aura already. Like if you trip and fall in front of your crush — wah that one lose 1000 aura sia.",
          },
        },
        {
          id: 19,
          type: "lesson",
          status: "completed",
          content: {
            front: "What does 'GOAT' mean?",
            back: "GOAT means Greatest Of All Time lah. Like the best of the best. If your friend always score well, you say 'you the GOAT sia'. Confirm number one, no one can fight.",
          },
        },
        {
          id: 20,
          type: "quiz",
          status: "completed",
        },
      ],
    },
  ];

  const currentChapter = chapters[selectedChapter];
  const lessonTitle = decodeURIComponent(title);

  const handleNodeClick = (node: Node) => {
    if (node.status === "locked") return;
    setSelectedNode(node);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        defaultOpen={isDesktop}
        chapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
        selectedChapter={selectedChapter}
        onChapterSelect={setSelectedChapter}
      />

      {/* Left: Roadmap */}
      <div className="flex-1 bg-gradient-to-b from-background to-accent-light/10 overflow-x-hidden overflow-y-auto pb-20">
        {/* Lesson Title */}
        <div className="px-4 pt-8 pb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            {lessonTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Follow the learning path to master this topic
          </p>
        </div>

        {/* Chapter Toast Banner */}
        <div className="px-4 pt-4 pb-8 flex justify-center">
          <div className="relative w-full max-w-md rounded-xl bg-primary border-2 border-primary-dark px-6 py-3 shadow-[0_4px_0_0_var(--color-primary-dark)] overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                {`Chapter ${selectedChapter + 1}`}
              </p>
              <p className="text-lg font-bold text-white">
                {currentChapter.title}
              </p>
            </div>
            <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]" />
          </div>
        </div>

        {/* Learning Path */}
        <div className="px-4 flex justify-center">
          <LearningPath
            nodes={currentChapter.nodes}
            onNodeClick={handleNodeClick}
            showMascot={selectedChapter === 0}
          />
        </div>

        {/* Flippable Card Modal */}
        {selectedNode && (
          <FlippableCard
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Right: AI Chat Assistant - Desktop */}
      <div className="hidden lg:block w-96 shrink-0 p-4">
        <div className="sticky top-4 h-[calc(100vh-2rem)]">
          <AIChatAssistant />
        </div>
      </div>

      {/* Mobile Chat Bubble */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Chat Overlay */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md h-[70vh]">
            <AIChatAssistant onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
