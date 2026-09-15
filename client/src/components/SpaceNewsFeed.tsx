import { useQuery } from "@tanstack/react-query";
import { Globe, ExternalLink, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface NewsArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  creator: string;
  categories: string[];
  imageUrl: string | null;
}

interface NewsResponse {
  articles: NewsArticle[];
  cached: boolean;
  lastUpdated: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}

export default function SpaceNewsFeed() {
  const { isProOrHigher } = useSubscription();
  const maxArticles = 2;
  
  const { data, isLoading, error } = useQuery<NewsResponse>({
    queryKey: ['/api/spacenews', { limit: 10 }],
  });

  if (error) {
    return null;
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm" data-testid="spacenews-card">
      <CardHeader className="pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-rail-red" />
            <span>SpaceNews</span>
          </CardTitle>
          <a 
            href="https://spacenews.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-rail-red transition-colors flex items-center gap-1"
            data-testid="spacenews-link"
          >
            via SpaceNews
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-2">
              <Skeleton className="h-16 w-16 bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-3 w-3/4 bg-gray-200" />
                <Skeleton className="h-3 w-1/4 bg-gray-200" />
              </div>
            </div>
          ))
        ) : data?.articles && data.articles.length > 0 ? (
          data.articles.slice(0, maxArticles).map((article) => (
            <a
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-2 hover:bg-gray-50 border-l-2 border-transparent hover:border-rail-red transition-all group"
              data-testid={`spacenews-article-${article.id}`}
            >
              {article.imageUrl ? (
                <div className="w-16 h-16 overflow-hidden flex-shrink-0 bg-gray-100">
                  <img 
                    src={article.imageUrl} 
                    alt={`Space news: ${article.title || 'industry article thumbnail'}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-rail-red transition-colors leading-snug">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{formatTimeAgo(article.pubDate)}</span>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No news articles available
          </div>
        )}
        
        <a 
          href="https://spacenews.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-rail-red/50 transition-all" data-testid="read-more-spacenews-button">
            Read More on SpaceNews
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
