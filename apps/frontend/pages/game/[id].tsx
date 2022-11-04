import { useRouter } from "next/router";
import type { GetStaticProps } from "next";

const Game = () => {
  const router = useRouter();
  const { id } = router.query;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;

  if (!id) {
    return {
      props: {},
    };
  }

  const result = await fetch(`//${process.env.API_HOST}/games/`);

  return {
    props: {},
  };
};

export default Game;
