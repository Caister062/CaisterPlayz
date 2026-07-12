FROM alpine:latest
RUN apk add --no-cache unzip curl bash python3 py3-pip jq nginx

RUN curl -L -o /tmp/pb.zip https://github.com/pocketbase/pocketbase/releases/download/v0.26.6/pocketbase_0.26.6_linux_amd64.zip && \
    unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip && chmod +x /pb/pocketbase

RUN pip install huggingface_hub --break-system-packages

WORKDIR /pb
COPY pb_migrations /pb/pb_migrations/
COPY pb_public /pb/pb_public/
COPY pb_hooks /pb/pb_hooks/
COPY entrypoint.sh /pb/entrypoint.sh
COPY nginx.conf /etc/nginx/http.d/default.conf
RUN chmod +x /pb/entrypoint.sh

EXPOSE 7860
ENTRYPOINT ["/pb/entrypoint.sh"]
