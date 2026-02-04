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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
          description: error.message || "Failed to analyze content.",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Analysis Error",
          description: data.error,
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-radial-glow opacity-30" />

      <div className="container-narrow relative z-10">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Try It Now
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Analyze Any <span className="gradient-text">News Content</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste a news headline, article excerpt, or URL below to get instant
            AI-powered credibility analysis.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="glass-card p-6 md:p-8 glow-effect">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Enter news text or URL
              </label>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a news headline, article text, or URL here..."
                className="w-full h-32 px-4 py-3 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">
                Try a sample:
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleTexts.map((text, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(text)}
                    className="text-xs px-3 py-1.5 bg-secondary/80 hover:bg-secondary rounded-full border border-border/50 truncate max-w-[200px]"
                  >
                    {text.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isAnalyzing}
              variant="hero"
              size="lg"
              className="w-full"
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`mt-8 rounded-xl ${verdictStyles.bg} border ${verdictStyles.border} flex flex-col`}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${verdictStyles.bg} flex items-center justify-center`}
                    >
                      {verdictStyles.icon && (
                        <verdictStyles.icon
                          className={`h-6 w-6 ${verdictStyles.color}`}
                        />
                      )}
                    </div>

                    <div>
                      <div
                        className={`text-xl font-display font-bold ${verdictStyles.color}`}
                      >
                        {verdictStyles.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {result.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full ${
                          result.verdict === "real"
                            ? "bg-success"
                            : "bg-destructive"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Analysis</span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>

                  {result.redFlags.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">
                          Red Flags Detected
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {result.redFlags.map((flag, index) => (
                          <span
                            key={index}
                            className="text-xs px-3 py-1.5 bg-warning/10 text-warning rounded-full border border-warning/30"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Powered by AI. Results are for informational purposes only.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Demo;
