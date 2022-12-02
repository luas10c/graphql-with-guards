import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { queryType, makeSchema } from "nexus";
import { allow, chain, rule, shield } from "graphql-shield";
import { applyMiddleware } from "graphql-middleware";

const isAuthenticated = rule({ cache: "contextual" })(() => {
  return true;
});

const isAdmin = rule({ cache: "no_cache" })((parent, args, ctx, info) => {
  return false;
});

async function bootstrap() {
  const permission = shield({
    Query: {
      welcome: chain(isAuthenticated),
      addProduct: chain(isAdmin),
      hello: allow,
    },
  });

  const Query = queryType({
    definition(t) {
      t.string("welcome", {
        resolve() {
          return `Welcome`;
        },
      });
      t.string("addProduct", {
        resolve() {
          return "addProduct";
        },
      }),
        t.string("hello", {
          resolve() {
            return "Hello";
          },
        });
    },
  });

  const schema = makeSchema({
    types: [Query],
  });

  const server = new ApolloServer({
    schema: applyMiddleware(schema, permission),
    csrfPrevention: true,
  });

  const { url } = await startStandaloneServer(server, {
    listen: {
      port: 4444,
    },
  });
  console.log(url);
}

bootstrap();
