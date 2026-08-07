import { supabase } from '../lib/supabase.js';
import { calculateCompatibility } from '../lib/readerIntelligence.js';

function ensure(error) {
  if (error) throw error;
}

export function formatRelativeTime(date) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'agora';
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `há ${Math.floor(seconds / 86400)} dias`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date));
}

function normalizePost(row, likedIds, savedIds) {
  const profile = row.author;
  return {
    id: row.id,
    autorId: row.author_id,
    autor: profile?.display_name || 'Leitor',
    usuario: profile?.username ? `@${profile.username}` : '',
    avatar: profile?.avatar_url || null,
    tempo: formatRelativeTime(row.created_at),
    tipo: row.type,
    tag: { texto: row.type === 'publicacao' ? 'Publicação' : row.type[0].toUpperCase() + row.type.slice(1), classe: `post__tag--${row.type === 'publicacao' ? 'resenha' : row.type}` },
    texto: row.content,
    livro: row.book ? { id: row.book.id, title: row.book.title, author: row.book.author, cover_url: row.book.cover_url, titulo: row.book.title, autor: row.book.author, capa: row.book.cover_url } : null,
    curtidas: row.post_likes?.[0]?.count || 0,
    comentarios: row.comments?.[0]?.count || 0,
    curtido: likedIds.has(row.id),
    salvo: savedIds.has(row.id),
    createdAt: row.created_at,
    spoilerProgress: row.spoiler_progress,
    spoilerChapter: row.spoiler_chapter,
    opcoesEnquete: (row.poll_options || [])
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        id: option.id,
        texto: option.label,
        votos: option.poll_votes?.length || 0,
        votada: option.poll_votes?.some((vote) => vote.user_id === row.viewer_id) || false,
      })),
  };
}

const POST_SELECT = 'id,author_id,book_id,type,content,created_at,spoiler_progress,spoiler_chapter,author:profiles!posts_author_id_fkey(id,display_name,username,avatar_url),book:books(id,title,author,cover_url),post_likes(count),comments(count),poll_options(id,label,position,poll_votes(user_id))';

export async function getFeed(userId, filter = 'para-voce') {
  let authorIds = null;
  if (filter === 'seguindo') {
    const { data, error } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
    ensure(error);
    authorIds = data.map((item) => item.following_id);
    if (!authorIds.length) return [];
  }

  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .limit(30);
  if (authorIds) query = query.in('author_id', authorIds);
  if (filter === 'populares') query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  ensure(error);

  const ids = data.map((post) => post.id);
  if (!ids.length) return [];
  const [{ data: likes, error: likesError }, { data: saves, error: savesError }] = await Promise.all([
    supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', ids),
    supabase.from('saved_posts').select('post_id').eq('user_id', userId).in('post_id', ids),
  ]);
  ensure(likesError || savesError);
  const bookIds = [...new Set(data.map((row) => row.book_id).filter(Boolean))];
  const { data: progressRows } = bookIds.length ? await supabase.from('user_books').select('book_id,progress').eq('user_id', userId).in('book_id', bookIds) : { data: [] };
  const progressByBook = new Map((progressRows || []).map((item) => [item.book_id, item.progress]));
  return data.map((row) => ({ ...normalizePost({ ...row, viewer_id: userId }, new Set(likes.map((x) => x.post_id)), new Set(saves.map((x) => x.post_id))), spoilerLocked: row.spoiler_progress != null && (progressByBook.get(row.book_id) || 0) < row.spoiler_progress }));
}

export async function getPostsByUser(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });
  ensure(error);
  return data.map((row) => normalizePost(row, new Set(), new Set()));
}

export async function getPostsByBook(bookId, userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });
  ensure(error);
  if (!data.length) return [];
  const ids = data.map((post) => post.id);
  const [{ data: likes }, { data: saves }] = await Promise.all([
    supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', ids),
    supabase.from('saved_posts').select('post_id').eq('user_id', userId).in('post_id', ids),
  ]);
  const { data: reading } = await supabase.from('user_books').select('progress').eq('user_id', userId).eq('book_id', bookId).maybeSingle();
  return data.map((row) => ({ ...normalizePost({ ...row, viewer_id: userId }, new Set((likes || []).map((x) => x.post_id)), new Set((saves || []).map((x) => x.post_id))), spoilerLocked: row.spoiler_progress != null && (reading?.progress || 0) < row.spoiler_progress }));
}

export async function createPost(userId, { content, type = 'publicacao', bookId = null, clubId = null, pollOptions = [], spoilerProgress = null, spoilerChapter = null }) {
  const { data, error } = await supabase.from('posts').insert({ author_id: userId, content, type, book_id: bookId, club_id: clubId, spoiler_progress: spoilerProgress, spoiler_chapter: spoilerChapter }).select('id').single();
  ensure(error);
  if (type === 'enquete') {
    const options = pollOptions.map((label, position) => ({ post_id: data.id, label: label.trim(), position })).filter((option) => option.label);
    const { error: optionsError } = await supabase.from('poll_options').insert(options);
    if (optionsError) {
      await supabase.from('posts').delete().eq('id', data.id).eq('author_id', userId);
      throw optionsError;
    }
  }
  return data;
}

