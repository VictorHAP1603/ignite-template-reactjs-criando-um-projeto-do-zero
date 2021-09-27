import { GetStaticPaths, GetStaticProps, NextApiRequest } from 'next';
import { MdDateRange, MdPerson, MdWatchLater } from 'react-icons/md';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { RichText } from 'prismic-dom'

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {


  const timeOfReading = () => {
    const words = post?.data.content.reduce((acm, word) => {
      acm += ` ${word.heading}`;
      acm += RichText.asText(word.body)
      return acm
    }, '')

    return Math.ceil((words?.split(' ').length) / 200);
  }

  if (!post) return <h1 className={styles.notLoaded}>Carregando...</h1>


  return (
    <main >
      <div className={styles.banner}>
        <img src={post?.data.banner.url} alt="Banner" />
      </div>
      <section className={`${commonStyles.container} ${styles.content}`}>

        <article className={styles.headerContent}>
          <h1>{post?.data.title}</h1>
          <div className="infos">
                <time> <MdDateRange />{post?.first_publication_date}</time>
                <p> <MdPerson />{post?.data.author}</p>
                <p> <MdWatchLater /> {timeOfReading()} min</p>
          </div>
        </article>

        {post.data.content.map((info, index) => (
          <article className={styles.article} key={`article${index}`}>
            <h2>{info.heading}</h2>
            <div dangerouslySetInnerHTML={{__html: RichText.asHtml(info.body) }} />
          </article>
        ))}

      </section>
    </main>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query();

  return {
    fallback: true,
    paths: []
  }
  // TODO
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  // console.log(response.data)

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR
      }
    ),
    data: response.data,
    // content: RichText.asHtml(response.data.content)
  }


  return {
    props: {
      post
    },
    revalidate: 60 * 30
  }

  // TODO
};
