# Сборка из корня репозитория (рядом с go.mod).
# SQLite через modernc — CGO не нужен.
FROM golang:1.24-bookworm AS builder

WORKDIR /src
ENV GOTOOLCHAIN=auto

COPY go.mod go.sum ./
RUN go mod download

COPY backend ./backend

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./backend/cmd/app

FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata \
	&& adduser -D -H -u 65532 app \
	&& mkdir -p /data && chown app:app /data

WORKDIR /data

COPY --from=builder /server /usr/local/bin/server

USER app

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/server"]
