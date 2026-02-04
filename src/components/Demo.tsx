import { useState, useRef, useEffect } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "./ScrollReveal";
import { motion } from "framer-motion";

interface AnalysisResult {
  verdict: "real" | "fake" | "uncertain";
  confidence: number;
  explanation: string;
  redFlags: string[];
}

const Demo = () => {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  // ✅ NEW: textarea ref
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ NEW: auto-focus when arriving via #demo
  useEffect(() => {
    if (window.location.hash === "#demo") {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, []);

  const sampleTexts = [
    "Scientists discover new planet made entirely of diamonds orbiting nearby star",
    "Local community raises funds for new children's hospital wing",
    "BREAKING: Government announces mandatory microchip implants for all citizens by 2025",
  ];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-news", {
        body: { text: inputText.trim() },
      });

      if (error) {
        toast({
          title: "Analysis Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setResult(data as AnalysisResult);
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictStyles = () => {
    if (!result) return {};
    switch (result.verdict) {
      case "real":
        return {
          icon: CheckCircle2,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/30",
          label: "Likely Authentic",
        };
      case "fake":
        return {
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          label: "Likely Misinformation",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/30",
          label: "Uncertain",
        };
    }
  };

  const verdictStyles = getVerdictStyles();

  return (
    <section id="demo" className="section-padding relative">
      <div className="container-narrow relative z-10">
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-6">
            Analyze Any <span className="gradient-text">News Content</span>
          </h2>
          <p className="text-muted-foreground">
            Paste a headline, article excerpt, or URL to analyze credibility.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="glass-card p-8">
            {/* ✅ TEXTAREA WITH REF */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a news headline, article text, or URL here..."
              className="w-full h-32 px-4 py-3 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <Button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isAnalyzing}
              variant="hero"
              size="lg"
              className="w-full mt-6"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Check Credibility
                </>
              )}
            </Button>

            {result && (
              <motion.div
                className={`mt-8 p-6 rounded-xl ${verdictStyles.bg} border ${verdictStyles.border}`}
              >
                <div className="text-xl font-bold mb-2">
                  {verdictStyles.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.explanation}
                </p>
              </motion.div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Demo;