export async function votePoll(optionId) {
  const { error } = await supabase.rpc('cast_poll_vote', { target_option_id: optionId });
  ensure(error);
}

export async function toggleLike(userId, postId, liked) {
  const result = liked
    ? await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', postId)
    : await supabase.from('post_likes').insert({ user_id: userId, post_id: postId });
  ensure(result.error);
  return !liked;
}

export async function toggleSave(userId, postId, saved) {
  const result = saved
    ? await supabase.from('saved_posts').delete().eq('user_id', userId).eq('post_id', postId)
    : await supabase.from('saved_posts').insert({ user_id: userId, post_id: postId });
  ensure(result.error);
  return !saved;
}

export async function getComments(postId) {
  const { data, error } = await supabase.from('comments').select('id,author_id,content,created_at,author:profiles!comments_author_id_fkey(display_name,username,avatar_url)').eq('post_id', postId).order('created_at');
  ensure(error);
  return data;
}

export async function createComment(userId, postId, content) {
  const { data, error } = await supabase.from('comments').insert({ author_id: userId, post_id: postId, content }).select('id').single();
  ensure(error);
  return data;
}

export async function deleteComment(userId, commentId) {
  const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('author_id', userId);
  ensure(error);
}

export async function deletePost(userId, postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId).eq('author_id', userId);
  ensure(error);
}

