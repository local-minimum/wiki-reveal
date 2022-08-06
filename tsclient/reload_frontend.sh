#!/bin/bash
docker-compose build wiki_reveal_frontend
docker-compose stop wiki_reveal_frontend
docker-compose up -d wiki_reveal_frontend
