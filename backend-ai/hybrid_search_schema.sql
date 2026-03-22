-- ============================================================
-- SUPABASE HYBRID SEARCH SCHEMA
-- Complete setup for vector store with RRF hybrid search
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================


-- ============================================================
-- STEP 1: Enable pgvector in Database extensions
-- ============================================================


-- ============================================================
-- STEP 2: Create the documents table
-- ============================================================
-- We are using google/embeddinggemma-300M with 768 vector dimensions
-- ============================================================
create table documents (
  id bigint primary key generated always as identity,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  fts tsvector generated always as (to_tsvector('english', content)) stored,
  embedding extensions.vector(768),
  created_at timestamptz default now()
);

-- Add a comment for documentation
comment on table documents is 'Stores documents with full-text search and vector embeddings for hybrid search';
comment on column documents.fts is 'Auto-generated tsvector from content column for keyword search';
comment on column documents.embedding is 'Vector embedding generated from your embedding model (512 dimensions)';
comment on column documents.metadata is 'Optional JSON metadata for filtering (e.g. source, category, user_id)';


-- ============================================================
-- STEP 3: Create indexes for performance
-- ============================================================

-- GIN index for full-text keyword search
create index idx_documents_fts on documents using gin(fts);

-- HNSW index for semantic vector search (inner product operator)
-- NOTE: If you prefer cosine distance (<=>) instead of inner product (<#>),
--       change vector_ip_ops to vector_cosine_ops here
--       AND update the <#> operator in the hybrid_search function to <=>
create index idx_documents_embedding on documents using hnsw (embedding vector_ip_ops);

-- Index on metadata for filtered queries (optional but recommended)
create index idx_documents_metadata on documents using gin(metadata);

-- Index on created_at for time-based queries (optional)
create index idx_documents_created_at on documents (created_at desc);


-- ============================================================
-- STEP 4: Create the hybrid search function (RRF)
-- ============================================================
create or replace function hybrid_search(
  query_text text,
  query_embedding extensions.vector(768),
  match_count int,
  full_text_weight float = 1,
  semantic_weight float = 1,
  rrf_k int = 50
)
returns setof documents
language sql
as $$
with full_text as (
  select
    id,
    row_number() over(order by ts_rank_cd(fts, websearch_to_tsquery(query_text)) desc) as rank_ix
  from
    documents
  where
    fts @@ websearch_to_tsquery(query_text)
  order by rank_ix
  limit least(match_count, 30) * 2
),
semantic as (
  select
    id,
    row_number() over (order by embedding <#> query_embedding) as rank_ix
  from
    documents
  order by rank_ix
  limit least(match_count, 30) * 2
)
select
  documents.*
from
  full_text
  full outer join semantic
    on full_text.id = semantic.id
  join documents
    on coalesce(full_text.id, semantic.id) = documents.id
order by
  coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  desc
limit
  least(match_count, 30)
$$;

comment on function hybrid_search is 'Performs hybrid search combining full-text and semantic search using Reciprocal Rank Fusion (RRF)';


-- ============================================================
-- STEP 5: Semantic-only search function
-- Useful if you want a simpler fallback
-- ============================================================
create or replace function semantic_search(
  query_embedding extensions.vector(768),
  match_count int default 10,
  match_threshold float default 0.0
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <#> query_embedding) as similarity
  from
    documents
  where
    1 - (embedding <#> query_embedding) > match_threshold
  order by
    embedding <#> query_embedding
  limit match_count;
$$;

comment on function semantic_search is 'Performs semantic-only search using vector similarity (inner product)';


-- ============================================================
-- STEP 5b: Filtered hybrid search function (by metadata type)
-- ============================================================
create or replace function hybrid_search_filtered(
  query_text text,
  query_embedding extensions.vector(768),
  match_count int,
  filter_type text,
  full_text_weight float = 1,
  semantic_weight float = 1,
  rrf_k int = 50
)
returns setof documents
language sql
as $$
with full_text as (
  select
    id,
    row_number() over(order by ts_rank_cd(fts, websearch_to_tsquery(query_text)) desc) as rank_ix
  from
    documents
  where
    fts @@ websearch_to_tsquery(query_text)
    and metadata->>'type' = filter_type
  order by rank_ix
  limit least(match_count, 30) * 2
),
semantic as (
  select
    id,
    row_number() over (order by embedding <#> query_embedding) as rank_ix
  from
    documents
  where
    metadata->>'type' = filter_type
  order by rank_ix
  limit least(match_count, 30) * 2
)
select
  documents.*
from
  full_text
  full outer join semantic
    on full_text.id = semantic.id
  join documents
    on coalesce(full_text.id, semantic.id) = documents.id
order by
  coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  desc
limit
  least(match_count, 30)
$$;

comment on function hybrid_search_filtered is 'Performs filtered hybrid search by metadata type using Reciprocal Rank Fusion (RRF)';


-- ============================================================
-- STEP 6: Enable Row Level Security (RLS)
-- ============================================================
alter table documents enable row level security;

-- Public read access (adjust based on your needs)
create policy "Documents are publicly readable"
  on documents for select
  using (true);

-- Only authenticated users can insert
create policy "Authenticated users can insert documents"
  on documents for insert
  with check (auth.uid() is not null);

-- Only authenticated users can update
create policy "Authenticated users can update documents"
  on documents for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Only authenticated users can delete
create policy "Authenticated users can delete documents"
  on documents for delete
  using (auth.uid() is not null);

