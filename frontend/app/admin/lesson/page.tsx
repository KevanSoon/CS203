"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Monitor,
  FileText,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  TrendingUp,
  Activity,
  GraduationCap,
  Bell,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";

export const AdminLessonPage = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? "dark" : ""}`}>
      <div className="flex w-full bg-background text-foreground">
        <Sidebar />
        <LessonContent isDark={isDark} setIsDark={setIsDark} />
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Lessons");

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? "w-64" : "w-16"
      } border-border bg-sidebar p-2 shadow-sm`}
    >
      <TitleSection open={open} />

      <div className="space-y-1 mb-8">
        <Option
          Icon={Home}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={BookOpen}
          title="Lessons"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={3}
        />
        <Option
          Icon={Monitor}
          title="Preview"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FileText}
          title="Content"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Tag}
          title="Categories"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={BarChart3}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Users}
          title="Students"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={12}
        />
      </div>

      {open && (
        <div className="border-t border-border pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Account
          </div>
          <Option
            Icon={Settings}
            title="Settings"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={HelpCircle}
            title="Help & Support"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

interface OptionProps {
  Icon: React.ElementType;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
}

const Option = ({
  Icon,
  title,
  selected,
  setSelected,
  open,
  notifs,
}: OptionProps) => {
  const isSelected = selected === title;

  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isSelected
          ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>

      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

interface TitleSectionProps {
  open: boolean;
}

const TitleSection = ({ open }: TitleSectionProps) => {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-muted">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div
              className={`transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-foreground">
                    Simi Slang?
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Admin Portal
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
      <GraduationCap className="h-5 w-5 text-primary-foreground" />
    </div>
  );
};

interface ToggleCloseProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ToggleClose = ({ open, setOpen }: ToggleCloseProps) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-border transition-colors hover:bg-muted"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-muted-foreground ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-muted-foreground transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};

interface LessonContentProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const LessonContent = ({ isDark, setIsDark }: LessonContentProps) => {
  return (
    <div className="flex-1 bg-background p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Lesson Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your lessons
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-1">
            Total Lessons
          </h3>
          <p className="text-2xl font-bold text-foreground">48</p>
          <p className="text-sm text-secondary mt-1">+5 this month</p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-1">
            Active Students
          </h3>
          <p className="text-2xl font-bold text-foreground">1,234</p>
          <p className="text-sm text-secondary mt-1">+12% from last week</p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent/20 rounded-lg">
              <GraduationCap className="h-5 w-5 text-accent" />
            </div>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-1">
            Completions
          </h3>
          <p className="text-2xl font-bold text-foreground">892</p>
          <p className="text-sm text-secondary mt-1">+8% from yesterday</p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-1">Avg. Score</h3>
          <p className="text-2xl font-bold text-foreground">85%</p>
          <p className="text-sm text-secondary mt-1">+3% improvement</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Recent Activity
              </h3>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: BookOpen,
                  title: "New lesson published",
                  desc: "Hokkien Basics - Greetings",
                  time: "2 min ago",
                  color: "primary",
                },
                {
                  icon: Users,
                  title: "New student enrolled",
                  desc: "john.doe@example.com joined",
                  time: "5 min ago",
                  color: "secondary",
                },
                {
                  icon: GraduationCap,
                  title: "Lesson completed",
                  desc: "Singlish 101 - Food Terms",
                  time: "10 min ago",
                  color: "accent",
                },
                {
                  icon: Activity,
                  title: "Quiz submitted",
                  desc: "Student scored 95% on Lesson 3",
                  time: "1 hour ago",
                  color: "primary",
                },
                {
                  icon: Bell,
                  title: "Feedback received",
                  desc: "5-star rating on Malay Slang lesson",
                  time: "2 hours ago",
                  color: "accent",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activity.color === "primary"
                        ? "bg-primary/10"
                        : activity.color === "secondary"
                          ? "bg-secondary/20"
                          : "bg-accent/20"
                    }`}
                  >
                    <activity.icon
                      className={`h-4 w-4 ${
                        activity.color === "primary"
                          ? "text-primary"
                          : activity.color === "secondary"
                            ? "text-secondary"
                            : "text-accent"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.desc}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Completion Rate
                </span>
                <span className="text-sm font-medium text-foreground">72%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "72%" }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Engagement Rate
                </span>
                <span className="text-sm font-medium text-foreground">85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-secondary h-2 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Quiz Pass Rate
                </span>
                <span className="text-sm font-medium text-foreground">68%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Popular Lessons
            </h3>
            <div className="space-y-3">
              {[
                "Singlish 101 - Basics",
                "Hokkien Greetings",
                "Malay Food Terms",
                "Tamil Expressions",
              ].map((lesson, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm text-muted-foreground">{lesson}</span>
                  <span className="text-sm font-medium text-foreground">
                    {Math.floor(Math.random() * 500 + 100)} views
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLessonPage;
