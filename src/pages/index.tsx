import { GetStaticProps } from 'next';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';
import { MdDateRange, MdPerson } from 'react-icons/md'

import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState({
    results: [...results],
    nextPage: next_page
  });

  async function handleMorePosts() {
    if (next_page){
      const nextPosts = await (await fetch(posts.nextPage)).json();

      if (nextPosts.results) {
        setPosts({
          results: [...posts.results, ...nextPosts.results],
          nextPage: nextPosts.next_page,
        });
      }
    }
  }


  return (
    <main>
      <section className={commonStyles.container}>

        {posts.results.map(result => (
          <Link key={result.uid} href={`post/${result.uid}`}>
            <article  className={styles.post}>
              <strong>{result.data.title}</strong>
              <p>{result.data.subtitle}</p>
              <div className={styles.infos}>
                <time> <MdDateRange />{result.first_publication_date}</time>
                <p> <MdPerson />{result.data.author}</p>
              </div>
            </article>
          </Link>
        ))}

        {posts.nextPage !== null ? (
          <button onClick={handleMorePosts} className={styles.morePosts}>
            Carregar mais posts
          </button>
        ): null}

      </section>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
      Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR
        }
      ),
      data: {
        title: post.data?.title,
        subtitle: post.data?.subtitle,
        author: post.data?.author
      }
    }
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page || '',
      }
    },
    revalidate: 60 * 60 * 24 // 1 day
  }
};
