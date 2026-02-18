"use client";

import { use, useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { LearningPath } from "./components/LearningPath";
import { FlippableCard } from "./components/FlippableCard";

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
  const [selected, setSelected] = useState("View Lessons");
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
            front: "What is a variable?",
            back: "A variable is a container for storing data values. It has a name and can hold different types of data.",
          },
        },
        {
          id: 2,
          type: "lesson",
          status: "completed",
          content: {
            front: "What are data types?",
            back: "Data types specify what kind of data a variable can hold, such as numbers, strings, booleans, etc.",
          },
        },
        {
          id: 3,
          type: "lesson",
          status: "available",
          content: {
            front: "What is a function?",
            back: "A function is a reusable block of code that performs a specific task. It can take inputs and return outputs.",
          },
        },
        {
          id: 4,
          type: "lesson",
          status: "locked",
          content: {
            front: "What are loops?",
            back: "Loops allow you to execute a block of code repeatedly based on a condition.",
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
      title: "Chapter 2: Advanced",
      nodes: [
        {
          id: 6,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is OOP?",
            back: "Object-Oriented Programming is a programming paradigm based on objects containing data and methods.",
          },
        },
        {
          id: 7,
          type: "lesson",
          status: "completed",
          content: {
            front: "What are classes?",
            back: "Classes are blueprints for creating objects. They define properties and methods that objects will have.",
          },
        },
        {
          id: 8,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is inheritance?",
            back: "Inheritance allows a class to inherit properties and methods from another class, promoting code reuse.",
          },
        },
        {
          id: 9,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is polymorphism?",
            back: "Polymorphism allows objects of different classes to be treated as objects of a common superclass.",
          },
        },
        {
          id: 10,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is encapsulation?",
            back: "Encapsulation is the bundling of data and methods that operate on that data within a single unit, restricting direct access.",
          },
        },
        {
          id: 11,
          type: "lesson",
          status: "completed",
          content: {
            front: "What are interfaces?",
            back: "Interfaces define a contract that classes must follow, specifying methods without implementing them.",
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
      title: "Chapter 3: Expert",
      nodes: [
        {
          id: 13,
          type: "lesson",
          status: "completed",
          content: {
            front: "What are design patterns?",
            back: "Design patterns are reusable solutions to commonly occurring problems in software design.",
          },
        },
        {
          id: 14,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is the Singleton pattern?",
            back: "Singleton ensures a class has only one instance and provides a global point of access to it.",
          },
        },
        {
          id: 15,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is the Observer pattern?",
            back: "Observer defines a one-to-many dependency so that when one object changes state, all dependents are notified.",
          },
        },
        {
          id: 16,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is the Factory pattern?",
            back: "Factory provides an interface for creating objects without specifying their concrete classes.",
          },
        },
        {
          id: 17,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is the Strategy pattern?",
            back: "Strategy defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime.",
          },
        },
        {
          id: 18,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is dependency injection?",
            back: "Dependency injection is a technique where an object receives its dependencies from external sources rather than creating them.",
          },
        },
        {
          id: 19,
          type: "lesson",
          status: "completed",
          content: {
            front: "What is SOLID?",
            back: "SOLID is a set of five design principles that help developers create more maintainable and flexible software.",
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
      <Sidebar selected={selected} setSelected={setSelected} />

      <div className="flex-1 bg-gradient-to-b from-background to-accent-light/10 overflow-auto pb-20">
        {/* Lesson Title */}
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            {lessonTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Follow the learning path to master this topic
          </p>
        </div>

        {/* Chapter Selector */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex gap-2 overflow-x-auto pb-2 justify-center md:flex-row flex-col items-center">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapter(index)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all w-full md:w-auto ${
                  selectedChapter === index
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-card text-muted-foreground hover:bg-primary/10 border border-border"
                }`}
              >
                {chapter.title}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div className="max-w-4xl mx-auto px-4">
          <LearningPath
            nodes={currentChapter.nodes}
            onNodeClick={handleNodeClick}
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
    </div>
  );
}
