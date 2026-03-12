import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon,
  SentIcon,
  Copy01Icon,
  Refresh01Icon,
  CheckmarkCircle01Icon,
  Loading01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { generateArticleContent } from '@/services/geminiService';

interface ContentSuggestion {
  title: string;
  content: string;
  tags: string[];
}

export const AIContentAssistant: React.FC = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<'article' | 'dua' | 'lesson' | 'guide'>('article');
  const [language, setLanguage] = useState<'khmer' | 'english' | 'arabic'>('khmer');
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);

  const contentTypeOptions = [
    { id: 'article', label: 'Article', icon: '📄' },
    { id: 'dua', label: 'Dua (Supplication)', icon: '🤲' },
    { id: 'lesson', label: 'Lesson', icon: '📚' },
    { id: 'guide', label: 'Guide', icon: '🗺️' },
  ];

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a topic or prompt', 'warning');
      return;
    }

    setLoading(true);
    try {
      const enhancedPrompt = `Create a ${contentType} about "${prompt}" in ${language} language. Make it educational, inspiring, and suitable for an Islamic platform.`;
      const content = await generateArticleContent(enhancedPrompt);

      if (content) {
        const newSuggestion: ContentSuggestion = {
          title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${prompt}`,
          content: content,
          tags: [contentType, language, ...prompt.split(' ').slice(0, 3)],
        };
        setSuggestions([newSuggestion, ...suggestions]);
        setSelectedSuggestion(newSuggestion);
        showToast('Content generated successfully!', 'success');
      } else {
        showToast('Failed to generate content', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error generating content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const useContent = () => {
    if (selectedSuggestion) {
      // This would typically navigate to a post creation form
      showToast('Content ready to use. Navigate to create post.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.5} className="w-8 h-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold font-khmer">AI Content Assistant</h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} dark:text-slate-400`}>
            Generate Islamic content with AI assistance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b">
            <h3 className="font-bold">Content Generator</h3>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {contentTypeOptions.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id as any)}
                    className={`p-3 rounded-lg text-sm font-bold transition-all text-center ${
                      contentType === type.id
                        ? 'bg-emerald-600 text-white'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } dark:text-slate-400`}
                  >
                    <span className="text-lg block mb-1">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                } focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
              >
                <option value="khmer">Khmer (ខ្មែរ)</option>
                <option value="english">English</option>
                <option value="arabic">Arabic (العربية)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Topic or Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Benefits of Quran recitation, Islamic etiquette..."
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                } focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
              />
            </div>

            <button
              onClick={handleGenerateContent}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                loading
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              } dark:text-slate-400`}
            >
              {loading ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.5} className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Content Display */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b flex items-center justify-between">
            <h3 className="font-bold">Generated Content</h3>
            {selectedSuggestion && (
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(selectedSuggestion.content)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  } dark:text-white`}
                  title="Copy"
                >
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleGenerateContent()}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  } dark:text-white`}
                  title="Regenerate"
                >
                  <HugeiconsIcon icon={Refresh01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {selectedSuggestion ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold mb-2">{selectedSuggestion.title}</h4>
                  <div
                    className={`prose prose-sm max-w-none p-4 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-gray-50 text-gray-900'
                    } dark:bg-slate-800 dark:text-white`}
                    dangerouslySetInnerHTML={{ __html: selectedSuggestion.content }}
                  />
                </div>

                <div>
                  <h5 className="font-bold mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedSuggestion.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          theme === 'dark'
                            ? 'bg-emerald-900/30 text-emerald-400'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={useContent}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.5} className="w-5 h-5" />
                  Use This Content
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.5} className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} dark:text-slate-400`}>
                  Enter a topic and click "Generate Content" to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Previous Suggestions */}
      {suggestions.length > 1 && (
        <Card>
          <CardHeader className="border-b">
            <h3 className="font-bold">Previous Suggestions</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {suggestions.slice(1).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSuggestion(suggestion)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedSuggestion === suggestion
                      ? `border-emerald-600 ${theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50'}`
                      : `border-gray-200 dark:border-slate-800 ${
                          theme === 'dark'
                            ? 'hover:bg-slate-800'
                            : 'hover:bg-gray-50'
                        }`
                  }`}
                >
                  <p className="font-bold text-sm">{suggestion.title}</p>
                  <p className={`text-xs mt-1 line-clamp-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  } dark:text-slate-400`}>
                    {suggestion.content.replace(/<[^>]*>/g, '')}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
