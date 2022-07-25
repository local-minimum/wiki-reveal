#!/usr/bin/bash
docker-compose stop wiki_reveal_frontend
docker-compose up -d --build wiki_reveal_frontend
