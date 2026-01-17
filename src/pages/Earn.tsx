import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Video, Trophy, Heart, Share2, CheckCircle2, Coins, Sparkles } from "lucide-react";
import { mockTasks, useDreamStore } from "@/lib/store";

const iconMap: Record<string, React.ElementType> = {
  play: Play,
  video: Video,
  trophy: Trophy,
  heart: Heart,
  share: Share2,
};

interface Task {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'available' | 'completed';
  icon: string;
}

export default function Earn() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks.map(t => ({ ...t, status: 'available' as const })));
  const addEarning = useDreamStore((state) => state.addEarning);
  const totalEarned = useDreamStore((state) => state.totalEarned);
  const availableBalance = useDreamStore((state) => state.availableBalance);

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === "completed") return;

    // Simulate task completion
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "completed" as const } : t
      )
    );

    addEarning({
      type: "challenge",
      amount: task.amount,
      description: task.title,
    });
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalPossible = tasks.reduce((acc, t) => acc + t.amount, 0);

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Beta Badge */}
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Earn More
            </h1>
            <p className="text-muted-foreground text-sm">
              Complete tasks to boost your earnings
            </p>
          </motion.div>
          <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/50">
            <span className="text-xs font-medium text-primary">Beta Rewards</span>
          </div>
        </div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="earning" className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-gradient-gold">₦{availableBalance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-lg font-semibold text-foreground">₦{totalEarned.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Unlimited beta note */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
                <Sparkles className="w-4 h-4 text-success" />
                <p className="text-xs text-success">
                  Unlimited beta rewards! No daily cap during testing.
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                {completedCount}/{tasks.length} tasks completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Available Tasks
          </h2>
          
          {tasks.map((task, index) => {
            const Icon = iconMap[task.icon] || Play;
            const isCompleted = task.status === "completed";

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card variant={isCompleted ? "default" : "gradient"} className={isCompleted ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isCompleted ? "bg-success/20" : "bg-primary/20"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        ) : (
                          <Icon className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-lg font-bold ${isCompleted ? "text-success" : "text-gradient-gold"}`}>
                          ₦{task.amount}
                        </span>
                        {!isCompleted && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => completeTask(task.id)}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Potential earnings note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border"
        >
          <p className="text-sm text-muted-foreground text-center">
            Complete all tasks to earn <span className="text-primary font-semibold">₦{totalPossible}</span>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            ⚠️ Beta rewards - final earning structure may change
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
