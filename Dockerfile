FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY --exclude=node_modules/ --exclude=kustomize/ --exclude=terraform/ . /app
WORKDIR /app

RUN pnpm --version


FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build


FROM base AS dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile


FROM base
RUN adduser -D -u 1001 bizaway

COPY --from=build        /app/dist         /app/dist
COPY --from=dependencies /app/node_modules /app/node_modules

USER 1001
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]