export async function getCommunityMessages(clubId) {
  const { data, error } = await supabase
    .from('community_messages')
    .select('id,club_id,author_id,content,created_at,author:profiles!community_messages_author_id_fkey(display_name,username,avatar_url)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(100);
  ensure(error);
  return data.reverse().map((mensagem) => ({ ...mensagem, tempo: formatRelativeTime(mensagem.created_at) }));
}

export async function sendCommunityMessage(userId, clubId, content) {
  const { data, error } = await supabase
    .from('community_messages')
    .insert({ author_id: userId, club_id: clubId, content })
    .select('id')
    .single();
  ensure(error);
  return data;
}

export async function deleteCommunityMessage(userId, messageId) {
  const { error } = await supabase
    .from('community_messages')
    .delete()
    .eq('id', messageId)
    .eq('author_id', userId);
  ensure(error);
}

export function subscribeCommunityMessages(clubId, onChange) {
  const channel = supabase
    .channel(`club-chat-${clubId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages', filter: `club_id=eq.${clubId}` }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function getProfileSuggestions(userId) {
  const [{ data: profiles, error }, { data: follows, error: followError }] = await Promise.all([
    supabase.from('profiles').select('id,display_name,username,avatar_url,bio').neq('id', userId).limit(6),
    supabase.from('follows').select('following_id').eq('follower_id', userId),
  ]);
  ensure(error || followError);
  const following = new Set(follows.map((item) => item.following_id));
  return profiles.map((profile) => ({ ...profile, following: following.has(profile.id) }));
}

export async function toggleFollow(userId, profileId, following) {
  const result = following
    ? await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', profileId)
    : await supabase.from('follows').insert({ follower_id: userId, following_id: profileId });
  ensure(result.error);
  return !following;
}

export async function getClubs(userId) {
  const [{ data, error }, { data: memberships, error: memberError }] = await Promise.all([
    supabase.from('clubs').select('id,name,slug,description,cover_url,owner_id,club_members(count)').order('created_at', { ascending: false }),
    supabase.from('club_members').select('club_id').eq('user_id', userId),
  ]);
  ensure(error || memberError);
  const joined = new Set(memberships.map((item) => item.club_id));
  return data.map((club) => ({ ...club, member_count: club.club_members?.[0]?.count || 0, joined: joined.has(club.id) }));
}

export async function createClub(userId, name, description, coverUrl = null, city = null, meetingPlace = null) {
  const slug = `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase.from('clubs').insert({ owner_id: userId, name, description, cover_url: coverUrl, city, meeting_place: meetingPlace, slug }).select().single();
  ensure(error);
  return data;
}

export async function toggleClubMembership(userId, clubId, joined) {
  const result = joined
    ? await supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', userId)
    : await supabase.from('club_members').insert({ club_id: clubId, user_id: userId, role: 'member' });
  ensure(result.error);
  return !joined;
}

export async function getMyClubs(userId) {
  const { data, error } = await supabase.from('club_members').select('club:clubs(id,name,slug)').eq('user_id', userId).limit(5);
  ensure(error);
  return data.map((item) => item.club).filter(Boolean);
}

export async function getBooks(search = '', page = 0, pageSize = 24) {
  let query = supabase.from('books').select('*').order('created_at', { ascending: false }).range(page * pageSize, page * pageSize + pageSize - 1);
  if (search.trim()) query = query.or(`title.ilike.%${search.trim()}%,author.ilike.%${search.trim()}%`);
  const { data, error } = await query;
  ensure(error);
  return data;
}

export async function createBook(userId, book) {
  const { data, error } = await supabase.from('books').insert({ ...book, created_by: userId }).select().single();
  ensure(error);
  return data;
}

export async function getShelf(userId) {
  const { data, error } = await supabase.from('user_books').select('status,progress,rating,updated_at,book:books(*)').eq('user_id', userId).order('updated_at', { ascending: false });
  ensure(error);
  return data.map((item) => ({ ...item.book, status: item.status, progress: item.progress, rating: item.rating }));
}

export async function addToShelf(userId, bookId, status = 'quero-ler') {
  const { error } = await supabase.from('user_books').upsert({ user_id: userId, book_id: bookId, status }, { onConflict: 'user_id,book_id' });
  ensure(error);
}

export async function updateReading(userId, bookId, { status, progress, rating }) {
  const values = { user_id: userId, book_id: bookId, status, progress, rating: rating || null };
  if (status === 'lendo') values.started_at = new Date().toISOString().slice(0, 10);
  if (status === 'lidos') {
    values.progress = 100;
    values.finished_at = new Date().toISOString().slice(0, 10);
  }
  const { error } = await supabase.from('user_books').upsert(values, { onConflict: 'user_id,book_id' });
  ensure(error);
}

export async function getEmotionMap(bookId) {
  const { data, error } = await supabase.from('emotional_checkins').select('emotion,progress').eq('book_id', bookId).order('progress');
  ensure(error);
  return data;
}

export async function saveEmotion(userId, bookId, progress, emotion, note = null) {
  const { error } = await supabase.from('emotional_checkins').upsert({ user_id: userId, book_id: bookId, progress, emotion, note }, { onConflict: 'user_id,book_id,progress' });
  ensure(error);
}

export async function getCompatibility(currentUserId, otherUserId) {
  const [{ data: mine, error: mineError }, { data: theirs, error: theirError }] = await Promise.all([
    supabase.from('user_books').select('book_id,rating,book:books(genre)').eq('user_id', currentUserId),
    supabase.from('user_books').select('book_id,rating,book:books(genre)').eq('user_id', otherUserId),
  ]);
  ensure(mineError || theirError);
  return calculateCompatibility(mine, theirs);
}

export async function blockUser(userId, targetId, blocked) {
  const result = blocked ? await supabase.from('user_blocks').delete().eq('blocker_id', userId).eq('blocked_id', targetId) : await supabase.from('user_blocks').insert({ blocker_id: userId, blocked_id: targetId });
  ensure(result.error); return !blocked;
}

export async function reportContent(userId, targetType, targetId, reason = 'outro') {
  const { error } = await supabase.from('reports').insert({ reporter_id: userId, target_type: targetType, target_id: targetId, reason });
  ensure(error);
}

export async function getLocalClubs(city) {
  let query = supabase.from('clubs').select('id,name,description,city,meeting_place,cover_url').eq('is_private', false).limit(12);
  if (city?.trim()) query = query.ilike('city', `%${city.trim()}%`);
  const { data, error } = await query; ensure(error); return data;
}

export async function recommendByIntent(intent) {
  const mappings = { relaxar: ['Romance','Humor'], estudar: ['História','Ciência'], emocionar: ['Drama','Romance'], debater: ['Filosofia','Política'], rapido: ['Contos','Poesia'], descobrir: [] };
  let query = supabase.from('books').select('*').limit(12);
  const genres = mappings[intent] || [];
  if (genres.length) query = query.in('genre', genres);
  const { data, error } = await query.order('created_at', { ascending: false }); ensure(error); return data;
}

export async function getClubReading(clubId) {
  const { data, error } = await supabase.from('club_readings').select('*,book:books(*)').eq('club_id', clubId).eq('active', true).maybeSingle(); ensure(error); return data;
}

export async function setClubReading(userId, clubId, bookId, targetEndAt) {
  await supabase.from('club_readings').update({ active: false }).eq('club_id', clubId).eq('active', true);
  const { data, error } = await supabase.from('club_readings').insert({ club_id: clubId, book_id: bookId, target_end_at: targetEndAt || null, created_by: userId }).select('*,book:books(*)').single(); ensure(error); return data;
}

export async function getNotifications(userId) {
  const { data, error } = await supabase.from('notifications').select('id,type,read_at,created_at,actor:profiles!notifications_actor_id_fkey(display_name,username,avatar_url)').eq('recipient_id', userId).order('created_at', { ascending: false }).limit(30);
  ensure(error);
  return data;
}

export async function markNotificationsRead(userId) {
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('recipient_id', userId).is('read_at', null);
  ensure(error);
}

export async function getProfileStats(userId) {
  const [books, followers, following, posts] = await Promise.all([
    supabase.from('user_books').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
  ]);
  const error = books.error || followers.error || following.error || posts.error;
  ensure(error);
  return [
    { label: 'Livros', valor: books.count || 0 },
    { label: 'Seguidores', valor: followers.count || 0 },
    { label: 'Seguindo', valor: following.count || 0 },
    { label: 'Posts', valor: posts.count || 0 },
  ];
}
