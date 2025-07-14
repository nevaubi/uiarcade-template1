import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find all posts that should be published (publish_date <= now() and is_published = false)
    const { data: postsToPublish, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, publish_date')
      .eq('is_published', false)
      .not('publish_date', 'is', null)
      .lte('publish_date', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      throw fetchError
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No scheduled posts to publish',
          published_count: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update posts to published status
    const postIds = postsToPublish.map(post => post.id)
    
    const { data: updatedPosts, error: updateError } = await supabase
      .from('blog_posts')
      .update({ 
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .in('id', postIds)
      .select('id, title')

    if (updateError) {
      console.error('Error updating posts:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully published ${updatedPosts?.length || 0} scheduled posts`,
        published_count: updatedPosts?.length || 0,
        published_posts: updatedPosts
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in publish-scheduled-posts function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        published_count: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})