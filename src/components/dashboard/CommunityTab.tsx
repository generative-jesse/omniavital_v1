import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  parent_id: string | null;
  created_at: string;
  profiles?: { first_name: string | null; ov_tag: string | null } | null;
  replies?: ForumPost[];
}

const CommunityTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const fetchPosts = async () => {
    // Get top-level posts
    const { data: topPosts } = await supabase
      .from("forum_posts")
      .select("*, profiles:user_id(first_name, ov_tag)")
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (topPosts && topPosts.length > 0) {
      // Get replies for these posts
      const postIds = topPosts.map((p) => p.id);
      const { data: replies } = await supabase
        .from("forum_posts")
        .select("*, profiles:user_id(first_name, ov_tag)")
        .in("parent_id", postIds)
        .order("created_at", { ascending: true });

      const postsWithReplies = topPosts.map((p) => ({
        ...p,
        replies: (replies || []).filter((r) => r.parent_id === p.id),
      }));
      setPosts(postsWithReplies as any);
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!user || !title.trim() || !body.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("forum_posts").insert({
      user_id: user.id,
      title: title.trim(),
      body: body.trim(),
    });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setTitle("");
      setBody("");
      fetchPosts();
    }
    setPosting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyBody.trim()) return;
    await supabase.from("forum_posts").insert({
      user_id: user.id,
      title: "Reply",
      body: replyBody.trim(),
      parent_id: parentId,
    });
    setReplyBody("");
    fetchPosts();
  };

  const displayName = (p: ForumPost) =>
    p.profiles?.ov_tag ? `@${p.profiles.ov_tag}` : p.profiles?.first_name || "Member";

  if (loading) return <div className="text-muted-foreground text-sm">Loading community...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-wide text-foreground mb-1">The Collective</h2>
      <p className="text-sm text-muted-foreground mb-8">Connect with fellow OmniaVital members</p>

      {/* New post */}
      <div className="glass rounded-xl p-5 mb-8">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Thread title..."
          className="bg-secondary border-border mb-3"
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts, ask questions, or start a discussion..."
          className="bg-secondary border-border mb-3 min-h-[80px]"
        />
        <button
          onClick={handlePost}
          disabled={posting || !title.trim() || !body.trim()}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
        >
          <Send size={13} />
          Post
        </button>
      </div>

      {/* Posts feed */}
      {posts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <MessageSquare size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">No posts yet</p>
          <p className="text-sm text-muted-foreground">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="glass rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary">{displayName(post)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{post.body}</p>

                <button
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedPost === post.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {post.replies?.length || 0} replies
                </button>
              </div>

              {expandedPost === post.id && (
                <div className="border-t border-border bg-secondary/30 p-4 space-y-3">
                  {post.replies?.map((reply) => (
                    <div key={reply.id} className="pl-4 border-l-2 border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-primary">{displayName(reply)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reply.body}</p>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <Input
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write a reply..."
                      className="bg-secondary border-border text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleReply(post.id)}
                    />
                    <button
                      onClick={() => handleReply(post.id)}
                      disabled={!replyBody.trim()}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs disabled:opacity-50"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityTab;
