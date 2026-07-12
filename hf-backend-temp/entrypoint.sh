#!/bin/bash
# Note: HF_TOKEN is read automatically from Hugging Face Space Secrets!
DATASET_REPO="CaisterPlayz/caisterplayz-db"

echo "Attempting to download existing database from dataset $DATASET_REPO..."
hf download $DATASET_REPO pb_data.tar.gz --repo-type dataset --local-dir . || echo "No existing database found."

if [ -f pb_data.tar.gz ]; then
    echo "Extracting database backup..."
    tar -xzf pb_data.tar.gz
    rm pb_data.tar.gz
fi

echo "Starting nginx reverse proxy on port 7860..."
nginx

echo "Configuring admin superusers..."
/pb/pocketbase superuser upsert caismoretton@gmail.com "NewStrongPassword123" || true
/pb/pocketbase superuser upsert nexusnpc0@gmail.com "NewStrongPassword123" || true

echo "Starting PocketBase on port 8090 (proxied via nginx)..."
/pb/pocketbase serve --http="0.0.0.0:8090" &
PB_PID=$!

# Background loop to sync the SQLite file to HF Dataset every 5 minutes
while true; do
    sleep 300
    echo "[$(date)] Syncing database to Hugging Face Dataset..."
    tar -czf pb_data.tar.gz pb_data/
    hf upload $DATASET_REPO pb_data.tar.gz pb_data.tar.gz --repo-type dataset --commit-message "Auto-backup $(date)" || echo "Upload failed, will retry next cycle."
done &

wait $PB_PID
